import { defineConfig } from "drizzle-kit";

for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // env files are optional
  }
}

export default defineConfig({
  schema: "./features/*/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5433/deploy_model",
  },
});
