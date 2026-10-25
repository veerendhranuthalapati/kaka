import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/ApiError.js";
import { logSecurityEvent } from "../lib/logger.js";

export type RoleGuard = ((req: Request, res: Response, next: NextFunction) => void) & {
  requiredRole?: Role;
};

export function requireRole(role: Role): RoleGuard {
  const middleware: RoleGuard = (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    if (req.user?.role !== role) {
      logSecurityEvent("forbidden", {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: 403,
        userId: req.user?.id,
      });
      next(new ApiError(403, "FORBIDDEN", "You do not have permission"));
      return;
    }

    next();
  };
  middleware.requiredRole = role;
  return middleware;
}
