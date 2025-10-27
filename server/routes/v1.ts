import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticateApiKey, type ApiKeyRequest } from "../middleware/authenticateApiKey";
import { storage } from "../storage";
import { formatJson, formatYaml, formatSql, stripAnsi, logToMarkdown } from "../formatters";
import { generateEmbedding, extractTags, cosineSimilarity } from "../openai";

const router = Router();

// Formatter endpoint schema
const formatRequestSchema = z.object({
  text: z.string().min(1).max(100000), // Max 100KB of text
  operation: z.enum(["json", "yaml", "sql", "ansi-strip", "log-to-markdown"]),
});

// AI request schema
const aiRequestSchema = z.object({
  text: z.string().min(1).max(10000), // Max 10KB for AI operations
  operation: z.enum(["explain", "refactor", "summarize"]),
});

// POST /api/v1/format - Format text using local formatters
router.post("/format", authenticateApiKey, async (req: ApiKeyRequest, res: Response) => {
  try {
    const validation = formatRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid request body",
        details: validation.error.errors,
      });
    }

    const { text, operation } = validation.data;
    const user = req.apiUser!;

    // Check if user has sufficient tokens (1 token for formatters)
    const tokenCost = 1;
    if (user.tokenBalance < tokenCost) {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient tokens",
        tokensRequired: tokenCost,
        tokensAvailable: user.tokenBalance,
      });
    }

    // Apply formatter
    let result: string;
    try {
      switch (operation) {
        case "json":
          result = formatJson(text);
          break;
        case "yaml":
          result = formatYaml(text);
          break;
        case "sql":
          result = formatSql(text);
          break;
        case "ansi-strip":
          result = stripAnsi(text);
          break;
        case "log-to-markdown":
          result = logToMarkdown(text);
          break;
        default:
          return res.status(400).json({
            error: "Invalid Operation",
            message: `Unknown operation: ${operation}`,
          });
      }
    } catch (formatError) {
      return res.status(400).json({
        error: "Format Error",
        message: formatError instanceof Error ? formatError.message : "Formatting failed",
      });
    }

    // Deduct tokens and update cached user
    const updatedUser = await storage.deductTokens(user.id, tokenCost);
    req.apiUser = updatedUser;

    return res.status(200).json({
      success: true,
      operation,
      result,
      tokensUsed: tokenCost,
      tokensRemaining: updatedUser.tokenBalance,
    });
  } catch (error) {
    console.error("[API v1 /format error]", error);
    
    if (error instanceof Error && error.message === "Insufficient tokens") {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient tokens",
      });
    }
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to process format request",
    });
  }
});

// POST /api/v1/ai/explain - Explain code using AI
router.post("/ai/explain", authenticateApiKey, async (req: ApiKeyRequest, res: Response) => {
  try {
    const validation = aiRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid request body",
        details: validation.error.errors,
      });
    }

    const { text } = validation.data;
    const user = req.apiUser!;

    // Check if user has sufficient tokens (3 tokens for explain)
    const tokenCost = 3;
    if (user.tokenBalance < tokenCost) {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient tokens",
        tokensRequired: tokenCost,
        tokensAvailable: user.tokenBalance,
      });
    }

    // Call AI service with tier-specific model
    const { processAiRequest } = await import("../ai");
    const { getModelForPlan } = await import("../openai");
    const model = getModelForPlan(user.plan as "free" | "pro" | "team");
    const result = await processAiRequest(text, "explain", model);

    // Deduct tokens and update cached user
    const updatedUser = await storage.deductTokens(user.id, tokenCost);
    req.apiUser = updatedUser;
    
    await storage.createAiOperation({
      userId: user.id,
      operationType: "explain",
      inputText: text.substring(0, 1000), // Store truncated version
      outputText: result.substring(0, 1000),
      apiTokensUsed: 0, // Would be populated from OpenAI response
      tokensCharged: tokenCost,
    });

    return res.status(200).json({
      success: true,
      operation: "explain",
      result,
      tokensUsed: tokenCost,
      tokensRemaining: updatedUser.tokenBalance,
    });
  } catch (error) {
    console.error("[API v1 /ai/explain error]", error);
    
    if (error instanceof Error && error.message === "Insufficient tokens") {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient tokens",
      });
    }
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to process AI request",
    });
  }
});

// POST /api/v1/ai/refactor - Refactor code using AI
router.post("/ai/refactor", authenticateApiKey, async (req: ApiKeyRequest, res: Response) => {
  try {
    const validation = aiRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid request body",
        details: validation.error.errors,
      });
    }

    const { text } = validation.data;
    const user = req.apiUser!;

    const tokenCost = 1; // Refactoring costs 1 token
    if (user.tokenBalance < tokenCost) {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient tokens",
        tokensRequired: tokenCost,
        tokensAvailable: user.tokenBalance,
      });
    }

    // Call AI service with tier-specific model
    const { processAiRequest } = await import("../ai");
    const { getModelForPlan } = await import("../openai");
    const model = getModelForPlan(user.plan as "free" | "pro" | "team");
    const result = await processAiRequest(text, "refactor", model);

    // Deduct tokens and update cached user
    const updatedUser = await storage.deductTokens(user.id, tokenCost);
    req.apiUser = updatedUser;
    
    await storage.createAiOperation({
      userId: user.id,
      operationType: "refactor",
      inputText: text.substring(0, 1000),
      outputText: result.substring(0, 1000),
      apiTokensUsed: 0,
      tokensCharged: tokenCost,
    });

    return res.status(200).json({
      success: true,
      operation: "refactor",
      result,
      tokensUsed: tokenCost,
      tokensRemaining: updatedUser.tokenBalance,
    });
  } catch (error) {
    console.error("[API v1 /ai/refactor error]", error);
    
    if (error instanceof Error && error.message === "Insufficient tokens") {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient tokens",
      });
    }
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to process AI request",
    });
  }
});

