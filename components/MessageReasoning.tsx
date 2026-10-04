"use client";

import { useEffect, useState } from "react";

import { BrainIcon, ChevronRightIcon } from "@/components/icons";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TypingDots } from "./StreamingIndicator";

/**
 * Minimalistic reasoning block: a `Thinking` toggle with a brain icon and a
 * caret, rendered inline in the conversation (not inside a message bubble).
 *
 * While reasoning tokens stream (`active`), the block auto-expands so you can
 * watch the model think; once the turn finishes it auto-collapses. The caret
 * stays clickable so a finished block can be re-opened.
 */
export function MessageReasoning({
  reasoning,
  active,
}: {
  reasoning: string;
  active: boolean;
}) {
  const [open, setOpen] = useState(active);

  // Follow the streaming state: expand on start, collapse on finish. The effect
  // only runs when `active` flips, so a manual toggle in between is preserved.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(active);
  }, [active]);

  return (
    <Collapsible onOpenChange={setOpen} open={open}>
      <CollapsibleTrigger className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ChevronRightIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-90" />
        <BrainIcon className="size-4" />
        <span>Thinking</span>
        {active ? <TypingDots size="sm" /> : null}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="mt-2 border-l-2 pl-3 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground italic">
          {reasoning}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
