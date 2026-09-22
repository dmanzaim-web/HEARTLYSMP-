import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/session";
import { MinecraftAdapter } from "@/lib/minecraft-adapter";
import { serverConnectionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = serverConnectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid server data", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await new MinecraftAdapter().probeServer(parsed.data.host, parsed.data.port, parsed.data.edition);
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch {
    return NextResponse.json({ success: false, online: false, error: "Connection failed" }, { status: 502 });
  }
}
