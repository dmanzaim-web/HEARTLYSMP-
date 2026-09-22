import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function assertServerOwnership(serverId: string, userId: string) {
  const server = await prisma.server.findUnique({
    where: { id: serverId },
    select: { userId: true },
  });

  if (!server) {
    throw new Error("Server not found");
  }

  if (server.userId !== userId) {
    throw new Error("Forbidden");
  }

  return server;
}

export function redactSensitiveText(input: string) {
  const patterns = [
    /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b)/g,
    /(Bearer\s+[A-Za-z0-9-._~+/]+=*)/gi,
    /(token\s*[:=]\s*['\"]?[^\s'\"]+)/gi,
    /(password\s*[:=]\s*['\"]?[^\s'\"]+)/gi,
    /(secret\s*[:=]\s*['\"]?[^\s'\"]+)/gi,
  ];

  let output = input;
  for (const pattern of patterns) {
    output = output.replace(pattern, "[REDACTED]");
  }

  return output;
}
