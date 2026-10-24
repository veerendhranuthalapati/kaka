import type { NextFunction, Request, Response } from "express";

export function privateNoCache(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("Cache-Control", "private, no-cache");
  next();
}
