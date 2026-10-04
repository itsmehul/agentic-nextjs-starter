import { redirect } from "next/navigation";

import { ChatApp } from "@/components/ChatApp";
import { getSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <ChatApp user={{ name: session.user.name, email: session.user.email }} />;
}
