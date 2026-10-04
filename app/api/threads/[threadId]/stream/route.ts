import type { SubscribeParams } from "@langchain/protocol";

import { authErrorResponse, requireUser } from "@/features/auth/server";
import { requireAccessibleThread } from "@/features/threads/server";
import { getSession } from "@/features/threads/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ threadId: string }> };

/**
 * `POST /api/threads/:threadId/stream`
 *
 * The request body is a connection-scoped {@link SubscribeParams} filter. The
 * response is an SSE stream that first replays matching buffered events and then
 * stays attached for live events from the same thread.
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const ctx = await requireUser();
    const { threadId } = await params;
    await requireAccessibleThread(ctx, threadId);
    const subscribeParams = (await request.json()) as SubscribeParams;
    const session = await getSession(threadId);

    return new Response(session.stream(subscribeParams), {
      headers: {
        "cache-control": "no-cache, no-transform",
        "content-type": "text/event-stream",
        connection: "keep-alive",
        // Disable proxy buffering (e.g. nginx) so SSE frames flush immediately.
        "x-accel-buffering": "no",
      },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
