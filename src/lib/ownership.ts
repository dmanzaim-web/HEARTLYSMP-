import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: { userId: session.user.id },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
