import type { BaseMessage } from "@langchain/core/messages";

import { cn } from "@/lib/utils";

export function shouldShowTypingIndicator(
  messages: BaseMessage[],
  isLoading: boolean
) {
  if (!isLoading) return false;

  const last = messages.at(-1);
  if (!last) return true;
  if (last.type === "human" || last.type === "tool") return true;
  if (last.type === "ai" && !last.text?.trim()) return true;
  return false;
}

export function TypingDots({ size = "default" }: { size?: "default" | "sm" }) {
  return (
    <span aria-hidden className="inline-flex items-center gap-1">
      {["[animation-delay:-0.3s]", "[animation-delay:-0.15s]", ""].map(
        (delay, index) => (
          <span
            className={cn(
              "animate-bounce rounded-full bg-current",
              size === "sm" ? "size-1" : "size-1.5",
              delay
            )}
            key={index}
          />
        )
      )}
    </span>
  );
}

export function StreamingIndicator() {
  return (
    <div
      aria-label="Loading response"
      className="flex h-6 items-center px-1 text-muted-foreground"
      role="status"
    >
      <TypingDots />
    </div>
  );
}
