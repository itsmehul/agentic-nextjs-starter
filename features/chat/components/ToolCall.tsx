"use client";

import { useState } from "react";

import { ChevronRightIcon, WrenchIcon } from "@/shared/ui/icons";

import { Badge } from "@/shared/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { Spinner } from "@/shared/ui/spinner";

export type ToolCallStatus = "running" | "complete" | "error";

export type ToolCallView = {
  id: string;
  name: string;
  args: Record<string, unknown>;
  output?: string;
  status: ToolCallStatus;
};

function stringifyArgs(args: Record<string, unknown>) {
  try {
    return JSON.stringify(args, null, 2);
  } catch {
    return String(args);
  }
}

export function StatusBadge({
  status,
  completeLabel = "Done",
}: {
  status: ToolCallStatus;
  completeLabel?: string;
}) {
  if (status === "running") {
    return (
      <Badge variant="secondary">
        <Spinner data-icon="inline-start" />
        Running
      </Badge>
    );
  }
  if (status === "error") return <Badge variant="destructive">Error</Badge>;
  return <Badge variant="outline">{completeLabel}</Badge>;
}

function CodeBlock({ label, children }: { label: string; children: string }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <pre className="max-h-64 overflow-auto rounded-xl bg-muted px-3 py-2 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap">
        {children}
      </pre>
    </div>
  );
}

/**
 * A subtle, collapsible representation of a single tool call: an icon, the
 * tool name, and its status. Expanding reveals the stringified input (args)
 * and output (the tool result).
 */
export function ToolCall({ call }: { call: ToolCallView }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      className="overflow-hidden rounded-2xl border bg-card"
      onOpenChange={setOpen}
      open={open}
    >
      <CollapsibleTrigger className="group flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-muted/50">
        <WrenchIcon className="size-4 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-mono">{call.name}</span>
        <StatusBadge status={call.status} />
        <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
      </CollapsibleTrigger>

      <CollapsibleContent className="grid gap-3 px-3.5 pb-3.5">
        <CodeBlock label="Input">{stringifyArgs(call.args)}</CodeBlock>
        {call.output != null && call.output !== "" ? (
          <CodeBlock label="Output">{call.output}</CodeBlock>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