// POST /api/v1/ai/summarize - Summarize logs using AI
router.post("/ai/summarize", authenticateApiKey, async (req: ApiKeyRequest, res: Response) => {
  try {
    const validation = aiRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid request body",
        details: validation.error.errors,
      });
    }

    const { text } = validation.data;
    const user = req.apiUser!;

    const tokenCost = 2; // Summarization costs 2 tokens
    if (user.tokenBalance < tokenCost) {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient tokens",
        tokensRequired: tokenCost,
        tokensAvailable: user.tokenBalance,
      });
    }

    // Call AI service with tier-specific model
    const { processAiRequest } = await import("../ai");
    const { getModelForPlan } = await import("../openai");
    const model = getModelForPlan(user.plan as "free" | "pro" | "team");
    const result = await processAiRequest(text, "summarize", model);

    // Deduct tokens and update cached user
    const updatedUser = await storage.deductTokens(user.id, tokenCost);
    req.apiUser = updatedUser;
    
    await storage.createAiOperation({
      userId: user.id,
      operationType: "summarize",
      inputText: text.substring(0, 1000),
      outputText: result.substring(0, 1000),
      apiTokensUsed: 0,
      tokensCharged: tokenCost,
    });

    return res.status(200).json({
      success: true,
      operation: "summarize",
      result,
      tokensUsed: tokenCost,
      tokensRemaining: updatedUser.tokenBalance,
    });
  } catch (error) {
    console.error("[API v1 /ai/summarize error]", error);
    
    if (error instanceof Error && error.message === "Insufficient tokens") {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient tokens",
      });
    }
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to process AI request",
    });
  }
});

// Memory endpoint schemas
const memorySaveSchema = z.object({
  content: z.string().min(1).max(100000), // Max 100KB of code
  language: z.string().optional(), // Programming language (auto-detected if not provided)
  tags: z.array(z.string()).optional(), // Manual tags (AI will add more)
  isShared: z.boolean().optional(), // Share with team
});

const memorySearchSchema = z.object({
  query: z.string().min(1).max(500), // Natural language search query
  limit: z.number().min(1).max(50).optional().default(10), // Result limit
});

// POST /api/v1/memory/save - Save code snippet with AI tagging and embeddings
router.post("/memory/save", authenticateApiKey, async (req: ApiKeyRequest, res: Response) => {
  try {
    const validation = memorySaveSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid request body",
        details: validation.error.errors,
      });
    }

    const { content, language, tags: manualTags, isShared } = validation.data;
    const user = req.apiUser!;

    // Generate embedding for semantic search (Pro/Team only)
    let embedding: number[] | null = null;
    if (user.plan !== "free") {
      try {
        embedding = await generateEmbedding(content);
      } catch (error) {
        console.error("Embedding generation failed:", error);
        // Continue without embedding - it's optional
      }
    }

    // Extract AI-generated tags (Pro/Team only)
    let aiTags: string[] = [];
    if (user.plan !== "free") {
      try {
        aiTags = await extractTags(content, language);
      } catch (error) {
        console.error("Tag extraction failed:", error);
        // Continue without AI tags
      }
    }

    // Combine manual and AI tags, remove duplicates
    const allTags = Array.from(new Set([...(manualTags || []), ...aiTags]));

    // Save to memory
    const clipboardItem = await storage.createClipboardItem({
      userId: user.id,
      content,
      contentType: "code",
      formatted: false,
      favorite: false,
      language: language || null,
      tags: allTags,
      embedding: embedding, // Store as number[] directly for pgvector
      isShared: isShared || false,
      teamId: isShared && user.plan === "team" ? user.id : null, // Simple team ID for now
    });

    return res.status(200).json({
      success: true,
      memory: {
        id: clipboardItem.id,
        tags: allTags,
        aiTagsCount: aiTags.length,
        hasEmbedding: !!embedding,
      },
      message: "Code snippet saved to memory",
    });
  } catch (error) {
    console.error("[API v1 /memory/save error]", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to save to memory",
    });
  }
});

// POST /api/v1/memory/search - Semantic search across saved snippets
router.post("/memory/search", authenticateApiKey, async (req: ApiKeyRequest, res: Response) => {
  try {
    const validation = memorySearchSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid request body",
        details: validation.error.errors,
      });
    }

    const { query, limit } = validation.data;
    const user = req.apiUser!;

    // Semantic search only for Pro/Team users
    if (user.plan === "free") {
      return res.status(403).json({
        error: "Feature Not Available",
        message: "Semantic search is available on Pro ($9.99/mo) and Team ($29.99/mo) plans",
        upgrade: "https://devclip.app/pricing",
      });
    }

    // Generate embedding for the search query
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateEmbedding(query);
    } catch (error) {
      console.error("Query embedding generation failed:", error);
      return res.status(500).json({
        error: "Search Error",
        message: "Failed to process search query",
      });
    }

    // Use SQL pgvector query for efficient similarity search
    const rankedResults = await storage.searchClipboardItemsByEmbedding(
      user.id,
      queryEmbedding,
      limit
    );

    return res.status(200).json({
      success: true,
      query,
      results: rankedResults,
      totalResults: rankedResults.length,
    });
  } catch (error) {
    console.error("[API v1 /memory/search error]", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to search memory",
    });
  }
});

export default router;
