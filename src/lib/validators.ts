import { z } from "zod";

const hostSchema = z.string().trim().min(1, "Host is required").max(255).refine(
  (value) => !/[\s/:]/.test(value),
  "Enter a hostname or IP address without a protocol or path"
);

export const serverConnectionSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).regex(/^[\p{L}\p{N}][\p{L}\p{N} _.-]*$/u, "Name contains invalid characters"),
  host: hostSchema,
  port: z.coerce.number().int().min(1).max(65535),
  edition: z.enum(["Java", "Bedrock", "Auto Detect"]),
  version: z.string().trim().min(1).max(50),
  autoDetectVersion: z.boolean().optional().default(false),
});

export const serverCreateSchema = serverConnectionSchema.extend({
  username: z.string().trim().min(3, "Bot username must be at least 3 characters").max(50).regex(/^[A-Za-z0-9_]+$/, "Bot username contains invalid characters"),
  autoReconnect: z.boolean().optional().default(true),
  retryDelay: z.coerce.number().int().min(1).max(120).optional().default(10),
  maxRetries: z.coerce.number().int().min(0).max(50).optional().default(5),
  timeoutMs: z.coerce.number().int().min(5000).max(120000).optional().default(30000),
});
