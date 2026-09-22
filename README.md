import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/session";
import { assertServerOwnership } from "@/lib/security";
import { MinecraftAdapter } from "@/lib/minecraft-adapter";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    await assertServerOwnership(params.id, session.user.id);
  } catch {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const server = await (await import("@/lib/prisma")).prisma.server.findUnique({ where: { id: params.id } });
  if (!server) return NextResponse.json({ success: false, error: "Server not found" }, { status: 404 });
  const result = await new MinecraftAdapter().probeServer(server.host, server.port, server.edition as "Java" | "Bedrock" | "Auto Detect");
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
