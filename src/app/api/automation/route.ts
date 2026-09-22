import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ uptime: 0, ping: 0 });
}
