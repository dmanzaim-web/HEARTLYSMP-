# Phase 3

Phase 3 adds real Java chat and command delivery through the Mineflayer worker, persisted event history, encrypted authentication configuration primitives, and notification APIs. Bedrock bot runtime is not claimed; only Bedrock status probing is supported.

Chat and commands require an ONLINE Java runtime. Commands are sent to Minecraft through Mineflayer and never executed by the operating system.

Set `BOT_SECRET_ENCRYPTION_KEY` before using encrypted authentication secrets. Run `npx prisma db push` after updating the schema.
