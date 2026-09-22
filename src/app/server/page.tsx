import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/session";

export default async function ActivityPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="card p-8">
        <h1 className="text-3xl font-semibold">Activity</h1>
        <p className="mt-4 text-slate-400">Recent bot and server events are ready for the events engine.</p>
      </div>
    </main>
  );
}
