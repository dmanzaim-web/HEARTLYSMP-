"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    await signIn("credentials", { email, password, redirect: true, callbackUrl: "/dashboard" });
    setPending(false);
  }

  return (
    <div className="card w-full max-w-md p-8">
      <h2 className="text-3xl font-semibold">Welcome back</h2>
      <p className="mt-2 text-sm text-slate-400">Sign in to your HEARTLYSMP dashboard.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Signing in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 grid gap-3">
        <button className="btn-secondary w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>Continue with Google</button>
        <button className="btn-secondary w-full" onClick={() => signIn("github", { callbackUrl: "/dashboard" })}>Continue with GitHub</button>
        <button className="btn-secondary w-full" onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}>Continue with Discord</button>
        <button className="btn-secondary w-full" onClick={() => signIn("microsoft", { callbackUrl: "/dashboard" })}>Continue with Microsoft</button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">
        Need an account? <Link href="/register" className="text-accent">Register</Link>
      </p>
    </div>
  );
}
