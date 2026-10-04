import { redirect } from "next/navigation";
import { Suspense } from "react";

import { emailPasswordEnabled, googleEnabled } from "@/lib/auth";
import { getSession } from "@/lib/auth/session";

import LoginClient from "./login-client";

export default async function Page() {
  if (await getSession()) {
    redirect("/");
  }

  return (
    <Suspense
      fallback={<div className="text-center text-muted-foreground">Loading…</div>}
    >
      <LoginClient google={googleEnabled} emailPassword={emailPasswordEnabled} />
    </Suspense>
  );
}
