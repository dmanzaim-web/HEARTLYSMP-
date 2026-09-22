import { prisma } from "@/lib/prisma";
import { startScheduler } from "@/lib/automation/scheduler";
void prisma.$connect().then(()=>startScheduler()).catch(()=>undefined);
process.on("SIGTERM",()=>process.exit(0));
