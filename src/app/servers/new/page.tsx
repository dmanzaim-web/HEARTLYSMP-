import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatUptime } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const servers = await prisma.server.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { runtime: true },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-accent">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold">Your servers</h1>
        </div>

        <Link href="/servers/new" className="btn-primary">+ Add Server</Link>
      </header>

      {servers.length === 0 ? (
        <div className="card p-16 text-center">
          <h2 className="text-3xl font-semibold">No Servers Yet</h2>
          <p className="mt-4 text-slate-400">Add your first Minecraft server to bring a bot online.</p>
          <Link href="/servers/new" className="btn-primary mt-8">+ Add Server</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {servers.map((server) => (
            <div key={server.id} className="card flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-lg font-semibold text-accent">
                  {server.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{server.name}</h3>
                  <p className="text-sm text-slate-400">{server.host}:{server.port}</p>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-5">
                <div>
                  <p className="text-slate-400">Edition</p>
                  <p>{server.edition}</p>
                </div>
                <div>
                  <p className="text-slate-400">Version</p>
                  <p>{server.version}</p>
                </div>
                <div>
                  <p className="text-slate-400">Status</p>
                  <p>{server.status}</p>
                </div>
                <div>
                  <p className="text-slate-400">Ping</p>
                  <p>{server.ping ?? 0}ms</p>
                </div>
                <div>
                  <p className="text-slate-400">Uptime</p>
                  <p>{formatUptime(server.uptime)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <form action={`/api/servers/${server.id}/bot/start`} method="POST">
                  <button type="submit" className="btn-primary">Start Bot</button>
                </form>
                <form action={`/api/servers/${server.id}/bot/stop`} method="POST">
                  <button type="submit" className="btn-secondary">Stop</button>
                </form>
                <Link href={`/servers/${server.id}`} className="btn-secondary">Information Panel</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
