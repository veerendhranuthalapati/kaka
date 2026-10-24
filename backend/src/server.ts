import "dotenv/config";
import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

export async function startServer(): Promise<void> {
  await prisma.$connect();
  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`API listening on port ${config.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down`);
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}
