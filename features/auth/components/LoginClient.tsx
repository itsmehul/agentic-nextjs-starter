"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "../client";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { Spinner } from "@/shared/ui/spinner";

function safeNextPath(next: string | null) {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.95l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export function LoginClient({
  google,
  emailPassword,
}: {
  google: boolean;
  emailPassword: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "Sign-in failed. Try again." : null
  );

  async function onEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setError(null);
    setPending(true);
    const { error: authError } =
      mode === "sign-in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({
            email,
            password,
            name: email.split("@")[0] || email,
          });
    if (authError) {
      setPending(false);
      setError(authError.message || "Something went wrong. Try again.");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function onGoogle() {
    setError(null);
    setPending(true);
    const { error: oauthError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: next,
      errorCallbackURL: "/login",
    });
    if (oauthError) {
      setPending(false);
      setError(
        oauthError.message ||
          "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
      );
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        {emailPassword ? (
          <form onSubmit={onEmailSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                minLength={8}
                required
                disabled={pending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? <Spinner /> : null}
              {mode === "sign-in" ? "Sign in" : "Create account"}
            </Button>
            <Button
              type="button"
              variant="link"
              size="sm"
              disabled={pending}
              onClick={() =>
                setMode((m) => (m === "sign-in" ? "sign-up" : "sign-in"))
              }
            >
              {mode === "sign-in"
                ? "No account? Create one"
                : "Have an account? Sign in"}
            </Button>
          </form>
        ) : null}
        {emailPassword && google ? <Separator /> : null}
        {google ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={pending}
            onClick={onGoogle}
          >
            {pending ? <Spinner /> : <GoogleIcon />}
            Continue with Google
          </Button>
        ) : null}
        {!google && !emailPassword ? (
          <p className="text-center text-sm text-muted-foreground">
            Sign-in is not configured. Set GOOGLE_CLIENT_ID and
            GOOGLE_CLIENT_SECRET.
          </p>
        ) : null}
        {error ? (
          <p className="text-center text-sm text-destructive">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
