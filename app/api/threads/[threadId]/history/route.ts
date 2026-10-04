import { authErrorResponse, requireUser } from "@/features/auth/server";
import { requireAccessibleThread } from "@/features/threads/server";
import { getAgentGraph } from "@/features/threads/server";
import { ThreadNotFoundError, getThreadHistory } from "@/features/threads/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ threadId: string }> };

/** `POST /api/threads/:threadId/history` — list past checkpointed states. */
export async function POST(request: Request, { params }: Params) {
  try {
    const ctx = await requireUser();
    const { threadId } = await params;
    await requireAccessibleThread(ctx, threadId);
    const body = (await request.json().catch(() => ({}))) as {
      limit?: number;
      before?: unknown;
      metadata?: Record<string, unknown>;
      checkpoint?: Record<string, unknown>;
    };
    const history = await getThreadHistory(await getAgentGraph(), threadId, {
      limit: typeof body.limit === "number" ? body.limit : 10,
      before: body.before,
      metadata: body.metadata,
      checkpoint: body.checkpoint,
    });
    return Response.json(history);
  } catch (error) {
    if (error instanceof ThreadNotFoundError) {
      return Response.json(
        { error: "not_found", message: error.message },
        { status: 404 }
      );
    }
    return authErrorResponse(error);
  }
}
