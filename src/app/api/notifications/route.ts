import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { assertServerOwnership } from "@/lib/security";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertServerOwnership(params.id, session.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const logs = await prisma.botLog.findMany({
    where: { serverId: params.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ logs });
}
