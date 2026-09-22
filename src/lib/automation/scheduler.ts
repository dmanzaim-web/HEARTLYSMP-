import { prisma } from "@/lib/prisma";
import { runAutomation } from "@/lib/automation/engine";

const INTERVAL_MS = Number(process.env.AUTOMATION_SCHEDULER_INTERVAL_MS ?? 15000);
let running = false;

function nextRun(type: string | null, value: string | null, from: Date) {
  if (!type) return null;
  const next = new Date(from);
  if (type === "MINUTES" || type === "HOURS") next.setTime(from.getTime() + Number(value || 1) * (type === "MINUTES" ? 60000 : 3600000));
  else if (type === "DAILY") { next.setDate(next.getDate() + 1); }
  else if (type === "WEEKLY") { next.setDate(next.getDate() + 7); }
  else if (type === "AT") { const [h,m] = String(value || "00:00").split(":").map(Number); next.setHours(h || 0,m || 0,0,0); if (next <= from) next.setDate(next.getDate()+1); }
  else return null;
  return next;
}
export async function schedulerTick(now = new Date()) {
  const due = await prisma.automation.findMany({ where:{enabled:true,nextRunAt:{lte:now}}, include:{server:true}, take:100 });
  for (const automation of due) {
    const claimed = await prisma.automation.updateMany({ where:{id:automation.id,enabled:true,nextRunAt:{lte:now}}, data:{lastRunAt:now,nextRunAt:nextRun(automation.scheduleType,automation.scheduleValue,now)} });
    if (claimed.count !== 1) continue;
    try { await runAutomation(automation.id,{serverId:automation.serverId,userId:automation.server.userId,type:"SCHEDULE",payload:{schedule:true},chainId:crypto.randomUUID(),depth:0,source:"SCHEDULE"} as never); }
    catch (error) { await prisma.automation.update({where:{id:automation.id},data:{nextRunAt:nextRun(automation.scheduleType,automation.scheduleValue,now)}}).catch(()=>undefined); }
  }
}
export function startScheduler() { if (running) return () => undefined; running=true; const timer=setInterval(()=>schedulerTick().catch(()=>undefined),INTERVAL_MS); void schedulerTick().catch(()=>undefined); return ()=>{running=false;clearInterval(timer);}; }
if (process.env.AUTOMATION_SCHEDULER_AUTOSTART === "true") startScheduler();
