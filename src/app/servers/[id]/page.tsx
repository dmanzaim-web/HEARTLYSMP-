"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewServerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    host: "",
    port: 25565,
    edition: "Java",
    version: "1.20.4",
    username: "",
  });
  const [pending, setPending] = useState(false);

  const update = (key: string, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onTest = async () => {
    const response = await fetch("/api/servers/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: form.host, port: form.port }),
    });

    const data = await response.json();
    alert(JSON.stringify(data, null, 2));
  };

  const onSubmit = async () => {
    setPending(true);

    const response = await fetch("/api/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setPending(false);

    if (response.ok) {
      router.push("/dashboard");
      return;
    }

    const data = await response.json();
    alert(data.error || "Unable to add server");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="card p-8">
        <h1 className="text-3xl font-semibold">Add Server</h1>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Server Name</label>
            <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Bot Username</label>
            <input className="input" value={form.username} onChange={(e) => update("username", e.target.value)} />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Server IP / Domain</label>
            <input className="input" value={form.host} onChange={(e) => update("host", e.target.value)} />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Port</label>
            <input className="input" type="number" value={form.port} onChange={(e) => update("port", Number(e.target.value))} />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Edition</label>
            <select className="input" value={form.edition} onChange={(e) => update("edition", e.target.value)}>
              <option value="Java">Java</option>
              <option value="Bedrock">Bedrock</option>
              <option value="Auto Detect">Auto Detect</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Version</label>
            <input className="input" value={form.version} onChange={(e) => update("version", e.target.value)} />
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button type="button" className="btn-secondary" onClick={onTest}>Test Connection</button>
          <button type="button" className="btn-primary" onClick={onSubmit} disabled={pending}>
            {pending ? "Adding..." : "Add Server"}
          </button>
        </div>
      </div>
    </main>
  );
}
