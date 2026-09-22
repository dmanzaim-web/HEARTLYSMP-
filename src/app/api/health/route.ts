import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/session";
import { assertServerOwnership } from "@/lib/security";
import { MinecraftAdapter } from "@/lib/minecraft-adapter";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertServerOwnership(params.id, session.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const adapter = new MinecraftAdapter();
  const result = await adapter.probeServer(String(body.host || "localhost"), Number(body.port || 25565));

  return NextResponse.json({ ok: true, result });
}
