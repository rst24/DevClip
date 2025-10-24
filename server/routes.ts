import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { openai, AI_MODEL, MAX_TOKENS } from "./openai";
import { 
  formatJson, 
  formatYaml, 
  formatSql, 
  stripAnsi, 
  logToMarkdown 
} from "./formatters";
import {
  formatRequestSchema,
  aiRequestSchema,
  createSubscriptionSchema,
  insertClipboardItemSchema,
  insertFeedbackSchema,
  migrateLocalDataSchema,
} from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import v1Router from "./routes/v1";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Stripe Price IDs
const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;
const STRIPE_TEAM_PRICE_ID = process.env.STRIPE_TEAM_PRICE_ID;

if (!STRIPE_PRO_PRICE_ID || !STRIPE_TEAM_PRICE_ID) {
  throw new Error('Missing Stripe price IDs: STRIPE_PRO_PRICE_ID and STRIPE_TEAM_PRICE_ID required');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  
  // CORS middleware for browser extension
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ========== AUTH ROUTES ==========
  // Replit Auth routes are handled by replitAuth.ts
  // /api/login, /api/callback, /api/logout
  
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Migrate localStorage data to database after login
  app.post("/api/migrate-local-data", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = migrateLocalDataSchema.parse(req.body);
      
      // Migrate clipboard items
      const itemsToCreate = data.clipboardItems.map(item => ({
        userId,
        content: item.content,
        contentType: item.contentType,
        formatted: item.formatted,
        favorite: item.favorite || false,
      }));
      
      const createdItems = await storage.createClipboardItemsBulk(itemsToCreate);
      
      res.json({ 
        message: "Data migrated successfully",
        itemsCreated: createdItems.length 
      });
    } catch (error: any) {
      console.error("Error migrating data:", error);
      res.status(500).json({ message: "Failed to migrate data" });
    }
  });

  // ========== FORMAT ROUTES (No auth required - runs locally) ==========
  app.post("/api/format", async (req, res) => {
    try {
      const data = formatRequestSchema.parse(req.body);
      
      let result: string;
      switch (data.format) {
        case "json":
          result = formatJson(data.text);
          break;
        case "yaml":
          result = formatYaml(data.text);
          break;
        case "sql":
          result = formatSql(data.text);
          break;
        case "ansi-clean":
          result = stripAnsi(data.text);
          break;
        case "log-to-markdown":
          result = logToMarkdown(data.text);
          break;
        default:
          return res.status(400).json({ message: "Unknown format type" });
      }
      
      res.json({ result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ========== AI ROUTES (Requires auth + credits) ==========
  app.post("/api/v1/ai/process", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = aiRequestSchema.parse(req.body);
      
      // Check user credits
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate credit cost based on operation
      const creditCosts: Record<string, number> = {
        explain: 1,
        summarize: 2,
        refactor: 3,
      };
      const creditsRequired = creditCosts[data.operation] || 1;
      
      if (user.aiCreditsBalance < creditsRequired) {
        return res.status(402).json({ 
          message: "Insufficient credits",
          creditsRequired,
          creditsBalance: user.aiCreditsBalance,
          upgradeUrl: "/upgrade"
        });
      }
      
      // Call OpenAI
      const systemPrompts: Record<string, string> = {
        explain: "You are a helpful code assistant. Explain the following code or text clearly and concisely.",
        summarize: "You are a helpful assistant. Summarize the following text in a clear and concise way.",
        refactor: "You are an expert code reviewer. Suggest improvements and refactor the following code. Provide clean, optimized code."
      };
      
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: systemPrompts[data.operation] },
          { role: "user", content: data.text }
        ],
      });
      
      const result = completion.choices[0]?.message?.content || "No result";
      const tokensUsed = completion.usage?.total_tokens || 0;
      
      // Estimate cost (rough: $0.002-$0.006 per operation)
      const estimatedCostCents = Math.ceil(tokensUsed * 0.00001 * 100); // Convert to cents
      
      // Deduct credits
      await storage.deductCredits(userId, creditsRequired);
      
      // Log AI operation
      await storage.createAiOperation({
        userId,
        operationType: data.operation,
        inputText: data.text,
        outputText: result,
        tokensUsed,
        creditsUsed: creditsRequired,
        estimatedCost: estimatedCostCents,
      });
      
      res.json({ result, creditsUsed: creditsRequired });
    } catch (error: any) {
      if (error.message === "Insufficient credits") {
        return res.status(402).json({ message: error.message });
      }
      console.error("AI processing error:", error);
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  // ========== CLIPBOARD HISTORY ROUTES (Requires auth) ==========
  app.get("/api/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const items = await storage.getClipboardItems(userId, limit);
      res.json(items);
    } catch (error: any) {
      console.error("Error fetching history:", error);
      res.status(500).json({ message: "Failed to fetch clipboard history" });
    }
  });

  app.post("/api/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertClipboardItemSchema.parse(req.body);
      
      const item = await storage.createClipboardItem({
        ...data,
        userId,
      });
      
      res.json(item);
    } catch (error: any) {
      console.error("Error creating clipboard item:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/history/:id/favorite", isAuthenticated, async (req: any, res) => {
    try {
      const item = await storage.toggleFavorite(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  app.delete("/api/history/:id", isAuthenticated, async (req: any, res) => {
    try {
      const success = await storage.deleteClipboardItem(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json({ message: "Deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // ========== BILLING ROUTES (Requires auth) ==========
  app.post("/api/billing/create-subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = createSubscriptionSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create or retrieve Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId },
        });
        customerId = customer.id;
      }
      
      // Select price ID based on plan and billing interval
      let priceId: string;
      if (data.plan === "pro") {
        priceId = data.billingInterval === "year" 
          ? process.env.STRIPE_PRO_YEARLY_PRICE_ID || STRIPE_PRO_PRICE_ID!
          : STRIPE_PRO_PRICE_ID!;
      } else {
        priceId = data.billingInterval === "year"
          ? process.env.STRIPE_TEAM_YEARLY_PRICE_ID || STRIPE_TEAM_PRICE_ID!
          : STRIPE_TEAM_PRICE_ID!;
      }
      
      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        success_url: `${req.headers.origin || 'http://localhost:5000'}?checkout=success`,
        cancel_url: `${req.headers.origin || 'http://localhost:5000'}?checkout=cancel`,
        metadata: {
          userId,
          plan: data.plan,
        },
      });
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/billing/portal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ message: "No billing information found" });
      }
      
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: req.headers.origin || 'http://localhost:5000',
      });
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Billing portal error:", error);
      res.status(500).json({ message: "Failed to create portal session" });
    }
  });

  // Stripe webhook
  app.post("/api/webhooks/stripe", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      return res.status(400).send('No signature');
    }
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const plan = session.metadata?.plan;
          
          if (userId && plan && session.customer) {
            await storage.updateUserPlan(
              userId,
              plan,
              session.customer as string,
              session.subscription as string
            );
            
            // Log conversion event
            await storage.logConversionEvent(userId, `upgrade_${plan}`, {
              stripeSessionId: session.id,
            });
          }
          break;
        }
        
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          const user = await storage.getUserByStripeCustomerId(customerId);
          if (user) {
            const newPlan = subscription.status === 'active' 
              ? (subscription.items.data[0]?.price.id === STRIPE_TEAM_PRICE_ID ? 'team' : 'pro')
              : 'free';
            
            await storage.updateUserPlan(user.id, newPlan);
          }
          break;
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  });

  // ========== FEEDBACK ROUTES ==========
  app.post("/api/feedback", async (req, res) => {
    try {
      const data = insertFeedbackSchema.parse(req.body);
      const fb = await storage.createFeedback(data);
      res.json(fb);
    } catch (error: any) {
      console.error("Error creating feedback:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // ========== API V1 ROUTES (for browser extension and external integrations) ==========
  app.use("/api/v1", v1Router);

  const httpServer = createServer(app);
  return httpServer;
}
