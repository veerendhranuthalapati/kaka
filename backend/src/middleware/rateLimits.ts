import type { Request, Response } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { config } from "../config/env.js";
import { logSecurityEvent } from "../lib/logger.js";

export type RateLimitOptions = {
  globalMax?: number;
  globalWindowMs?: number;
  authMax?: number;
  authWindowMs?: number;
  /** @deprecated use authMax */
  authRateLimitMax?: number;
  /** @deprecated use authWindowMs */
  authRateLimitWindowMs?: number;
  writeMax?: number;
  writeWindowMs?: number;
  disabled?: boolean;
};

function build429Handler(windowMs: number, label: string) {
  return (req: Request, res: Response): void => {
    const retryAfter = Math.max(1, Math.ceil(windowMs / 1000));
    res.setHeader("Retry-After", String(retryAfter));
    logSecurityEvent("rate_limit_hit", {
      requestId: req.requestId,
      limiter: label,
      method: req.method,
      path: req.path,
      userId: req.user?.id,
    });
    res.status(429).json({
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests",
      },
    });
  };
}

export function createGlobalRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.globalWindowMs ?? config.globalRateLimitWindowMs;
  const max = options.globalMax ?? config.globalRateLimitMax;
  if (options.disabled ?? config.rateLimitDisabled) {
    return (_req: Request, _res: Response, next: () => void) => next();
  }
  const limiter = rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health",
    handler: (req, res) => build429Handler(windowMs, "global")(req, res),
  });
  return limiter;
}

export function createAuthRateLimiter(options: RateLimitOptions = {}) {
  const windowMs =
    options.authWindowMs ??
    options.authRateLimitWindowMs ??
    config.authRateLimitWindowMs;
  const max =
    options.authMax ?? options.authRateLimitMax ?? config.authRateLimitMax;
  if (options.disabled ?? config.rateLimitDisabled) {
    return (_req: Request, _res: Response, next: () => void) => next();
  }
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => build429Handler(windowMs, "auth")(req, res),
  });
}

export function createWriteRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.writeWindowMs ?? config.writeRateLimitWindowMs;
  const max = options.writeMax ?? config.writeRateLimitMax;
  if (options.disabled ?? config.rateLimitDisabled) {
    return (_req: Request, _res: Response, next: () => void) => next();
  }
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) =>
      req.user?.id ?? ipKeyGenerator(req.ip ?? "unknown"),
    handler: (req, res) => build429Handler(windowMs, "write")(req, res),
  });
}
