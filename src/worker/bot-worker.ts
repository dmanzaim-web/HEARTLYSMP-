import { prisma } from "@/lib/prisma";
import { redactSensitiveText } from "@/lib/security";

const serverId = process.env.BOT_SERVER_ID;
if (!serverId) {
  throw new Error("BOT_SERVER_ID is required");
}

const buildLog = async (level: string, event: string, message: string, meta: Record<string, unknown> = {}) => {
  await prisma.botLog.create({
    data: {
      serverId,
      level,
      event,
      message: redactSensitiveText(message),
      meta: JSON.stringify(meta),
    },
  });
};

const updateState = async (status: string, state: string, lastError?: string) => {
  await prisma.botRuntime.upsert({
    where: { serverId },
    update: {
      status,
      state,
      lastError: lastError ?? null,
      lastHeartbeat: new Date(),
    },
    create: {
      serverId,
      status,
      state,
      lastHeartbeat: new Date(),
    },
  });
};

async function bootBot() {
  const server = await prisma.server.findUnique({ where: { id: serverId } });
  if (!server) {
    throw new Error("Server not found for initial worker bootstrap");
  }

  await updateState("CONNECTING", "CONNECTING");
  await buildLog("info", "BOT_START", `Minecraft bot boot sequence started for ${server.name}.`);

  const interval = setInterval(async () => {
    await updateState("ONLINE", "ONLINE");
    await buildLog("info", "BOT_ONLINE", `Runtime heartbeat for ${server.name}.`);
  }, 15000);

  process.on("SIGTERM", async () => {
    clearInterval(interval);
    await updateState("STOPPING", "STOPPING", "Worker terminated by signal.");
    await buildLog("warning", "BOT_STOP", `Worker stopped for ${server.name}.`);
    process.exit(0);
  });

  console.log(`BOT WORKER: ${server.name} ready`);

  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

bootBot().catch(async (error) => {
  await updateState("ERROR", "ERROR", String(error));
  console.error(error);
  process.exit(1);
});
