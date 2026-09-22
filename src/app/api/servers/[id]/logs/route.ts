import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { assertServerOwnership } from "@/lib/security";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { await assertServerOwnership(params.id, session.user.id); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const url = new URL(request.url); const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 100); const cursor = url.searchParams.get("cursor") || undefined; const level = url.searchParams.get("level") || undefined; const search = url.searchParams.get("search") || undefined;
  const logs = await prisma.botLog.findMany({ where: { serverId: params.id, ...(level ? { level } : {}), ...(search ? { message: { contains: search } } : {}) }, orderBy: { createdAt: "desc" }, take: limit + 1, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) });
  const nextCursor = logs.length > limit ? logs.pop()?.id ?? null : null;
  return NextResponse.json({ logs, nextCursor });
}