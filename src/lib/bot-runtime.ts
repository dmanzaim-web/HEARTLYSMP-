import { spawn } from "child_process";

import { prisma } from "@/lib/prisma";
import { redactSensitiveText } from "@/lib/security";

export type BotConnectionState =
  | "OFFLINE"
  | "STARTING"
  | "CONNECTING"
  | "AUTHENTICATING"
  | "ONLINE"
  | "RECONNECTING"
  | "STOPPING"
  | "ERROR";

export class BotRuntimeManager {
  async startBot(serverId: string) {
    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) {
      throw new Error("Server not found");
    }

    const runtime = await prisma.botRuntime.upsert({
      where: { serverId },
      update: {
        status: "STARTING",
        state: "STARTING",
        lastHeartbeat: new Date(),
        startedAt: new Date(),
      },
      create: {
        serverId,
        status: "STARTING",
        state: "STARTING",
        lastHeartbeat: new Date(),
        startedAt: new Date(),
      },
    });

    const child = spawn("npx", ["tsx", "src/worker/bot-worker.ts"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        BOT_SERVER_ID: serverId,
        BOT_SERVER_NAME: server.name,
        BOT_HOST: server.host,
        BOT_PORT: String(server.port),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout?.on("data", (chunk) => {
      const value = redactSensitiveText(String(chunk));
      console.log(`[BOT:${serverId}] ${value}`);
    });

    child.stderr?.on("data", (chunk) => {
      const value = redactSensitiveText(String(chunk));
      console.error(`[BOT:${serverId}] ${value}`);
    });

    child.on("exit", async (code) => {
      await prisma.botRuntime.update({
        where: { id: runtime.id },
        data: {
          status: code === 0 ? "OFFLINE" : "ERROR",
          state: code === 0 ? "OFFLINE" : "ERROR",
          lastError: code === 0 ? "Bot process exited cleanly." : `Process exited with code ${code}`,
          stoppedAt: new Date(),
        },
      });
    });

    await prisma.botRuntime.update({
      where: { id: runtime.id },
      data: {
        pid: child.pid ?? null,
        processId: child.pid ?? null,
        status: "CONNECTING",
        state: "CONNECTING",
        lastHeartbeat: new Date(),
      },
    });

    return { ok: true, runtimeId: runtime.id, pid: child.pid };
  }

  async stopBot(serverId: string) {
    const runtime = await prisma.botRuntime.findUnique({ where: { serverId } });
    if (!runtime || !runtime.pid) {
      await prisma.botRuntime.update({
        where: { serverId },
        data: {
          status: "OFFLINE",
          state: "OFFLINE",
          lastError: "Stopped by user",
          stoppedAt: new Date(),
        },
      }).catch(() => undefined);
      return { ok: true };
    }

    try {
      process.kill(runtime.pid, "SIGTERM");
    } catch {
      // ignore stop errors
    }

    await prisma.botRuntime.update({
      where: { serverId },
      data: {
        status: "STOPPING",
        state: "STOPPING",
        stoppedAt: new Date(),
      },
    });

    return { ok: true, pid: runtime.pid };
  }

  async restartBot(serverId: string) {
    await this.stopBot(serverId);
    return this.startBot(serverId);
  }
}
