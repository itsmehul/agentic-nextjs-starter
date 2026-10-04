import { authErrorResponse, requireUser } from "@/lib/auth/session";
import {
  ensureThreadOwnership,
  requireAccessibleThread,
} from "@/lib/db/repository/agent-threads";
import { getAgentGraph } from "@/lib/server/registry";
import {
  ThreadNotFoundError,
  getThreadState,
  updateThreadState,
} from "@/lib/server/threads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ threadId: string }> };

/** `GET /api/threads/:threadId/state` — read checkpointed thread state. */
export async function GET(_request: Request, { params }: Params) {
  try {
    const ctx = await requireUser();
    const { threadId } = await params;
    await requireAccessibleThread(ctx, threadId);
    const state = await getThreadState(await getAgentGraph(), threadId);
    return Response.json(state);
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

/** `POST /api/threads/:threadId/state` — create or update thread state. */
export async function POST(request: Request, { params }: Params) {
  let threadId: string;
  try {
    const ctx = await requireUser();
    threadId = (await params).threadId;
    await ensureThreadOwnership(ctx, threadId);
  } catch (error) {
    return authErrorResponse(error);
  }

  const body = (await request.json().catch(() => ({}))) as {
    values?: Record<string, unknown> | null;
    checkpoint?: Record<string, unknown> | null;
    as_node?: string;
  };
  try {
    const state = await updateThreadState(await getAgentGraph(), threadId, {
      values: body.values ?? null,
      checkpoint: body.checkpoint ?? null,
      asNode: body.as_node,
    });
    return Response.json(state);
  } catch (error) {
    return Response.json(
      { error: "invalid_state_update", message: String(error) },
      { status: 422 }
    );
  }
}
