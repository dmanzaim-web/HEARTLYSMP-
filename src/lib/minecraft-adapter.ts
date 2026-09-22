export type MinecraftEdition = "JAVA" | "BEDROCK" | "UNKNOWN";

export type ProbeResult = {
  success: boolean;
  online: boolean;
  edition: MinecraftEdition;
  version: string | null;
  players: { online: number; max: number };
  latency: number | null;
  error?: string;
};

type StatusResponse = {
  version?: { name?: string };
  players?: { online?: number; max?: number };
  latency?: number;
};

type MinecraftStatusUtil = {
  status: (host: string, port: number, options?: { timeout?: number }) => Promise<StatusResponse>;
  statusBedrock?: (host: string, port: number, options?: { timeout?: number }) => Promise<StatusResponse>;
};

export class MinecraftAdapter {
  async probeServer(host: string, port: number, requestedEdition: "Java" | "Bedrock" | "Auto Detect" = "Auto Detect"): Promise<ProbeResult> {
    const util = (await import("minecraft-server-util")) as unknown as MinecraftStatusUtil;
    const timeout = 5000;
    const attempts: Array<{ edition: MinecraftEdition; query: () => Promise<StatusResponse> }> = [];

    if (requestedEdition !== "Bedrock") {
      attempts.push({ edition: "JAVA", query: () => util.status(host, port, { timeout }) });
    }
    if (requestedEdition !== "Java" && util.statusBedrock) {
      attempts.push({ edition: "BEDROCK", query: () => util.statusBedrock!(host, port, { timeout }) });
    }

    let lastError = "Connection failed";
    for (const attempt of attempts) {
      try {
        const response = await attempt.query();
        return {
          success: true,
          online: true,
          edition: attempt.edition,
          version: response.version?.name ?? null,
          players: {
            online: response.players?.online ?? 0,
            max: response.players?.max ?? 0,
          },
          latency: typeof response.latency === "number" ? response.latency : null,
        };
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Connection failed";
      }
    }

    return {
      success: false,
      online: false,
      edition: "UNKNOWN",
      version: null,
      players: { online: 0, max: 0 },
      latency: null,
      error: "Connection failed",
    };
  }
}

export class JavaMinecraftAdapter extends MinecraftAdapter {}
export class BedrockMinecraftAdapter extends MinecraftAdapter {}
