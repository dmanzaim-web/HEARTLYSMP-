import { z } from "zod";

export const serverCreateSchema = z.object({
  name: z.string().min(2).max(100),
  host: z.string().min(2).max(255),
  port: z.coerce.number().int().min(1).max(65535),
  edition: z.enum(["Java", "Bedrock", "Auto Detect"]),
  version: z.string().min(1).max(50),
  username: z.string().min(3).max(50),
  autoReconnect: z.boolean().optional().default(true),
  retryDelay: z.coerce.number().int().min(1).max(120).optional().default(10),
  maxRetries: z.coerce.number().int().min(0).max(50).optional().default(5),
  timeoutMs: z.coerce.number().int().min(5000).max(120000).optional().default(30000),
});
