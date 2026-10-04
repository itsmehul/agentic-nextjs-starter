import "server-only";

import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

import { pool } from "@/lib/db";

/**
 * Durable LangGraph checkpointer backed by the Compose Postgres instance.
 * Call {@link ensureCheckpointer} before the first read or write so the
 * checkpoint tables exist.
 */
export const checkpointer = new PostgresSaver(pool);

let setupPromise: Promise<void> | undefined;

/** Create checkpoint tables on first use (idempotent). */
export function ensureCheckpointer(): Promise<void> {
  setupPromise ??= checkpointer.setup();
  return setupPromise;
}
