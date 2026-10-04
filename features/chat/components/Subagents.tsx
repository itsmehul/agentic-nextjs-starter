"use client";

import { useMemo } from "react";

import type { BaseMessage } from "@langchain/core/messages";
import type { SubagentDiscoverySnapshot } from "@langchain/langgraph-sdk/stream";
import { useMessages, useStreamContext } from "@langchain/react";

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import type { Agent } from "@/features/agent";
import { MessageThread } from "./MessageThread";
import { StreamingIndicator } from "./StreamingIndicator";
import { StatusBadge } from "./ToolCall";

export type SubagentStatus = SubagentDiscoverySnapshot["status"];

/** Lightweight model for a subagent card, derived from a `task` tool call. */
export type SubagentCard = {
  /** The `task` tool-call id — also the subagent discovery key. */
  id: string;
  name: string;
  task?: string;
  status: SubagentStatus;
  /** Whether a discovery snapshot exists yet (i.e. the card can be opened). */
  openable: boolean;
};

/** The task prompt is shown separately; skip the matching human message. */
function omitTaskHumanMessage(
  messages: BaseMessage[],
  taskInput?: string
): BaseMessage[] {
  const task = taskInput?.trim();
  if (!task) return messages;
  return messages.filter(
    (message) => message.type !== "human" || message.text?.trim() !== task
  );
}

/**
 * Compact, clickable subagent cards showing only the name and task prompt.
 * Rendered inline where the coordinator spawned the subagents. Selecting one
 * drills into its dedicated chat view.
 */
export function SubagentList({
  cards,
  onOpen,
}: {
  cards: SubagentCard[];
  onOpen: (id: string) => void;
}) {
  if (cards.length === 0) return null;

  return (
    <div
      aria-label="Subagents"
      className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3"
    >
      {cards.map((card) => (
        <button
          className="group text-left disabled:cursor-default"
          disabled={!card.openable}
          key={card.id}
          onClick={() => card.openable && onOpen(card.id)}
          type="button"
        >
          <Card
            className="h-full transition-shadow group-enabled:group-hover:shadow-lg"
            size="sm"
          >
            <CardHeader>
              <CardTitle className="truncate font-mono text-sm">
                {card.name}
              </CardTitle>
              <CardAction>
                <StatusBadge completeLabel="Complete" status={card.status} />
              </CardAction>
              {card.task ? (
                <CardDescription className="line-clamp-2">
                  {card.task}
                </CardDescription>
              ) : null}
            </CardHeader>
          </Card>
        </button>
      ))}
    </div>
  );
}

/**
 * The chat interface for a single subagent.
 *
 * `useMessages` is scoped to the subagent's namespace, so its tokens, tool
 * calls, and results stream independently from the root conversation.
 */
export function SubagentDetail({
  snapshot,
}: {
  snapshot: SubagentDiscoverySnapshot;
}) {
  const stream = useStreamContext<Agent>();
  const messages = useMessages(stream, snapshot);
  const visibleMessages = useMemo(
    () => omitTaskHumanMessage(messages, snapshot.taskInput),
    [messages, snapshot.taskInput]
  );

  return (
    <>
      {snapshot.taskInput ? (
        <Card size="sm">
          <CardHeader>
            <CardDescription>Task</CardDescription>
            <CardTitle className="text-sm leading-relaxed font-normal">
              {snapshot.taskInput}
            </CardTitle>
          </CardHeader>
        </Card>
      ) : null}

      <MessageThread
        isLoading={snapshot.status === "running"}
        messages={visibleMessages}
      />

      {snapshot.status === "running" && visibleMessages.length === 0 ? (
        <StreamingIndicator />
      ) : null}
    </>
  );
}
