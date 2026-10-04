"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "@/shared/ui/icons";

import { Button } from "@/shared/ui/button";
import { SidebarFooter } from "@/shared/ui/sidebar";
import { Spinner } from "@/shared/ui/spinner";
import { signOut } from "../client";

export type SidebarUser = { name: string; email: string };

export function SidebarAccountFooter({ user }: { user: SidebarUser }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSignOut() {
    setPending(true);
    await signOut();
    router.replace("/login");
  }

  return (
    <SidebarFooter>
      <div className="flex items-center gap-2 px-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button
          aria-label="Sign out"
          disabled={pending}
          onClick={onSignOut}
          size="icon"
          variant="ghost"
        >
          {pending ? <Spinner /> : <LogOutIcon />}
        </Button>
      </div>
    </SidebarFooter>
  );
}
