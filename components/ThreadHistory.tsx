"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { ThreadSummary } from "@/lib/chat/threads-client";

import { SidebarAccountFooter, type SidebarUser } from "./SidebarAccountFooter";

function formatTime(updatedAt: string | null) {
  if (!updatedAt) return "";
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ThreadHistory({
  threads,
  activeThreadId,
  onSelect,
  onCreate,
  onDelete,
  user,
}: {
  user: SidebarUser;
  threads: ThreadSummary[];
  activeThreadId: string;
  onSelect: (threadId: string) => void;
  onCreate: () => void;
  onDelete: (threadId: string) => void;
}) {
  return (
    <Sidebar aria-label="Thread history">
      <SidebarHeader>
        <Button className="w-full justify-start" onClick={onCreate}>
          <PlusIcon data-icon="inline-start" />
          New chat
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {threads.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  No conversations yet.
                </p>
              ) : null}
              {threads.map((thread) => (
                <SidebarMenuItem key={thread.id}>
                  <SidebarMenuButton
                    className="h-auto flex-col items-start gap-0.5"
                    isActive={thread.id === activeThreadId}
                    onClick={() => onSelect(thread.id)}
                  >
                    <span className="w-full truncate">{thread.title}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {formatTime(thread.updatedAt)}
                    </span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    aria-label="Delete conversation"
                    onClick={() => onDelete(thread.id)}
                    showOnHover
                  >
                    <Trash2Icon />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarAccountFooter user={user} />
    </Sidebar>
  );
}
