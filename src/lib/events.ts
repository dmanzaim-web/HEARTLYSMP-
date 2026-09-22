import { EventEmitter } from "events";
import { prisma } from "@/lib/prisma";
import { redactSensitiveText } from "@/lib/security";

export type BotEventType = "BOT_START" | "BOT_STOP" | "BOT_ONLINE" | "BOT_OFFLINE" | "BOT_RECONNECT" | "BOT_ERROR" | "BOT_KICKED" | "CHAT_MESSAGE" | "PLAYER_JOIN" | "PLAYER_LEAVE" | "AUTH_REQUIRED" | "AUTH_SUCCESS" | "AUTH_FAILED" | "COMMAND_EXECUTED" | "COMMAND_FAILED";
export const eventBus = new EventEmitter();

type EventInput = { serverId: string; runtimeId?: string; type: BotEventType; payload?: Record<string, unknown>; userId?: string; title?: string; message?: string };
export async function publishEvent(input: EventInput) {
  const payload = input.payload ?? {};
  const event = await prisma.botEvent.create({ data: { serverId: input.serverId, runtimeId: input.runtimeId, type: input.type, payload: JSON.stringify(payload) } });
  eventBus.emit(input.type, event);
  eventBus.emit("event", event);
  if (input.userId && input.title && input.message) await prisma.notification.create({ data: { userId: input.userId, serverId: input.serverId, type: input.type, title: input.title, message: redactSensitiveText(input.message) } });
  return event;
}
