import { openai, MAX_TOKENS } from "./openai";

const systemPrompts: Record<string, string> = {
  explain: "You are a helpful code assistant. Explain the following code or text clearly and concisely.",
  summarize: "You are a helpful assistant. Summarize the following text in a clear and concise way.",
  refactor: "You are an expert code reviewer. Suggest improvements and refactor the following code. Provide clean, optimized code."
};

export async function processAiRequest(
  text: string, 
  operation: string, 
  model: string
): Promise<string> {
  const systemPrompt = systemPrompts[operation] || systemPrompts.explain;
  
  const completion = await openai.chat.completions.create({
    model,
    max_tokens: MAX_TOKENS,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text }
    ],
  });
  
  const result = completion.choices[0]?.message?.content || "No result";
  return result;
}

export async function processAiRequestWithMetadata(
  text: string, 
  operation: string,
  model: string
) {
  const systemPrompt = systemPrompts[operation] || systemPrompts.explain;
  
  const completion = await openai.chat.completions.create({
    model,
    max_tokens: MAX_TOKENS,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text }
    ],
  });
  
  const result = completion.choices[0]?.message?.content || "No result";
  const tokensUsed = completion.usage?.total_tokens || 0;
  const estimatedCostCents = Math.ceil(tokensUsed * 0.00001 * 100);
  
  return {
    result,
    tokensUsed,
    estimatedCostCents,
  };
}
