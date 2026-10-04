import "server-only";

import { desc, eq } from "drizzle-orm";

import { AuthError, type UserContext } from "@/features/auth/server";
import { db } from "@/shared/db";
import { agentThread } from "../db/schema";

export type AgentThreadRow = typeof agentThread.$inferSelect;

async function getAgentThread(threadId: string): Promise<AgentThreadRow | null> {
  const rows = await db
    .select()
    .from(agentThread)
    .where(eq(agentThread.id, threadId))
    .limit(1);
  return rows[0] ?? null;
}

/** @throws {@link AuthError} 404 when the thread is missing or owned by someone else. */
export async function requireAccessibleThread(
  ctx: UserContext,
  threadId: string
): Promise<AgentThreadRow> {
  const row = await getAgentThread(threadId);
  if (!row || row.userId !== ctx.userId) {
    throw new AuthError("Thread not found", 404);
  }
  return row;
}

/** Claim a thread id for the user, or return the existing row they own. */
export async function ensureThreadOwnership(
  ctx: UserContext,
  threadId: string
): Promise<AgentThreadRow> {
  const [inserted] = await db
    .insert(agentThread)
    .values({ id: threadId, userId: ctx.userId })
    .onConflictDoNothing()
    .returning();
  if (inserted) return inserted;
  return requireAccessibleThread(ctx, threadId);
}

export async function listUserThreadIds(ctx: UserContext): Promise<string[]> {
  const rows = await db
    .select({ id: agentThread.id })
    .from(agentThread)
    .where(eq(agentThread.userId, ctx.userId))
    .orderBy(desc(agentThread.updatedAt));
  return rows.map((row) => row.id);
}

export async function deleteAgentThread(threadId: string): Promise<void> {
  await db.delete(agentThread).where(eq(agentThread.id, threadId));
}
