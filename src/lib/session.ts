import { getServerSession as nextGetServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function getServerSession() {
  return nextGetServerSession(authOptions);
}
