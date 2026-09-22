import { randomUUID } from "crypto";
import { spawn, type ChildProcess } from "child_process";

import { prisma } from "@/lib/prisma";
import { redactSensitiveText } from "@/lib/security";

export type BotConnectionState = "OFFLINE" | "STARTING" | "CONNECTING" | "AUTHENTICATING" | "ONLINE" | "RECONNECTING" | "STOPPING" | "ERROR";

type RuntimeProcess = { child: ChildProcess; runtimeId: string };
const registry = new Map<string, RuntimeProcess>();

async function log(serverId: string, runtimeId: string | undefined, level: string, event: string, message: string, meta: Record<string, unknown> = {}) {
  await prisma.botLog.create({ data: { serverId, runtimeId, level, event, message: redactSensitiveText(message), meta: JSON.stringify(meta) } });
}

export class BotRuntimeManager {
  async getRuntime(serverId: string) { return prisma.botRuntime.findUnique({ where: { serverId } }); }
  async getStatus(serverId: string) { return (await this.getRuntime(serverId))?.status ?? "OFFLINE"; }

  async startBot(serverId: string) {
    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) throw new Error("Server not found");

    const existing = await prisma.botRuntime.findUnique({ where: { serverId } });
    if (existing && ["STARTING", "CONNECTING", "AUTHENTICATING", "ONLINE", "RECONNECTING", "STOPPING"].includes(existing.status)) {
      return { success: true, alreadyRunning: true, status: existing.status, runtimeId: existing.runtimeId };
    }

    const runtimeId = randomUUID();
    let runtime;
    try {
      runtime = await prisma.botRuntime.upsert({
        where: { serverId },
        update: { userId: server.userId, runtimeId, status: "STARTING", state: "STARTING", manualStop: false, lastError: null, startedAt: new Date(), stoppedAt: null },
        create: { serverId, userId: server.userId, runtimeId, status: "STARTING", state: "STARTING", manualStop: false, startedAt: new Date() },
      });
    } catch {
      const current = await prisma.botRuntime.findUnique({ where: { serverId } });
      if (current && current.status !== "OFFLINE" && current.status !== "ERROR") return { success: true, alreadyRunning: true, status: current.status, runtimeId: current.runtimeId };
      throw new Error("Runtime lock could not be acquired");
    }

    if (registry.has(serverId)) return { success: true, alreadyRunning: true, status: runtime.status, runtimeId };

    const tsx = require.resolve("tsx/cli");
    const child = spawn(process.execPath, [tsx, "src/worker/bot-worker.ts"], {
      cwd: process.cwd(), detached: false, stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, BOT_SERVER_ID: serverId, BOT_RUNTIME_ID: runtimeId },
    });
    registry.set(serverId, { child, runtimeId });

    child.stdout?.on("data", (chunk) => console.log(`[BOT:${serverId}] ${redactSensitiveText(String(chunk))}`));
    child.stderr?.on("data", async (chunk) => { const message = redactSensitiveText(String(chunk)); console.error(`[BOT:${serverId}] ${message}`); await log(serverId, runtimeId, "error", "PROCESS_OUTPUT", message).catch(() => undefined); });
    child.once("exit", async (code, signal) => {
      registry.delete(serverId);
      const current = await prisma.botRuntime.findUnique({ where: { serverId } });
      if (!current || current.runtimeId !== runtimeId) return;
      const manual = current.manualStop;
      await log(serverId, runtimeId, manual ? "info" : "error", "PROCESS_EXIT", `Worker exited${code !== null ? ` with code ${code}` : ""}${signal ? ` via ${signal}` : ""}.`, { code, signal });
      await prisma.botRuntime.update({ where: { serverId }, data: { status: manual ? "OFFLINE" : "ERROR", state: manual ? "OFFLINE" : "ERROR", pid: null, processId: null, stoppedAt: new Date(), lastError: manual ? null : `Worker exited (${code ?? signal ?? "unknown"})`, crashCount: manual ? current.crashCount : { increment: 1 } } });
    });
    await prisma.botRuntime.update({ where: { serverId }, data: { pid: child.pid ?? null, processId: child.pid ?? null, status: "CONNECTING", state: "CONNECTING", lastHeartbeat: new Date() } });
    await log(serverId, runtimeId, "info", "PROCESS_START", "Bot worker process started.");
    return { success: true, alreadyRunning: false, status: "CONNECTING", runtimeId, pid: child.pid };
  }

  async stopBot(serverId: string) {
    const runtime = await prisma.botRuntime.findUnique({ where: { serverId } });
    if (!runtime || runtime.status === "OFFLINE") return { success: true, alreadyStopped: true, status: "OFFLINE" };
    await prisma.botRuntime.update({ where: { serverId }, data: { manualStop: true, status: "STOPPING", state: "STOPPING" } });
    const processRef = registry.get(serverId);
    const pid = processRef?.child.pid ?? runtime.pid;
    if (pid) { try { process.kill(pid, "SIGTERM"); } catch { /* already exited */ } }
    if (!processRef && pid) await prisma.botRuntime.update({ where: { serverId }, data: { status: "OFFLINE", state: "OFFLINE", pid: null, processId: null, stoppedAt: new Date() } });
    return { success: true, status: processRef ? "STOPPING" : "OFFLINE" };
  }

  async restartBot(serverId: string) { await this.stopBot(serverId); await new Promise((resolve) => setTimeout(resolve, 250)); return this.startBot(serverId); }
  async heartbeat(serverId: string, runtimeId: string, status: BotConnectionState) {
    await prisma.botRuntime.updateMany({ where: { serverId, runtimeId }, data: { status, state: status, lastHeartbeat: new Date() } });
  }
}