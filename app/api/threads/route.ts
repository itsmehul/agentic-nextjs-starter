import { authErrorResponse, requireUser } from "@/features/auth/server";
import { listUserThreadIds } from "@/features/threads/server";
import { getAgentGraph } from "@/features/threads/server";
import { listThreads } from "@/features/threads/server";

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
