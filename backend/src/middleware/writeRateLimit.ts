import type { Request, Response } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const WINDOW_MS = 60_000;
const MAX = 30;

export function createWriteRateLimiter() {
  return rateLimit({
    windowMs: WINDOW_MS,
    max: MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) =>
      req.user?.id ?? ipKeyGenerator(req.ip ?? "unknown"),
    handler: (_req: Request, res: Response) => {
      res.setHeader("Retry-After", String(Math.ceil(WINDOW_MS / 1000)));
      res.status(429).json({
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests",
        },
      });
    },
  });
}
