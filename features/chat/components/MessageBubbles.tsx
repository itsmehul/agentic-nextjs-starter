"use client";

import { AIMessage, type BaseMessage } from "@langchain/core/messages";

import { cn } from "@/shared/lib/utils";

type ToolCallLike = {
  name: string;
  args?: Record<string, unknown>;
  id?: string;
};

function messageLabel(message: { type: string; name?: string }) {
  if (message.type === "human") return "You";
  if (message.type === "tool") return `Tool · ${message.name ?? "result"}`;
  if (message.type === "ai") return "Assistant";
  return message.type;
}

function formatToolArgs(args: Record<string, unknown>) {
  const entries = Object.entries(args);
  if (entries.length === 0) return "";
  if (entries.length === 1) return String(entries[0]?.[1] ?? "");
  return JSON.stringify(args);
}

/**
 * Extract reasoning-summary text from a message.
 *
 * Reasoning models surface their summaries as `{ type: "reasoning" }` standard
 * content blocks (see `@langchain/openai`'s Responses API converter). Only AI
 * messages carry reasoning; everything else returns an empty string.
 */
export function getReasoningText(message: BaseMessage): string {
  if (!AIMessage.isInstance(message)) return "";
  try {
    return message.contentBlocks
      .filter(
        (block): block is { type: "reasoning"; reasoning: string } =>
          (block as { type?: string })?.type === "reasoning"
      )
      .map((block) => block.reasoning)
      .join("")
      .trim();
  } catch {
    return "";
  }
}

/**
 * Renders a single message as a chat bubble with its tool-call rows.
 *
 * `toolCalls` can be passed to override which tool calls are shown (e.g. to
 * hide the `task` calls that are rendered as subagent cards instead).
 */
export function MessageBubble({
  message,
  toolCalls,
}: {
  message: BaseMessage;
  toolCalls?: ToolCallLike[];
}) {
  const calls =
    toolCalls ??
    (AIMessage.isInstance(message) ? (message.tool_calls ?? []) : []);

  const isUser = message.type === "human";

  return (
    <div
      className={cn(
        "flex max-w-[85%] flex-col gap-2 rounded-3xl px-4 py-3 text-sm",
        isUser
          ? "self-end bg-primary text-primary-foreground"
          : "self-start bg-muted text-foreground",
        message.type === "tool" && "max-w-full border border-dashed bg-transparent"
      )}
    >
      <span
        className={cn(
          "text-xs font-medium",
          isUser ? "text-primary-foreground/70" : "text-muted-foreground"
        )}
      >
        {messageLabel(message)}
      </span>
      {calls.length > 0 ? (
        <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
          {calls.map((toolCall, toolIndex) => {
            const args = formatToolArgs(toolCall.args ?? {});
            return (
              <li key={toolCall.id ?? toolIndex}>
                <span className="font-mono font-medium text-foreground">
                  {toolCall.name}
                </span>
                {args ? `(${args})` : ""}
              </li>
            );
          })}
        </ul>
      ) : null}
      {message.text ? (
        <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
      ) : null}
    </div>
  );
}
