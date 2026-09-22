# Phase 4 Automation Engine

Implemented a database-backed Event → Conditions → Actions engine using the existing Phase 3 event bus and runtime manager.

Features include persisted automations, ordered conditions/actions, cooldowns, execution limits, chain/depth loop protection, an in-memory concurrency-limited queue, safe placeholders, CRUD APIs, enable/disable, test execution, and execution history.

Run `npx prisma generate && npx prisma db push` after pulling the change. Automation actions never execute operating-system commands; chat and command actions are sent through the Mineflayer runtime manager.

The scheduler data fields are persisted and ready for a worker tick implementation. Redis, distributed locks, and production multi-worker scheduling are intentionally deferred.
