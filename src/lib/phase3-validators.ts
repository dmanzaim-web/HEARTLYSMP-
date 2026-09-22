import { z } from "zod";
export const chatSchema = z.object({ message: z.string().trim().min(1).max(256) });
export const commandSchema = z.object({ command: z.string().trim().min(1).max(256).refine((v) => !/[\\\n\r\0]/.test(v), "Invalid command") });
export const authConfigSchema = z.object({ enabled: z.boolean(), loginCommand: z.string().max(256).optional(), registerCommand: z.string().max(256).optional(), triggerPattern: z.string().max(256).optional(), delaySeconds: z.number().int().min(0).max(60), password: z.string().max(256).optional() });
