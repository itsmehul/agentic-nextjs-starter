import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

export const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5433/deploy_model";

const globalForDb = globalThis as unknown as { __pgPool?: Pool };

export const pool = (globalForDb.__pgPool ??= new Pool({
  connectionString: DATABASE_URL,
}));

export const db = drizzle(pool, { schema });
