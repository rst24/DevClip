import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authenticateApiKey, type ApiKeyRequest } from "../middleware/authenticateApiKey";
import { storage } from "../storage";
import { formatJson, formatYaml, formatSql, stripAnsi, logToMarkdown } from "../formatters";

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

    // Check if user has sufficient credits (0.1 credits for formatters)
    const creditCost = 0.1;
    if (user.aiCreditsBalance < creditCost) {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient credits",
        creditsRequired: creditCost,
        creditsAvailable: user.aiCreditsBalance,
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

    // Deduct credits and update cached user
    const updatedUser = await storage.deductCredits(user.id, creditCost);
    req.apiUser = updatedUser;

    return res.status(200).json({
      success: true,
      operation,
      result,
      creditsUsed: creditCost,
      creditsRemaining: updatedUser.aiCreditsBalance,
    });
  } catch (error) {
    console.error("[API v1 /format error]", error);
    
    if (error instanceof Error && error.message === "Insufficient credits") {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient credits",
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

    // Check if user has sufficient credits (1 credit for explain)
    const creditCost = 1;
    if (user.aiCreditsBalance < creditCost) {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient credits",
        creditsRequired: creditCost,
        creditsAvailable: user.aiCreditsBalance,
      });
    }

    // Call AI service with tier-specific model
    const { processAiRequest } = await import("../ai");
    const { getModelForPlan } = await import("../openai");
    const model = getModelForPlan(user.plan as "free" | "pro" | "team");
    const result = await processAiRequest(text, "explain", model);

    // Deduct credits and update cached user
    const updatedUser = await storage.deductCredits(user.id, creditCost);
    req.apiUser = updatedUser;
    
    await storage.createAiOperation({
      userId: user.id,
      operationType: "explain",
      inputText: text.substring(0, 1000), // Store truncated version
      outputText: result.substring(0, 1000),
      tokensUsed: 0, // Would be populated from OpenAI response
      creditsUsed: creditCost,
    });

    return res.status(200).json({
      success: true,
      operation: "explain",
      result,
      creditsUsed: creditCost,
      creditsRemaining: updatedUser.aiCreditsBalance,
    });
  } catch (error) {
    console.error("[API v1 /ai/explain error]", error);
    
    if (error instanceof Error && error.message === "Insufficient credits") {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient credits",
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

    const creditCost = 2; // Refactoring costs 2 credits
    if (user.aiCreditsBalance < creditCost) {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient credits",
        creditsRequired: creditCost,
        creditsAvailable: user.aiCreditsBalance,
      });
    }

    // Call AI service with tier-specific model
    const { processAiRequest } = await import("../ai");
    const { getModelForPlan } = await import("../openai");
    const model = getModelForPlan(user.plan as "free" | "pro" | "team");
    const result = await processAiRequest(text, "refactor", model);

    // Deduct credits and update cached user
    const updatedUser = await storage.deductCredits(user.id, creditCost);
    req.apiUser = updatedUser;
    
    await storage.createAiOperation({
      userId: user.id,
      operationType: "refactor",
      inputText: text.substring(0, 1000),
      outputText: result.substring(0, 1000),
      tokensUsed: 0,
      creditsUsed: creditCost,
    });

    return res.status(200).json({
      success: true,
      operation: "refactor",
      result,
      creditsUsed: creditCost,
      creditsRemaining: updatedUser.aiCreditsBalance,
    });
  } catch (error) {
    console.error("[API v1 /ai/refactor error]", error);
    
    if (error instanceof Error && error.message === "Insufficient credits") {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient credits",
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

    const creditCost = 1; // Summarization costs 1 credit
    if (user.aiCreditsBalance < creditCost) {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient credits",
        creditsRequired: creditCost,
        creditsAvailable: user.aiCreditsBalance,
      });
    }

    // Call AI service with tier-specific model
    const { processAiRequest } = await import("../ai");
    const { getModelForPlan } = await import("../openai");
    const model = getModelForPlan(user.plan as "free" | "pro" | "team");
    const result = await processAiRequest(text, "summarize", model);

    // Deduct credits and update cached user
    const updatedUser = await storage.deductCredits(user.id, creditCost);
    req.apiUser = updatedUser;
    
    await storage.createAiOperation({
      userId: user.id,
      operationType: "summarize",
      inputText: text.substring(0, 1000),
      outputText: result.substring(0, 1000),
      tokensUsed: 0,
      creditsUsed: creditCost,
    });

    return res.status(200).json({
      success: true,
      operation: "summarize",
      result,
      creditsUsed: creditCost,
      creditsRemaining: updatedUser.aiCreditsBalance,
    });
  } catch (error) {
    console.error("[API v1 /ai/summarize error]", error);
    
    if (error instanceof Error && error.message === "Insufficient credits") {
      return res.status(402).json({
        error: "Payment Required",
        message: "Insufficient credits",
      });
    }
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to process AI request",
    });
  }
});

export default router;
