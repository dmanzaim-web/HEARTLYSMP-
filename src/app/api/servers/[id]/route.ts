import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { serverCreateSchema } from "@/lib/validators";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const servers = await prisma.server.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { runtime: true },
  });

  return NextResponse.json({ servers });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = serverCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const server = await prisma.server.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      host: parsed.data.host,
      port: parsed.data.port,
      edition: parsed.data.edition,
      version: parsed.data.version,
      username: parsed.data.username,
      autoReconnect: parsed.data.autoReconnect,
      retryDelay: parsed.data.retryDelay,
      maxRetries: parsed.data.maxRetries,
      timeoutMs: parsed.data.timeoutMs,
    },
    include: { runtime: true },
  });

  return NextResponse.json({ server }, { status: 201 });
}
