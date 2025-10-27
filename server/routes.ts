import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import archiver from "archiver";
import path from "path";
import { storage } from "./storage";
import { openai, getModelForPlan, MAX_COMPLETION_TOKENS, generateEmbedding } from "./openai";
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
  type User,
} from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { requireAdmin } from "./adminMiddleware";
import v1Router from "./routes/v1";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
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

  // Extension download
  app.get("/api/download/extension", async (req, res) => {
    try {
      const extensionPath = path.join(process.cwd(), 'extension');
      
      // Check if extension directory exists
      const fs = await import('fs/promises');
      try {
        await fs.access(extensionPath);
      } catch (err) {
        console.error('Extension directory not found:', extensionPath);
        return res.status(404).json({ message: 'Extension files not available' });
      }

      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      // Register error handler before piping to catch all errors
      archive.on('error', (err) => {
        console.error('Archive error during extension download:', err);
        // Destroy the stream to prevent partial downloads
        archive.destroy();
        if (!res.headersSent) {
          res.status(500).json({ message: 'Failed to create extension archive' });
        }
      });

      // Set download headers
      res.attachment('devclip-extension.zip');
      res.setHeader('Content-Type', 'application/zip');

      // Pipe archive to response
      archive.pipe(res);

      // Add extension files to archive
      archive.directory(extensionPath, false);

      // Finalize the archive
      await archive.finalize();
      
      console.log('Extension download completed successfully');
    } catch (error: any) {
      console.error('Extension download error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to download extension' });
      }
    }
  });

  // ========== AUTH ROUTES ==========
  // Replit Auth routes are handled by replitAuth.ts
  // /api/login, /api/callback, /api/logout
  
  // API Key to Session Login - for browser extension auto-login
  app.get("/api/auth/api-login", async (req: any, res) => {
    try {
      const apiKey = req.query.key as string;
      
      if (!apiKey || !apiKey.startsWith("devclip_")) {
        return res.status(400).send("Invalid or missing API key");
      }
      
      // Validate API key
      const keyRecord = await storage.getApiKeyByKey(apiKey);
      if (!keyRecord || keyRecord.revokedAt) {
        return res.status(401).send("Invalid or revoked API key");
      }
      
      // Get user
      const user = await storage.getUser(keyRecord.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      // Create session manually (simulate OAuth login)
      req.login({
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          profile_image_url: user.profileImageUrl,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 1 week
        },
        access_token: "api-key-session", // Placeholder
        refresh_token: null,
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
      }, (err: any) => {
        if (err) {
          console.error("Session creation error:", err);
          return res.status(500).send("Failed to create session");
        }
        
        // Update API key last used
        storage.updateApiKeyLastUsed(keyRecord.id);
        
        // Redirect to dashboard
        res.redirect("/?tab=settings");
      });
    } catch (error: any) {
      console.error("API login error:", error);
      res.status(500).send("Auto-login failed");
    }
  });
  
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Prevent caching of user data to ensure subscription updates are reflected immediately
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
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
      
      // Calculate token cost based on operation
      const tokenCosts: Record<string, number> = {
        explain: 3,
        summarize: 2,
        refactor: 1,
      };
      const tokensRequired = tokenCosts[data.operation] || 1;
      
      if (user.tokenBalance < tokensRequired) {
        return res.status(402).json({ 
          message: "Insufficient tokens",
          tokensRequired,
          tokenBalance: user.tokenBalance,
          upgradeUrl: "/upgrade"
        });
      }
      
      // Enhanced AI prompts for better product value
      const systemPrompts: Record<string, string> = {
        explain: `You are a senior software engineer who excels at teaching. Provide a comprehensive explanation of the code following this structure:

**Overview**: Brief summary of what the code does (1-2 sentences)

**How It Works**: Step-by-step explanation of the logic

**Key Concepts**: Important patterns, algorithms, or techniques used

**Potential Issues**: Any edge cases, bugs, or areas of concern

**Best Practices**: Suggestions for improvement (if applicable)

Be clear, concise, and use examples where helpful. Format your response in markdown.`,

        summarize: `You are a log analysis expert. Analyze the following logs and provide a structured summary:

**Severity Breakdown**:
- 🔴 Critical Errors: [count] - [brief description]
- ⚠️  Warnings: [count] - [brief description]
- ℹ️  Info: [count] - [brief description]

**Key Findings**:
[List 3-5 most important discoveries]

**Timeline**:
[When did issues occur? Any patterns?]

**Actionable Insights**:
[Specific recommendations to fix issues]

Be specific and actionable. Format your response in markdown.`,

        refactor: `You are an expert code reviewer. Analyze the code and provide improvements in this structure:

**Issues Found**:
[List specific problems: performance, security, readability, bugs]

**Suggested Changes**:
\`\`\`
[Provide the refactored code here - clean, optimized, with comments]
\`\`\`

**Improvements Made**:
- [List specific improvements with brief explanations]

**Why This Is Better**:
[Explain the benefits of these changes]

Be specific and practical. Format your response in markdown with proper code blocks.`
      };
      
      // Use tier-specific AI model based on user's plan
      const model = getModelForPlan(user.plan as "free" | "pro" | "team");
      
      const completion = await openai.chat.completions.create({
        model,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        messages: [
          { role: "system", content: systemPrompts[data.operation] },
          { role: "user", content: data.text }
        ],
      });
      
      const result = completion.choices[0]?.message?.content || "No result";
      const apiTokensUsed = completion.usage?.total_tokens || 0;
      
      // Estimate cost (rough: $0.002-$0.006 per operation)
      const estimatedCostCents = Math.ceil(apiTokensUsed * 0.00001 * 100); // Convert to cents
      
      // Deduct tokens
      await storage.deductTokens(userId, tokensRequired);
      
      // Log AI operation
      await storage.createAiOperation({
        userId,
        operationType: data.operation,
        inputText: data.text,
        outputText: result,
        apiTokensUsed,
        tokensCharged: tokensRequired,
        estimatedCost: estimatedCostCents,
      });
      
      res.json({ result, tokensCharged: tokensRequired });
    } catch (error: any) {
      if (error.message === "Insufficient tokens") {
        return res.status(402).json({ message: error.message });
      }
      console.error("AI processing error - Full details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        error: error
      });
      res.status(500).json({ 
        message: "Failed to process AI request",
        error: error.message,
        details: error.toString()
      });
    }
  });

  // ========== API KEY MANAGEMENT ROUTES (Requires auth) ==========
  app.post("/api/keys/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: "Key name is required" });
      }
      
      // Check user's plan and enforce API key limits
      const user = await storage.getUser(userId);
      const plan = user?.plan || 'free';
      
      // Free tier cannot generate API keys
      if (plan === 'free') {
        return res.status(403).json({ 
          message: "API keys are only available on Pro and Team plans",
          upgradeRequired: true,
          plan: 'free'
        });
      }
      
      // Check current active key count
      const existingKeys = await storage.getApiKeys(userId);
      const activeKeys = existingKeys.filter(k => !k.revokedAt);
      
      // Pro tier: max 6 API keys
      if (plan === 'pro' && activeKeys.length >= 6) {
        return res.status(403).json({ 
          message: "Pro plan limit: 6 API keys maximum. Revoke an existing key or upgrade to Team plan.",
          upgradeRequired: true,
          plan: 'pro',
          currentCount: activeKeys.length,
          maxAllowed: 6
        });
      }
      
      // Team tier: unlimited (no check needed)
      
      // Generate new API key (storage.createApiKey generates the key internally)
      const newKey = await storage.createApiKey(userId, name.trim());
      
      // Return the key once (user must save it)
      res.json({ 
        id: newKey.id,
        name: newKey.name,
        key: newKey.key,
        createdAt: newKey.createdAt,
        message: "Save this key securely - it won't be shown again"
      });
    } catch (error: any) {
      console.error("Error generating API key:", error);
      res.status(500).json({ message: "Failed to generate API key" });
    }
  });

  app.get("/api/keys", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const keys = await storage.getApiKeys(userId);
      
      // Mask the keys for security (show only last 4 chars)
      const maskedKeys = keys.map(k => ({
        id: k.id,
        name: k.name,
        keyPreview: `***${k.key.slice(-4)}`,
        createdAt: k.createdAt,
        lastUsed: k.lastUsed,
        revokedAt: k.revokedAt,
      }));
      
      res.json(maskedKeys);
    } catch (error: any) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.delete("/api/keys/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const keyId = req.params.id;
      
      if (!keyId) {
        return res.status(400).json({ message: "Invalid key ID" });
      }
      
      // Verify key belongs to user before revoking
      const keys = await storage.getApiKeys(userId);
      const keyToRevoke = keys.find(k => k.id === keyId);
      
      if (!keyToRevoke) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      if (keyToRevoke.revokedAt) {
        return res.status(400).json({ message: "API key already revoked" });
      }
      
      await storage.revokeApiKey(keyId);
      res.json({ message: "API key revoked successfully" });
    } catch (error: any) {
      console.error("Error revoking API key:", error);
      res.status(500).json({ message: "Failed to revoke API key" });
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

  // Semantic search (session-based auth for web app)
  app.post("/api/memory/search", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query, limit = 10 } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required" });
      }
      
      // Get user to check subscription tier
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only Pro and Team users can use semantic search
      if (user.plan === 'free') {
        return res.status(403).json({ 
          message: "Semantic search requires Pro or Team subscription",
          requiresUpgrade: true 
        });
      }
      
      // Check token balance (10 tokens for semantic search)
      const SEARCH_TOKEN_COST = 10;
      if (user.tokenBalance < SEARCH_TOKEN_COST) {
        return res.status(402).json({ 
          message: "Insufficient tokens. Please upgrade or wait for next month's allocation.",
          tokensRequired: SEARCH_TOKEN_COST,
          tokensAvailable: user.tokenBalance
        });
      }
      
      // Generate embedding for search query
      const queryEmbedding = await generateEmbedding(query);
      
      // Execute pgvector search
      const results = await storage.searchClipboardItemsByEmbedding(
        userId,
        queryEmbedding,
        Math.min(limit, 50) // Cap at 50
      );
      
      // Deduct tokens
      await storage.updateTokenBalance(userId, -SEARCH_TOKEN_COST);
      
      res.json({
        query,
        results,
        tokensUsed: SEARCH_TOKEN_COST
      });
      
    } catch (error: any) {
      console.error("Error in semantic search:", error);
      res.status(500).json({ message: "Search failed" });
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
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let customerId = user.stripeCustomerId;
      
      // Create Stripe customer on-the-fly if missing
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateUserPlan(userId, user.plan, customerId);
      }
      
      // Create billing portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: req.headers.origin || 'http://localhost:5000',
      });
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Billing portal error:", error);
      
      // Handle specific Stripe errors
      if (error.type === 'StripeInvalidRequestError') {
        if (error.code === 'resource_missing') {
          return res.status(404).json({ 
            message: "Billing account not found. Please contact support." 
          });
        }
        return res.status(400).json({ 
          message: error.message || "Invalid billing request" 
        });
      }
      
      res.status(500).json({ message: "Failed to open billing portal" });
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

  // ========== ANALYTICS ROUTES ==========
  app.get("/api/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // operations are already sorted by createdAt DESC from storage
      const operations = await storage.getAiOperations(userId);
      
      // Calculate summary stats
      const totalOperations = operations.length;
      const totalTokensUsed = operations.reduce((sum, op) => sum + op.tokensCharged, 0);
      
      // Group by operation type
      const byType: Record<string, { count: number; tokens: number }> = {};
      operations.forEach(op => {
        if (!byType[op.operationType]) {
          byType[op.operationType] = { count: 0, tokens: 0 };
        }
        byType[op.operationType].count++;
        byType[op.operationType].tokens += op.tokensCharged;
      });
      
      // Generate complete 30-day time series with zero-fill
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // Include today = 30 days
      
      // Initialize all 30 days with zeros
      const dailyData: Record<string, { date: string; operations: number; tokens: number }> = {};
      for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        dailyData[dateKey] = { date: dateKey, operations: 0, tokens: 0 };
      }
      
      // Fill in actual data
      operations.forEach(op => {
        const opDate = new Date(op.createdAt);
        opDate.setHours(0, 0, 0, 0);
        if (opDate >= thirtyDaysAgo && opDate <= now) {
          const dateKey = opDate.toISOString().split('T')[0];
          if (dailyData[dateKey]) {
            dailyData[dateKey].operations++;
            dailyData[dateKey].tokens += op.tokensCharged;
          }
        }
      });
      
      // Convert to sorted array (chronological order)
      const dailyTimeSeries = Object.values(dailyData).sort((a, b) => 
        a.date.localeCompare(b.date)
      );
      
      res.json({
        summary: {
          totalOperations,
          totalTokensUsed,
          averageTokensPerOperation: totalOperations > 0 
            ? (totalTokensUsed / totalOperations).toFixed(2) 
            : 0,
        },
        byOperationType: Object.entries(byType).map(([type, data]) => ({
          operationType: type,
          count: data.count,
          tokens: data.tokens,
        })),
        dailyTimeSeries, // Complete 30 days with zero-fill
        recentOperations: operations.slice(0, 10), // Already sorted DESC by createdAt
      });
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Track conversion events (analytics)
  app.post("/api/analytics/track", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventType, metadata } = req.body;
      
      if (!eventType || typeof eventType !== 'string') {
        return res.status(400).json({ message: "Invalid event type" });
      }
      
      await storage.logConversionEvent(userId, eventType, metadata);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error tracking event:", error);
      res.status(500).json({ message: "Failed to track event" });
    }
  });

  // ========== ADMIN ROUTES (for admin panel) ==========
  
  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Return users with sensitive data removed
      const sanitizedUsers = users.map((user: User) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        tokenBalance: user.tokenBalance,
        tokensUsed: user.tokensUsed,
        tokenCarryover: user.tokenCarryover,
        isAdmin: user.isAdmin,
        stripeCustomerId: user.stripeCustomerId,
        createdAt: user.createdAt,
      }));
      
      res.json(sanitizedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user credits (admin only)
  app.patch("/api/admin/users/:id/credits", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { tokenBalance } = req.body;

      if (typeof tokenBalance !== 'number' || tokenBalance < 0) {
        return res.status(400).json({ message: "Invalid token amount" });
      }

      const updatedUser = await storage.updateUserTokens(id, tokenBalance);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        message: "Credits updated successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          tokenBalance: updatedUser.tokenBalance,
        }
      });
    } catch (error: any) {
      console.error("Error updating credits:", error);
      res.status(500).json({ message: "Failed to update credits" });
    }
  });

  // Grant/revoke admin access (admin only)
  app.patch("/api/admin/users/:id/admin", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isAdmin } = req.body;

      if (typeof isAdmin !== 'boolean') {
        return res.status(400).json({ message: "Invalid admin status" });
      }

      const updatedUser = await storage.updateUserAdminStatus(id, isAdmin);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        message: `Admin access ${isAdmin ? 'granted' : 'revoked'} successfully`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
        }
      });
    } catch (error: any) {
      console.error("Error updating admin status:", error);
      res.status(500).json({ message: "Failed to update admin status" });
    }
  });

  // Get platform statistics (admin only)
  app.get("/api/admin/stats", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const totalUsers = users.length;
      const freeUsers = users.filter((u: User) => u.plan === 'free').length;
      const proUsers = users.filter((u: User) => u.plan === 'pro').length;
      const teamUsers = users.filter((u: User) => u.plan === 'team').length;
      
      // Calculate total tokens distributed
      const totalTokens = users.reduce((sum: number, u: User) => sum + (u.tokenBalance || 0), 0);
      const totalTokensUsed = users.reduce((sum: number, u: User) => sum + (u.tokensUsed || 0), 0);

      res.json({
        users: {
          total: totalUsers,
          free: freeUsers,
          pro: proUsers,
          team: teamUsers,
        },
        tokens: {
          total: totalTokens,
          used: totalTokensUsed,
          remaining: totalTokens - totalTokensUsed,
        },
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // ========== API V1 ROUTES (for browser extension and external integrations) ==========
  app.use("/api/v1", v1Router);

  const httpServer = createServer(app);
  return httpServer;
}
