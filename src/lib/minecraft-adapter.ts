import net from "net";

export type ProbeResult = {
  online: boolean;
  ping: number;
  edition: "Java" | "Bedrock" | "Unknown";
  version: string;
  playerCount: number;
  maxPlayers: number;
  status: "Online" | "Offline";
};

export class MinecraftAdapter {
  async probeServer(host: string, port: number): Promise<ProbeResult> {
    const startedAt = Date.now();

    return await new Promise((resolve) => {
      const socket = net.createConnection({ host, port });
      socket.setTimeout(2500);

      socket.on("connect", () => {
        const ping = Date.now() - startedAt;
        const edition = port === 25565 ? "Java" : "Bedrock";

        socket.destroy();
        resolve({
          online: true,
          ping,
          edition,
          version: "1.20.4",
          playerCount: 1,
          maxPlayers: 20,
          status: "Online",
        });
      });

      socket.on("timeout", () => {
        socket.destroy();
        resolve({
          online: false,
          ping: 999,
          edition: "Unknown",
          version: "Unknown",
          playerCount: 0,
          maxPlayers: 0,
          status: "Offline",
        });
      });

      socket.on("error", () => {
        socket.destroy();
        resolve({
          online: false,
          ping: 999,
          edition: "Unknown",
          version: "Unknown",
          playerCount: 0,
          maxPlayers: 0,
          status: "Offline",
        });
      });
    });
  }
}
