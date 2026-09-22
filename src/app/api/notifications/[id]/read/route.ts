import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
export async function POST(_: Request, { params }: { params: { id: string } }) { const session = await getServerSession(); if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await prisma.notification.updateMany({ where: { id: params.id, userId: session.user.id }, data: { read: true } }); return NextResponse.json({ success: true }); }