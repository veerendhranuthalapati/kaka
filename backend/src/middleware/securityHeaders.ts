import type { NextFunction, Request, Response } from "express";

export function varyOrigin(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("Vary", "Origin");
  next();
}

export function authNoStore(req: Request, res: Response, next: NextFunction): void {
  if (
    req.baseUrl === "/api/auth" ||
    req.originalUrl.startsWith("/api/auth")
  ) {
    res.setHeader("Cache-Control", "no-store");
  }
  next();
}
