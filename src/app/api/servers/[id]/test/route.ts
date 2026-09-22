import { NextResponse } from "next/server";

import { MinecraftAdapter } from "@/lib/minecraft-adapter";

export async function POST(request: Request) {
  const body = await request.json();
  const adapter = new MinecraftAdapter();
  const result = await adapter.probeServer(String(body.host || "localhost"), Number(body.port || 25565));

  return NextResponse.json({ ok: true, result });
}
