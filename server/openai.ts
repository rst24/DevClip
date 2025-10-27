import OpenAI from "openai";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
export const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// Tiered AI models based on subscription plan - provides clear value proposition for upgrades
export const AI_MODELS = {
  free: "gpt-5-nano",    // Fast, efficient - perfect for 50 credits/month
  pro: "gpt-5-mini",     // Balanced quality and cost - ideal for 5K credits/month
  team: "gpt-5",         // Premium, best quality - for 25K credits/month
} as const;

export const MAX_COMPLETION_TOKENS = 2048; // Strict token cap for cost control (using max_completion_tokens for GPT-5 models)

/**
 * Get the appropriate AI model based on user's subscription plan
 */
export function getModelForPlan(plan: "free" | "pro" | "team"): string {
  return AI_MODELS[plan];
}

/**
 * Generate embedding vector for semantic search using OpenAI's text-embedding-3-small model
 * Returns a 1536-dimensional vector for similarity matching
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // 1536 dimensions, optimized for code
      input: text.slice(0, 8000), // Limit to ~8000 chars to stay within token limits
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Extract relevant tags from code snippet using AI
 * Returns array of 3-5 descriptive tags (e.g., ["authentication", "jwt", "api"])
 */
export async function extractTags(content: string, language?: string): Promise<string[]> {
  try {
    const prompt = `Analyze this ${language || "code"} snippet and extract 3-5 relevant tags that describe its purpose, technology, or function. 
Return ONLY a JSON array of lowercase tags, nothing else.

Example: ["authentication", "jwt", "express", "middleware"]

Code:
${content.slice(0, 2000)}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5-nano", // Fast, cheap model for tagging
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 100,
      temperature: 0.3, // Low temperature for consistent tagging
    });

    const responseText = response.choices[0]?.message?.content?.trim() || "[]";
    
    // Parse JSON array from response
    const tags = JSON.parse(responseText);
    
    // Validate and clean tags
    if (Array.isArray(tags)) {
      return tags
        .filter((tag: any) => typeof tag === "string")
        .map((tag: string) => tag.toLowerCase().trim())
        .filter((tag: string) => tag.length > 0 && tag.length < 30)
        .slice(0, 5); // Limit to 5 tags
    }
    
    return [];
  } catch (error) {
    console.error("Error extracting tags:", error);
    return []; // Return empty array on error - tagging is optional
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 * Used for semantic search ranking
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
