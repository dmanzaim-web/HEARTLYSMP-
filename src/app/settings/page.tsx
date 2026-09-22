import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/session";

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="card p-8">
        <h1 className="text-3xl font-semibold">Account</h1>
        <p className="mt-4 text-slate-400">Profile, security, and account configuration are ready for extension.</p>
      </div>
    </main>
  );
}
