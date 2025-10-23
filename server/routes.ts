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
  loginSchema,
  signupSchema,
} from "@shared/schema";
import { comparePassword } from "./auth";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
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
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Create user
      const user = await storage.createUser(data);
      
      // Set session
      req.session.userId = user.id;
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check password
      const isValid = await comparePassword(data.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Authentication middleware
  function requireAuth(req: any, res: any, next: any) {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  }

  // ========== FORMAT ROUTES ==========
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

  // ========== AI ROUTES ==========
  app.post("/api/v1/ai/process", requireAuth, async (req, res) => {
    try {
      const data = aiRequestSchema.parse(req.body);
      const userId = req.session.userId!;
      
      // Get user and check credits
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.plan === "free") {
        return res.status(403).json({ message: "AI features require Pro or Team plan" });
      }
      
      // Credit costs per operation
      const creditCosts: Record<string, number> = {
        explain: 2,
        refactor: 3,
        summarize: 2,
      };
      
      const cost = creditCosts[data.operation] || 2;
      if (user.aiCredits < cost) {
        return res.status(403).json({ 
          message: `Insufficient credits. Need ${cost}, have ${user.aiCredits}` 
        });
      }
      
      // Build prompt based on operation
      let systemPrompt = "";
      let userPrompt = "";
      
      switch (data.operation) {
        case "explain":
          systemPrompt = "You are a code explanation expert. Provide clear, concise explanations of code functionality.";
          userPrompt = `Explain this code in simple terms:\n\n${data.text}`;
          break;
        case "refactor":
          systemPrompt = "You are a code refactoring expert. Suggest improvements for code quality, readability, and performance.";
          userPrompt = `Suggest refactoring improvements for this code:\n\n${data.text}`;
          break;
        case "summarize":
          systemPrompt = "You are a log analysis expert. Summarize logs, highlighting errors, warnings, and key events.";
          userPrompt = `Summarize these logs:\n\n${data.text}`;
          break;
      }
      
      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: MAX_TOKENS,
      });
      
      const result = completion.choices[0]?.message?.content || "No response generated";
      const tokensUsed = completion.usage?.total_tokens || 0;
      
      // Deduct credits
      await storage.updateUserCredits(userId, user.aiCredits - cost);
      
      // Log AI operation
      await storage.createAiOperation({
        userId,
        operationType: data.operation,
        inputText: data.text.substring(0, 1000), // Store truncated version
        outputText: result.substring(0, 1000),
        tokensUsed,
      });
      
      res.json({ 
        result, 
        creditsUsed: cost, 
        creditsRemaining: user.aiCredits - cost 
      });
      
    } catch (error: any) {
      console.error("AI processing error:", error);
      res.status(500).json({ message: error.message || "AI processing failed" });
    }
  });

  // ========== CLIPBOARD ROUTES ==========
  app.get("/api/history", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const items = await storage.getClipboardItems(userId, limit);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/history", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const data = insertClipboardItemSchema.parse({
        ...req.body,
        userId,
      });
      
      const item = await storage.createClipboardItem(data);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/history/:id/favorite", requireAuth, async (req, res) => {
    try {
      const item = await storage.toggleFavorite(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/history/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteClipboardItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== BILLING ROUTES ==========
  app.post("/api/billing/create-subscription", requireAuth, async (req, res) => {
    try {
      const data = createSubscriptionSchema.parse(req.body);
      const userId = req.session.userId!;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create or retrieve Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id },
        });
        customerId = customer.id;
      }
      
      // Price IDs (in production, these would be from Stripe dashboard)
      const priceIds: Record<string, string> = {
        pro: "price_pro_monthly", // Placeholder - would be real Stripe price ID
        team: "price_team_monthly",
      };
      
      const priceId = priceIds[data.plan];
      if (!priceId) {
        return res.status(400).json({ message: "Invalid plan" });
      }
      
      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Update user in storage
      await storage.updateUserPlan(
        userId,
        data.plan,
        customerId,
        subscription.id
      );
      
      const invoice = subscription.latest_invoice as any;
      const clientSecret = invoice?.payment_intent?.client_secret;
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret,
      });
      
    } catch (error: any) {
      console.error("Subscription creation error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/billing/portal", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No billing account found" });
      }
      
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${req.headers.origin || 'http://localhost:5000'}/settings`,
      });
      
      res.json({ url: session.url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== TELEMETRY ROUTE ==========
  app.post("/api/telemetry", async (req, res) => {
    try {
      // Anonymous telemetry - just log and acknowledge
      console.log("Telemetry event:", req.body);
      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ========== FEEDBACK ROUTE ==========
  app.post("/api/feedback", async (req, res) => {
    try {
      const userId = req.body.userId || null; // Optional user ID
      const data = insertFeedbackSchema.parse({
        ...req.body,
        userId,
      });
      
      const feedback = await storage.createFeedback(data);
      res.json(feedback);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
