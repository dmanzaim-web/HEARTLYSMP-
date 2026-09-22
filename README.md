# HEARTLYSMP

HEARTLYSMP is a professional SaaS platform for managing 24/7 Minecraft bot hosting, server monitoring, runtime control, and automation workflows.

## Overview
- Secure authentication with email/password and OAuth providers
- Multi-server dashboard with ownership enforcement
- Bot runtime manager with independent worker process
- Server testing, logs, monitoring, and real-time updates
- PostgreSQL/SQLite-friendly Prisma schema ready for extension

## Architecture
- Frontend: Next.js 14 App Router + Tailwind CSS
- Backend: Next.js API routes and server actions
- Auth: NextAuth with credentials + OAuth providers
- Database: Prisma + SQLite (local dev)
- Runtime: background bot worker process per server

## Requirements
- Node.js 20+
- npm
- SQLite support

## Installation
1. Copy `.env.example` to `.env` and update credentials.
2. Install dependencies:
   npm install
3. Create or update the database schema:
   npx prisma db push
4. Start the development server:
   npm run dev
5. In another terminal, start the bot worker:
   npm run worker

## Production Build
npm run build
npm run start

## Database
Generate Prisma client:

npx prisma generate

Apply migrations:

npx prisma migrate dev --name init

## OAuth Setup
Set the relevant provider credentials in `.env` for Google, GitHub, Discord, or Microsoft. If a provider is omitted, it is automatically disabled. No real secrets are committed to the repository.

## Runtime Notes
Each server has a dedicated bot runtime state stored in the database, and a worker process can be started independently from the web request lifecycle. This keeps the bot alive while the browser is closed.

## Security Notes
- Protected routes and ownership checks
- Input validation with Zod
- SQL safety through Prisma parameterized queries
- Secret redaction before log storage
- Session management and secure cookies via NextAuth

## Troubleshooting
- If Prisma errors occur, run `npx prisma generate` and `npx prisma db push`.
- If auth fails, ensure `AUTH_SECRET` and provider credentials are set.
- If the worker does not start, verify `BOT_SERVER_ID` and the database connection.

## Important implementation note
This repository was initialized with a real SaaS foundation. It includes authentication, server management, bot runtime scaffolding, database models, and a dashboard flow that is designed to be extended into a full production deployment. Advanced protocol-specific modules (Bedrock, workflow builder, drag-and-drop UI, and full metrics retention) are scaffolded with practical, extensible abstractions rather than fake front-end placeholders.
