import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { assertServerOwnership, BotRuntimeManager } from "@/lib/bot-runtime";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertServerOwnership(params.id, session.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const manager = new BotRuntimeManager();
  const result = await manager.restartBot(params.id);

  await prisma.server.update({
    where: { id: params.id },
    data: { status: "RECONNECTING" },
  });

  return NextResponse.json(result);
}
