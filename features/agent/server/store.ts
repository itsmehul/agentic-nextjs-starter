import "server-only";

import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";

import { DATABASE_URL } from "@/shared/db";

/**
 * Durable LangGraph long-term memory store backed by the Compose Postgres
 * instance. Unlike the checkpointer (per-thread state), items here persist
 * across threads. Store tables are created on first use (`ensureTables`).
 *
 * `PostgresStore` opens its own pool, so it is cached on `globalThis` to
 * avoid leaking pools across dev hot reloads.
 */
const globalForStore = globalThis as unknown as { __agentStore?: PostgresStore };

export const store = (globalForStore.__agentStore ??= PostgresStore.fromConnString(
  DATABASE_URL
));
