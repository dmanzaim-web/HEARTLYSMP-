import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export default async function ServerDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const server = await prisma.server.findUnique({
    where: { id: params.id },
    include: { runtime: true, logs: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!server || server.userId !== session.user.id) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-accent">Server</p>
          <h1 className="mt-2 text-3xl font-semibold">{server.name}</h1>
        </div>
        <Link href="/dashboard" className="btn-secondary">Back to dashboard</Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-xl font-semibold">Overview</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-border bg-slate-900 p-4"><p className="text-slate-400">IP</p><p>{server.host}</p></div>
            <div className="rounded-xl border border-border bg-slate-900 p-4"><p className="text-slate-400">Port</p><p>{server.port}</p></div>
            <div className="rounded-xl border border-border bg-slate-900 p-4"><p className="text-slate-400">Edition</p><p>{server.edition}</p></div>
            <div className="rounded-xl border border-border bg-slate-900 p-4"><p className="text-slate-400">Version</p><p>{server.version}</p></div>
            <div className="rounded-xl border border-border bg-slate-900 p-4"><p className="text-slate-400">Server Status</p><p>{server.status}</p></div>
            <div className="rounded-xl border border-border bg-slate-900 p-4"><p className="text-slate-400">Bot Status</p><p>{server.runtime?.status ?? "OFFLINE"}</p></div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-xl font-semibold">Controls</h2>
          <div className="mt-6 space-y-3">
            <form action={`/api/servers/${server.id}/bot/start`} method="POST"><button type="submit" className="btn-primary w-full">Start</button></form>
            <form action={`/api/servers/${server.id}/bot/stop`} method="POST"><button type="submit" className="btn-secondary w-full">Stop</button></form>
            <form action={`/api/servers/${server.id}/bot/restart`} method="POST"><button type="submit" className="btn-secondary w-full">Restart</button></form>
          </div>
        </div>
      </div>

      <div className="mt-8 card p-5">
        <h2 className="text-xl font-semibold">Live Console</h2>
        <div className="mt-4 space-y-2">
          {server.logs.length === 0 ? (
            <p className="text-slate-400">No logs yet.</p>
          ) : (
            server.logs.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-border bg-slate-900 px-3 py-2 text-sm">
                <span className="mr-2 text-accent">[{entry.level}]</span>
                {entry.message}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
