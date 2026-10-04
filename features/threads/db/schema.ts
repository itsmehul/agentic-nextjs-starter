import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "../../auth/db/schema";

/**
 * Ownership row for a LangGraph thread. Conversation state lives in the
 * Postgres checkpointer tables; this table scopes thread ids to a user.
 */
export const agentThread = pgTable(
  "agent_thread",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("agent_thread_user_idx").on(table.userId)],
);
