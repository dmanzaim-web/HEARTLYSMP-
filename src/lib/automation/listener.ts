import { eventBus } from "@/lib/events";
import { handleAutomationEvent } from "@/lib/automation/engine";
let installed = false;
export function installAutomationListeners() { if (installed) return; installed = true; eventBus.setMaxListeners(50); eventBus.on("event", (event) => { void handleAutomationEvent({ serverId:event.serverId, runtimeId:event.runtimeId ?? undefined, type:event.type, payload:JSON.parse(event.payload), source:"EVENT" } as never).catch(() => undefined); }); }
installAutomationListeners();
