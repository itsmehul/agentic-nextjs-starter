import { authErrorResponse, requireUser } from "@/lib/auth/session";
import { listUserThreadIds } from "@/lib/db/repository/agent-threads";
import { getAgentGraph } from "@/lib/server/registry";
import { listThreads } from "@/lib/server/threads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** `GET /api/threads` — list threads owned by the signed-in user. */
export async function GET() {
  try {
    const ctx = await requireUser();
    const threads = await listThreads(
      await getAgentGraph(),
      await listUserThreadIds(ctx)
    );
    return Response.json(threads);
  } catch (error) {
    return authErrorResponse(error);
  }
}
