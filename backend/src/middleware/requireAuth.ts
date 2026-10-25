import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/ApiError.js";
import { verifyAccessToken } from "../services/auth.service.js";
import { logSecurityEvent } from "../lib/logger.js";
import { PrismaUserRepository } from "../repositories/user.repository.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const users = new PrismaUserRepository();

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  void (async () => {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      logSecurityEvent("auth_denied", {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: 401,
      });
      next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
      return;
    }

    try {
      const token = header.slice("Bearer ".length).trim();
      const payload = verifyAccessToken(token);

      const sub = payload.sub;
      const tv = payload.tv;
      if (typeof sub !== "string" || !UUID_RE.test(sub)) {
        throw new Error("Invalid subject");
      }
      if (typeof tv !== "number" || !Number.isInteger(tv)) {
        throw new Error("Invalid token version");
      }

      const user = await users.findById(sub);
      if (!user || user.tokenVersion !== tv) {
        logSecurityEvent("auth_denied", {
          requestId: req.requestId,
          method: req.method,
          path: req.path,
          status: 401,
        });
        next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      next();
    } catch {
      logSecurityEvent("auth_denied", {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: 401,
      });
      next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
    }
  })().catch(next);
}
