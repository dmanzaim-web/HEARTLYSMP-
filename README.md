# Phase 4 completed

Phase 4 now includes Prisma-valid automation relations and indexes, a server-side scheduler process, atomic due-job claiming, event listener startup wiring, persisted execution history, safe condition matching/placeholders, cooldown and execution limits, loop depth protection, and an Information Panel automation UI backed by the API.

Run:

```bash
npm install
npx prisma generate
npx prisma db push
npm run typecheck
npm run build
```

Run `npm run scheduler` as a separate long-running service. The scheduler is intentionally in-memory/process-local and uses SQLite atomic claims; Redis/BullMQ is deferred. Events emitted by the bot worker load the automation listener in that worker process.
