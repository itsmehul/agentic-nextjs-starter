import "server-only";

import { ChatOpenAI } from "@langchain/openai";

const openRouter = {
  apiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer":
        process.env.OPENROUTER_HTTP_REFERER ?? "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_TITLE ?? "deploy-model",
    },
  },
} as const;

/** OpenRouter reasoning.effort values (model-dependent; some reject "none"). */
export type OpenRouterReasoningEffort =
  | "none"
  | "minimal"
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max";

export type OpenRouterChatOptions = {
  /** Sent as OpenRouter `reasoning.effort` via modelKwargs. */
  reasoningEffort?: OpenRouterReasoningEffort;
};

export const DEFAULT_OPENROUTER_MODEL = "deepseek/deepseek-v4-flash";

const openRouterModels = new Map<string, ChatOpenAI>();

export function firstModelName(
  fallback: string,
  ...candidates: Array<string | undefined>
): string {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }
  return fallback;
}

export function openRouterChat(
  model: string,
  options?: OpenRouterChatOptions
): ChatOpenAI {
  const cacheKey = options?.reasoningEffort
    ? `${model}:reasoning=${options.reasoningEffort}`
    : model;
  const cached = openRouterModels.get(cacheKey);
  if (cached) return cached;
  const chat = new ChatOpenAI({
    ...openRouter,
    model,
    promptCacheKey: `deploy-model:${cacheKey}`,
    ...(options?.reasoningEffort
      ? {
          modelKwargs: {
            reasoning: { effort: options.reasoningEffort },
          },
        }
      : {}),
  });
  openRouterModels.set(cacheKey, chat);
  return chat;
}

export function hasOpenRouterKey(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}
