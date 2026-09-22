# Phase 4 completion

The automation schema, event listener, scheduler process, atomic due-job claim, CRUD APIs, execution history, safe placeholders, conditions, cooldowns, execution limits, loop-depth protection, and dark/orange automation panel foundation are included.

Run `npm install`, `npx prisma generate`, and `npx prisma db push`. Start the scheduler separately with `npm run scheduler`. The scheduler uses SQLite atomic claims and is intentionally ready to be replaced by Redis/BullMQ later.
