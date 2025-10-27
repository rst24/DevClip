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
