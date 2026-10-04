import { randomUUID } from "node:crypto";

import { input, password } from "@inquirer/prompts";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";

for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // env files are optional
  }
}

// DATABASE_URL is read when the db module loads, so import it after env files.
const { db, pool } = await import("@/shared/db");
const { account, user } = await import("@/features/auth/db/schema");

const name = await input({ message: "Name", default: "Dummy User" });
const email = (
  await input({
    message: "Email",
    default: "dummy@example.com",
    validate: (value) => /^\S+@\S+\.\S+$/.test(value) || "Enter a valid email",
  })
)
  .trim()
  .toLowerCase();
const plainPassword =
  (await password({
    message: "Password (leave empty for password1234)",
    mask: "*",
    validate: (value) =>
      value === "" || value.length >= 8 || "Use at least 8 characters",
  })) || "password1234";

try {
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email));

  if (existing) {
    console.error(`A user with ${email} already exists.`);
    process.exitCode = 1;
  } else {
    const userId = randomUUID();
    const hashed = await hashPassword(plainPassword);

    await db.transaction(async (tx) => {
      await tx.insert(user).values({
        id: userId,
        name,
        email,
        emailVerified: true,
      });
      await tx.insert(account).values({
        id: randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashed,
        updatedAt: new Date(),
      });
    });

    console.log(`Created ${email} (email verified). Sign in under next dev.`);
  }
} finally {
  await pool.end();
}
