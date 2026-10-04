import type { Command } from "@langchain/protocol";

import { authErrorResponse, requireUser } from "@/lib/auth/session";
import { requireAccessibleThread } from "@/lib/db/repository/agent-threads";
import { getSession } from "@/lib/server/registry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ threadId: string }> };

/**
 * `POST /api/threads/:threadId/commands`
 *
 * The request body is an Agent Protocol {@link Command}. The response is the
 * command result emitted by the owning `LocalThreadSession`.
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const ctx = await requireUser();
    const { threadId } = await params;
    await requireAccessibleThread(ctx, threadId);
    const command = (await request.json()) as Command;
    const session = await getSession(threadId);
    return Response.json(await session.handleCommand(command));
  } catch (error) {
    return authErrorResponse(error);
  }
}
