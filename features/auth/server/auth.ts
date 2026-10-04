import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/shared/db";
import * as schema from "../db/schema";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";

export const googleEnabled = Boolean(googleClientId && googleClientSecret);
export const emailPasswordEnabled = process.env.NODE_ENV === "development";

export const auth = betterAuth({
  appName: "deploy-model",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter((origin): origin is string => Boolean(origin)),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  onAPIError: {
    errorURL: "/login",
  },
  emailAndPassword: {
    enabled: emailPasswordEnabled,
  },
  socialProviders: {
    ...(googleEnabled
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            mapProfileToUser: (profile) => ({
              image: profile.picture,
            }),
            overrideUserInfoOnSignIn: true,
          },
        }
      : {}),
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
