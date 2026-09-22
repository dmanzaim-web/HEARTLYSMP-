import mineflayer from "mineflayer";
import { prisma } from "@/lib/prisma";
import { redactSensitiveText } from "@/lib/security";

const serverId = process.env.BOT_SERVER_ID;
const runtimeId = process.env.BOT_RUNTIME_ID;
if (!serverId || !runtimeId) throw new Error("BOT_SERVER_ID and BOT_RUNTIME_ID are required");

let stopping = false;
let retries = 0;
let bot: ReturnType<typeof mineflayer.createBot> | undefined;

async function write(level: string, event: string, message: string, meta: Record<string, unknown> = {}) {
  await prisma.botLog.create({ data: { serverId, runtimeId, level, event, message: redactSensitiveText(message), meta: JSON.stringify(meta) } }).catch(() => undefined);
}
async function state(status: string, error?: string) {
  await prisma.botRuntime.updateMany({ where: { serverId, runtimeId }, data: { status, state: status, lastHeartbeat: new Date(), lastError: error ?? null } });
}
async function run() {
  const server = await prisma.server.findFirst({ where: { id: serverId, runtime: { runtimeId } } });
  if (!server) throw new Error("Runtime ownership validation failed");
  await state("CONNECTING"); await write("info", "BOT_START", `Connecting to ${server.host}:${server.port}.`);
  bot = mineflayer.createBot({ host: server.host, port: server.port, username: server.username, version: server.version === "AUTO" ? false : server.version, auth: "offline" });
  bot.once("login", async () => { await state("ONLINE"); await write("info", "BOT_ONLINE", "Bot connected and is online."); retries = 0; });
  bot.once("spawn", async () => { await state("ONLINE"); await write("info", "BOT_SPAWN", "Bot spawned in the world."); });
  bot.on("chat", async (username, message) => { await prisma.chatMessage.create({ data: { serverId, player: username, message } }).catch(() => undefined); await write("info", "CHAT_MESSAGE", `${username}: ${message}`); });
  bot.on("kicked", async (reason) => { await write("warning", "BOT_KICKED", `Bot kicked: ${String(reason)}`); });
  bot.on("error", async (error) => { await state("ERROR", error.message); await write("error", "BOT_ERROR", error.message); });
  bot.on("end", async () => {
    bot = undefined;
    const current = await prisma.botRuntime.findUnique({ where: { serverId } });
    if (stopping || current?.manualStop) { await state("OFFLINE"); await write("info", "BOT_STOP", "Bot disconnected by user."); process.exit(0); }
    if (!server.autoReconnect || retries >= server.maxRetries) { await state("ERROR", "Maximum reconnect attempts reached"); await write("error", "RECONNECT_EXHAUSTED", "Maximum reconnect attempts reached."); process.exit(1); }
    retries += 1; const delay = Math.min(server.retryDelay * 1000 * Math.pow(2, retries - 1), 10 * 60 * 1000);
    await prisma.botRuntime.updateMany({ where: { serverId, runtimeId }, data: { status: "RECONNECTING", state: "RECONNECTING", reconnectCount: { increment: 1 }, lastError: "Connection lost" } });
    await write("warning", "BOT_RECONNECT", `Reconnecting in ${Math.round(delay / 1000)} seconds.`, { attempt: retries });
    setTimeout(() => run().catch(async (error) => { await state("ERROR", String(error)); await write("error", "BOT_ERROR", String(error)); process.exit(1); }), delay);
  });
  const heartbeat = setInterval(async () => { const current = await prisma.botRuntime.findUnique({ where: { serverId } }); if (!current || current.runtimeId !== runtimeId) { clearInterval(heartbeat); bot?.quit(); process.exit(0); } await state(current.status === "ONLINE" ? "ONLINE" : current.status); }, 15000);
}
process.on("SIGTERM", async () => { stopping = true; await state("STOPPING"); await write("info", "BOT_STOP", "Worker received stop signal."); bot?.quit("Stopped by user"); setTimeout(() => process.exit(0), 1000); });
run().catch(async (error) => { await state("ERROR", String(error)); await write("error", "BOT_ERROR", String(error)); process.exit(1); });