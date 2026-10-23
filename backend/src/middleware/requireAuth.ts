import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { ApiError } from "../errors/ApiError.js";

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }

  try {
    const token = header.slice("Bearer ".length).trim();
    const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      (payload.role !== "USER" && payload.role !== "ADMIN")
    ) {
      throw new Error("Invalid token payload");
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
  }
}
