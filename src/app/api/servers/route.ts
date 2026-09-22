import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { MinecraftAdapter } from "@/lib/minecraft-adapter";
import { serverCreateSchema } from "@/lib/validators";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const servers = await prisma.server.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { runtime: true },
  });
  return NextResponse.json({ servers });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = serverCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid server data", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  const server = await prisma.server.create({
    data: {
      userId: session.user.id,
      name: data.name,
      host: data.host,
      port: data.port,
      edition: data.edition,
      version: data.autoDetectVersion ? "AUTO" : data.version,
      username: data.username,
      autoReconnect: data.autoReconnect,
      retryDelay: data.retryDelay,
      maxRetries: data.maxRetries,
      timeoutMs: data.timeoutMs,
    },
  });

  let probe = null;
  if (data.autoDetectVersion || data.edition === "Auto Detect") {
    probe = await new MinecraftAdapter().probeServer(data.host, data.port, data.edition);
    if (probe.success) {
      await prisma.server.update({
        where: { id: server.id },
        data: {
          edition: probe.edition === "JAVA" ? "Java" : probe.edition === "BEDROCK" ? "Bedrock" : data.edition,
          version: probe.version ?? data.version,
          ping: probe.latency,
        },
      });
    }
  }

  const saved = await prisma.server.findUnique({ where: { id: server.id }, include: { runtime: true } });
  return NextResponse.json({ server: saved, probe }, { status: 201 });
}
