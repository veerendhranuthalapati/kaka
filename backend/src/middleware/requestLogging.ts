import type { NextFunction, Request, Response } from "express";
import { log } from "../lib/logger.js";

function queryParamNames(req: Request): string[] {
  return Object.keys(req.query);
}

export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();

  res.on("finish", () => {
    log("info", "request completed", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      queryParamNames: queryParamNames(req),
      status: res.statusCode,
      durationMs: Date.now() - start,
      userId: req.user?.id,
    });
  });

  next();
}
