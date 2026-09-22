import { prisma } from "@/lib/prisma";
import { runAutomation } from "@/lib/automation/engine";
import crypto from "crypto";
const interval=Number(process.env.AUTOMATION_SCHEDULER_INTERVAL_MS??15000);
async function tick(){const due=await prisma.automation.findMany({where:{enabled:true,nextRunAt:{lte:new Date()}},include:{server:true},take:100});for(const a of due){const now=new Date();const claimed=await prisma.automation.updateMany({where:{id:a.id,enabled:true,nextRunAt:{lte:now}},data:{lastRunAt:now,nextRunAt:next(a.scheduleType,a.scheduleValue,now)}});if(!claimed.count)continue;await runAutomation(a.id,{serverId:a.serverId,userId:a.server.userId,type:"SCHEDULE",payload:{schedule:true},chainId:crypto.randomUUID(),depth:0,source:"SCHEDULE"} as never).catch(()=>undefined);}}
function next(t:string|null,v:string|null,d:Date){if(!t)return null;const n=new Date(d);if(t==="MINUTES"||t==="HOURS")n.setTime(d.getTime()+Number(v||1)*(t==="MINUTES"?60000:3600000));else if(t==="DAILY")n.setDate(n.getDate()+1);else if(t==="WEEKLY")n.setDate(n.getDate()+7);else if(t==="AT"){const [h,m]=String(v||"00:00").split(":").map(Number);n.setHours(h||0,m||0,0,0);if(n<=d)n.setDate(n.getDate()+1);}else return null;return n;}
setInterval(()=>tick().catch(()=>undefined),interval);void tick().catch(()=>undefined);
