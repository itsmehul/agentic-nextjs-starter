import "server-only";

import { agent, checkpointer } from "@/lib/agent";
import { ensureCheckpointer } from "@/lib/agent/checkpointer";
import { deleteAgentThread } from "@/lib/db/repository/agent-threads";

import { LocalThreadSession } from "./session";
import type { LocalProtocolGraph } from "./threads";

/**
 * Process-local registry for the agent and its per-thread sessions.
 *
 * Next.js route handlers are stateless per request, and the dev server
 * re-evaluates modules on hot reload. Stashing the session map on `globalThis`
 * keeps a thread's replay buffer alive across the `/state`, `/commands`, and
 * `/stream` calls that make up one turn.
 *
 * Thread state is durable (Postgres checkpointer), but the session replay
 * buffer is still process-local. A multi-instance deployment needs a shared
 * session/replay store.
 */
type Registry = {
  sessions: Map<string, LocalThreadSession>;
};

const globalForRegistry = globalThis as unknown as {
  __agentRegistry?: Registry;
};

const registry: Registry = (globalForRegistry.__agentRegistry ??= {
  sessions: new Map(),
});

/** Graph handle typed for thread checkpoint routes. */
export async function getAgentGraph(): Promise<LocalProtocolGraph> {
  await ensureCheckpointer();
  return agent.graph;
}

/** Get or create the process-local session for a thread. */
export async function getSession(threadId: string): Promise<LocalThreadSession> {
  await ensureCheckpointer();
  let session = registry.sessions.get(threadId);
  if (session == null) {
    session = new LocalThreadSession(agent, threadId);
    registry.sessions.set(threadId, session);
  }
  return session;
}

/** Delete a thread: its session, checkpointed state, and ownership row. */
export async function deleteThread(threadId: string): Promise<void> {
  await ensureCheckpointer();
  registry.sessions.delete(threadId);
  await checkpointer.deleteThread(threadId);
  await deleteAgentThread(threadId);
}
