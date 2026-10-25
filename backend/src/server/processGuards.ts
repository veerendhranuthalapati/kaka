import { log } from "../lib/logger.js";

export function registerProcessGuards(): void {
  process.on("unhandledRejection", (reason) => {
    log("error", "unhandledRejection", { err: reason });
    process.exit(1);
  });

  process.on("uncaughtException", (error) => {
    log("error", "uncaughtException", { err: error });
    process.exit(1);
  });
}

export type HttpServerLike = {
  close(callback: () => void): void;
};

export function gracefulShutdown(
  server: HttpServerLike,
  disconnect: () => Promise<void>,
  signal: string,
  forceExitMs = 10_000,
): void {
  log("info", "shutdown started", { signal });
  const forceTimer = setTimeout(() => {
    log("error", "shutdown forced after timeout", { signal });
    process.exit(1);
  }, forceExitMs);
  forceTimer.unref();

  server.close(() => {
    void disconnect()
      .then(() => {
        clearTimeout(forceTimer);
        process.exit(0);
      })
      .catch((error) => {
        log("error", "shutdown disconnect failed", { err: error });
        process.exit(1);
      });
  });
}
