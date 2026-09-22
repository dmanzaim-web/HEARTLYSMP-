"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const initialForm = {
  name: "",
  host: "",
  port: 25565,
  edition: "Java",
  version: "1.21",
  autoDetectVersion: false,
  username: "",
};

export default function NewServerPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [pending, setPending] = useState<"test" | "save" | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);

  const update = (key: string, value: string | number | boolean) => setForm((current) => ({ ...current, [key]: value }));

  async function testConnection(event: FormEvent) {
    event.preventDefault();
    setPending("test");
    setResult(null);
    try {
      const response = await fetch("/api/servers/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      setResult({
        success: Boolean(data.success),
        message: data.success ? "Server is online" : data.error ?? "Connection failed",
        details: data.success ? `${data.edition} · ${data.version ?? "Unknown version"} · ${data.players.online}/${data.players.max} players · ${data.latency ?? "-"}ms` : undefined,
      });
    } catch {
      setResult({ success: false, message: "Connection failed" });
    } finally {
      setPending(null);
    }
  }

  async function saveServer(event: FormEvent) {
    event.preventDefault();
    setPending("save");
    setResult(null);
    try {
      const response = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setResult({ success: false, message: data.error ?? "Unable to save server" });
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <form className="card p-8" onSubmit={saveServer}>
        <p className="text-xs uppercase tracking-[0.25em] text-accent">Server management</p>
        <h1 className="mt-2 text-3xl font-semibold">Add Server</h1>
        <p className="mt-2 text-sm text-slate-400">Connection tests use the Minecraft status protocol; no mock response is returned.</p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="text-sm text-slate-300">Server Name<input className="input mt-2" value={form.name} onChange={(e) => update("name", e.target.value)} required /></label>
          <label className="text-sm text-slate-300">Bot Username<input className="input mt-2" value={form.username} onChange={(e) => update("username", e.target.value)} required /></label>
          <label className="text-sm text-slate-300">Host / IP / Domain<input className="input mt-2" value={form.host} onChange={(e) => update("host", e.target.value)} required /></label>
          <label className="text-sm text-slate-300">Port<input className="input mt-2" type="number" min={1} max={65535} value={form.port} onChange={(e) => update("port", Number(e.target.value))} required /></label>
          <label className="text-sm text-slate-300">Edition<select className="input mt-2" value={form.edition} onChange={(e) => update("edition", e.target.value)}><option>Java</option><option>Bedrock</option><option>Auto Detect</option></select></label>
          <label className="text-sm text-slate-300">Minecraft Version<input className="input mt-2" value={form.version} onChange={(e) => update("version", e.target.value)} disabled={form.autoDetectVersion} required={!form.autoDetectVersion} /></label>
        </div>

        <label className="mt-5 flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={form.autoDetectVersion} onChange={(e) => update("autoDetectVersion", e.target.checked)} /> Auto Detect Version when saving</label>

        {result && <div className={`mt-6 rounded-xl border p-4 ${result.success ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-red-500/40 bg-red-500/10 text-red-200"}`}><p>{result.message}</p>{result.details && <p className="mt-1 text-sm opacity-80">{result.details}</p>}</div>}

        <div className="mt-8 flex flex-wrap gap-4"><button type="button" className="btn-secondary" onClick={testConnection} disabled={pending !== null}>{pending === "test" ? "Testing..." : "Test Connection"}</button><button type="submit" className="btn-primary" disabled={pending !== null}>{pending === "save" ? "Saving..." : "Add Server"}</button></div>
      </form>
    </main>
  );
}
