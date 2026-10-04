import { redirect } from "next/navigation";
import { Suspense } from "react";

import { emailPasswordEnabled, getSession, googleEnabled } from "@/features/auth/server";

import { LoginClient } from "@/features/auth";

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
