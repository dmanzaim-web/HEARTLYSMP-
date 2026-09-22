import { randomUUID } from "crypto";
import { spawn, type ChildProcess } from "child_process";
import { prisma } from "@/lib/prisma";
import { redactSensitiveText } from "@/lib/security";
import { publishEvent, type BotEventType } from "@/lib/events";
export type BotConnectionState = "OFFLINE" | "STARTING" | "CONNECTING" | "AUTHENTICATING" | "ONLINE" | "RECONNECTING" | "STOPPING" | "ERROR";
type RuntimeProcess = { child: ChildProcess; runtimeId: string; chat?: (message: string) => void; command?: (command: string) => void };
const registry = new Map<string, RuntimeProcess>();
async function log(serverId: string, runtimeId: string | undefined, level: string, event: string, message: string, meta: Record<string, unknown> = {}) { await prisma.botLog.create({ data: { serverId, runtimeId, level, event, message: redactSensitiveText(message), meta: JSON.stringify(meta) } }); }
export function registerRuntime(serverId: string, process: RuntimeProcess) { registry.set(serverId, process); }
export function unregisterRuntime(serverId: string) { registry.delete(serverId); }
export class BotRuntimeManager {
  async getRuntime(serverId: string) { return prisma.botRuntime.findUnique({ where: { serverId } }); }
  async getStatus(serverId: string) { return (await this.getRuntime(serverId))?.status ?? "OFFLINE"; }
  async sendChat(serverId: string, message: string) { const runtime = await this.getRuntime(serverId); const active = registry.get(serverId); if (!runtime || runtime.status !== "ONLINE" || !active?.chat) throw new Error("BOT_NOT_ONLINE"); active.chat(message); await log(serverId, runtime.runtimeId, "info", "CHAT_SENT", `Sent chat message: ${message}`); return { success: true }; }
  async sendCommand(serverId: string, command: string) { const runtime = await this.getRuntime(serverId); const active = registry.get(serverId); if (!runtime || runtime.status !== "ONLINE" || !active?.command) throw new Error("BOT_NOT_ONLINE"); active.command(command); await log(serverId, runtime.runtimeId, "info", "COMMAND_SENT", `Executed Minecraft command: ${command}`); return { success: true }; }
  async startBot(serverId: string) {
    const server = await prisma.server.findUnique({ where: { id: serverId } }); if (!server) throw new Error("Server not found");
    const existing = await prisma.botRuntime.findUnique({ where: { serverId } });
    if (existing && ["STARTING", "CONNECTING", "AUTHENTICATING", "ONLINE", "RECONNECTING", "STOPPING"].includes(existing.status)) return { success: true, alreadyRunning: true, status: existing.status, runtimeId: existing.runtimeId };
    if (registry.has(serverId)) return { success: true, alreadyRunning: true, status: existing?.status ?? "STARTING", runtimeId: existing?.runtimeId };
    const runtimeId = randomUUID();
    const runtime = await prisma.botRuntime.upsert({ where: { serverId }, update: { userId: server.userId, runtimeId, status: "STARTING", state: "STARTING", manualStop: false, lastError: null, startedAt: new Date(), stoppedAt: null }, create: { serverId, userId: server.userId, runtimeId, status: "STARTING", state: "STARTING", manualStop: false, startedAt: new Date() } });
    const tsx = require.resolve("tsx/cli"); const child = spawn(process.execPath, [tsx, "src/worker/bot-worker.ts"], { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, BOT_SERVER_ID: serverId, BOT_RUNTIME_ID: runtimeId } });
    registry.set(serverId, { child, runtimeId });
    child.stderr?.on("data", async (chunk) => { const message = redactSensitiveText(String(chunk)); await log(serverId, runtimeId, "error", "PROCESS_OUTPUT", message).catch(() => undefined); });
    child.once("exit", async (code, signal) => { unregisterRuntime(serverId); const current = await prisma.botRuntime.findUnique({ where: { serverId } }); if (!current || current.runtimeId !== runtimeId) return; const manual = current.manualStop; await log(serverId, runtimeId, manual ? "info" : "error", "PROCESS_EXIT", `Worker exited (${code ?? signal ?? "unknown"})`, { code, signal }); await prisma.botRuntime.update({ where: { serverId }, data: { status: manual ? "OFFLINE" : "ERROR", state: manual ? "OFFLINE" : "ERROR", pid: null, processId: null, stoppedAt: new Date(), lastError: manual ? null : `Worker exited (${code ?? signal ?? "unknown"})`, crashCount: manual ? current.crashCount : { increment: 1 } } }); await publishEvent({ serverId, runtimeId, type: manual ? "BOT_OFFLINE" : "BOT_ERROR", userId: server.userId, title: manual ? "Bot offline" : "Bot error", message: manual ? `${server.name} stopped` : `${server.name} worker exited` }); });
    await prisma.botRuntime.update({ where: { serverId }, data: { pid: child.pid ?? null, processId: child.pid ?? null, status: "CONNECTING", state: "CONNECTING", lastHeartbeat: new Date() } }); await publishEvent({ serverId, runtimeId, type: "BOT_START", userId: server.userId, title: "Bot starting", message: `${server.name} is starting` }); return { success: true, alreadyRunning: false, status: "CONNECTING", runtimeId, pid: child.pid };
  }
  async stopBot(serverId: string) { const runtime = await this.getRuntime(serverId); if (!runtime || runtime.status === "OFFLINE") return { success: true, alreadyStopped: true, status: "OFFLINE" }; await prisma.botRuntime.update({ where: { serverId }, data: { manualStop: true, status: "STOPPING", state: "STOPPING" } }); const active = registry.get(serverId); const pid = active?.child.pid ?? runtime.pid; if (pid) { try { process.kill(pid, "SIGTERM"); } catch {} } return { success: true, status: active ? "STOPPING" : "OFFLINE" }; }
  async restartBot(serverId: string) { await this.stopBot(serverId); await new Promise((resolve) => setTimeout(resolve, 500)); return this.startBot(serverId); }
}
