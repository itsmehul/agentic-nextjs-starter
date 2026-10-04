import { redirect } from "next/navigation";

import { ChatApp } from "@/features/chat";
import { getCurrentUser } from "@/features/auth/server";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <ChatApp user={user} />;
}
