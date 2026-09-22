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

  const server = await prisma.server.findUnique({
    where: { id: params.id },
    include: { runtime: true, logs: { orderBy: { createdAt: "desc" }, take: 25 } },
  });

  return NextResponse.json({ server });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertServerOwnership(params.id, session.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const server = await prisma.server.update({
    where: { id: params.id },
    data: {
      name: payload.name,
      host: payload.host,
      port: payload.port,
      edition: payload.edition,
      version: payload.version,
      username: payload.username,
      autoReconnect: payload.autoReconnect,
      retryDelay: payload.retryDelay,
      maxRetries: payload.maxRetries,
      timeoutMs: payload.timeoutMs,
    },
  });

  return NextResponse.json({ server });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertServerOwnership(params.id, session.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.server.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
