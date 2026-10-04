import { authErrorResponse, requireUser } from "@/features/auth/server";
import { requireAccessibleThread } from "@/features/threads/server";
import { deleteThread } from "@/features/threads/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ threadId: string }> };

/** `DELETE /api/threads/:threadId` — drop a thread's session and checkpoints. */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ctx = await requireUser();
    const { threadId } = await params;
    await requireAccessibleThread(ctx, threadId);
    await deleteThread(threadId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
