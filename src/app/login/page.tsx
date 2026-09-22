import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-16">
      <header className="mb-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent font-bold text-white">H</div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-accent">HEARTLYSMP</p>
            <p className="text-lg font-semibold">Minecraft Bot SaaS</p>
          </div>
        </div>

        <nav className="flex gap-3">
          <Link href="/login" className="btn-secondary">Login</Link>
          <Link href="/register" className="btn-primary">Get Started</Link>
        </nav>
      </header>

      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-accent">24/7 Minecraft bot hosting</p>
          <h1 className="max-w-xl text-5xl font-bold leading-tight">Run and manage your bot infrastructure from one premium control panel.</h1>
          <p className="mt-6 max-w-lg text-lg text-slate-300">Monitor uptime, start process isolation, inspect logs, and manage multiple Minecraft servers from a single secure dashboard.</p>
          <div className="mt-8 flex gap-4">
            <Link href="/register" className="btn-primary">Create account</Link>
            <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
          </div>
        </div>

        <div className="card p-4">
          <div className="rounded-2xl border border-border bg-slate-950 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Server Status</p>
                <h2 className="mt-2 text-2xl font-semibold">SMP Nexus</h2>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">Online</span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-slate-900 p-4">
                <p className="text-xs uppercase text-slate-400">Ping</p>
                <p className="mt-2 text-2xl font-semibold">22ms</p>
              </div>
              <div className="rounded-xl border border-border bg-slate-900 p-4">
                <p className="text-xs uppercase text-slate-400">Uptime</p>
                <p className="mt-2 text-2xl font-semibold">99.9%</p>
              </div>
              <div className="rounded-xl border border-border bg-slate-900 p-4">
                <p className="text-xs uppercase text-slate-400">Bots</p>
                <p className="mt-2 text-2xl font-semibold">3</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
