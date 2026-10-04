"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { HumanMessage } from "@langchain/core/messages";
import { useStreamContext } from "@langchain/react";
import { SendIcon } from "@/components/icons";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import type { Agent } from "@/lib/agent";
import { Conversation } from "./Conversation";
import { SubagentDetail } from "./Subagents";

const EXAMPLE_PROMPT =
  "Research LangGraph streaming, and separately calculate 42 * 17.";

export function Chat({
  actions,
  onRunSettled,
}: {
  threadId: string;
  actions?: ReactNode;
  /** Called when a run settles, so the sidebar can refresh titles/order. */
  onRunSettled: () => void;
}) {
  const stream = useStreamContext<Agent>();
  const [content, setContent] = useState(EXAMPLE_PROMPT);
  const [openSubagentId, setOpenSubagentId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Refresh the sidebar whenever a run finishes (titles derive from the first
  // message; order from the latest checkpoint, both owned by the server).
  useEffect(() => {
    if (!stream.isLoading) onRunSettled();
  }, [stream.isLoading, onRunSettled]);

  function autoGrow() {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 200)}px`;
  }

  const subagents = [...stream.subagents.values()];
  const openSubagent = openSubagentId
    ? subagents.find((snapshot) => snapshot.id === openSubagentId)
    : undefined;

  function handleSubmit() {
    const nextContent = content.trim();
    if (nextContent.length === 0 || stream.isLoading) return;

    setContent("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    void stream.submit({
      messages: [new HumanMessage(nextContent)],
    });
  }

  const header = (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator
        className="mr-2 data-vertical:h-4 data-vertical:self-center"
        orientation="vertical"
      />
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            {openSubagent ? (
              <BreadcrumbLink asChild>
                <button onClick={() => setOpenSubagentId(null)} type="button">
                  Main chat
                </button>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Main chat</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {openSubagent ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-mono">
                  {openSubagent.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
      {actions}
    </header>
  );

  // Subagent detail view: breadcrumb + that subagent's chat (no composer).
  if (openSubagent) {
    return (
      <>
        {header}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 md:px-12">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            <SubagentDetail snapshot={openSubagent} />
          </div>
        </div>
      </>
    );
  }

  // Main view: messages + subagent chips, with the composer pinned at the bottom.
  return (
    <>
      {header}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 md:px-12">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <Conversation onOpenSubagent={setOpenSubagentId} />
        </div>
      </div>

      <div className="shrink-0 px-4 pt-2 pb-6 md:px-12">
        <form
          className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-3xl border bg-card p-2 pl-4 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <Textarea
            aria-label="Message"
            className="max-h-50 min-h-10 flex-1 resize-none border-0 bg-transparent px-0 py-2 shadow-none focus-visible:ring-0 dark:bg-transparent"
            onChange={(event) => {
              setContent(event.target.value);
              autoGrow();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask for research, a calculation, or both..."
            ref={textareaRef}
            rows={1}
            value={content}
          />
          <Button
            aria-label="Send"
            disabled={content.trim() === "" || stream.isLoading}
            size="icon"
            type="submit"
          >
            <SendIcon />
          </Button>
        </form>
      </div>
    </>
  );
}
