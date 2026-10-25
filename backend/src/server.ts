import type { Server } from "node:http";
import "dotenv/config";
import { createApp } from "./app.js";
import { config } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { log } from "./lib/logger.js";
import {
  gracefulShutdown,
  registerProcessGuards,
} from "./server/processGuards.js";

export function configureHttpServer(server: Server): void {
  server.requestTimeout = config.requestTimeoutMs;
  server.headersTimeout = config.headersTimeoutMs;
  server.keepAliveTimeout = config.keepAliveTimeoutMs;
}

export async function startServer(): Promise<void> {
  registerProcessGuards();
  await prisma.$connect();
  const app = createApp();

  const server = app.listen(config.port, () => {
    log("info", "API listening", { port: config.port });
  });
  configureHttpServer(server);

  const shutdown = (signal: string) => {
    gracefulShutdown(server, () => prisma.$disconnect(), signal);
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}
