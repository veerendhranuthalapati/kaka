import type { NextFunction, Request, Response } from "express";
import { config } from "../config/env.js";
import { LoginThrottleStore } from "../security/loginThrottle.js";
import { normalizeEmail } from "../validators/normalizeEmail.js";
import { hashEmailForLog, logSecurityEvent } from "../lib/logger.js";
import type { LoginBody } from "../validators/auth.login.schema.js";

export const loginThrottleStore = new LoginThrottleStore({
  maxFailuresPerIpEmail: config.loginFailMaxIpEmail,
  failureWindowMs: config.loginFailWindowMs,
  maxFailuresPerEmail: config.loginFailMaxEmail,
  lockoutMs: config.loginLockoutMs,
  maxKeys: config.loginStoreMaxKeys,
});

const THROTTLE_BODY = {
  error: {
    code: "TOO_MANY_REQUESTS",
    message: "Too many login attempts",
  },
};

export function loginThrottleMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const body = req.body as LoginBody;
  const email = normalizeEmail(body.email ?? "");
  const ip = req.ip ?? "unknown";

  if (loginThrottleStore.isBlocked(ip, email)) {
    const retryAfter = loginThrottleStore.retryAfterSeconds(ip, email);
    res.setHeader("Retry-After", String(retryAfter));
    logSecurityEvent("login_lockout", {
      requestId: req.requestId,
      emailHash: hashEmailForLog(email),
    });
    res.status(429).json(THROTTLE_BODY);
    return;
  }
  next();
}

export function recordLoginFailure(req: Request, email: string): void {
  const ip = req.ip ?? "unknown";
  loginThrottleStore.recordFailure(ip, normalizeEmail(email));
}

export function recordLoginSuccess(req: Request, email: string): void {
  const ip = req.ip ?? "unknown";
  loginThrottleStore.recordSuccess(ip, normalizeEmail(email));
}
