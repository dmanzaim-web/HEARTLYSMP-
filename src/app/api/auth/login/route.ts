import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Account already exists." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: name || email.split("@")[0],
      passwordHash: await hash(password, 12),
    },
  });

  return NextResponse.json({ user: { id: user.id, email, name: user.name } }, { status: 201 });
}
