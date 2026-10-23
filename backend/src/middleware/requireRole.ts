import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/ApiError.js";

export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
      next(new ApiError(403, "FORBIDDEN", "You do not have permission"));
      return;
    }

    next();
  };
}
