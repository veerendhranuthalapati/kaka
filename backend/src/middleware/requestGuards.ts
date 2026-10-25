import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/ApiError.js";

const POLLUTION_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function rejectPrototypePollution(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const sources = [req.body, req.query, req.params];
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    for (const key of Object.keys(source)) {
      if (POLLUTION_KEYS.has(key)) {
        next(new ApiError(400, "VALIDATION_ERROR", "Invalid request"));
        return;
      }
    }
  }
  next();
}

export function requireJsonContentType(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "DELETE") {
    next();
    return;
  }
  const contentType = req.headers["content-type"]?.split(";")[0]?.trim();
  if (!contentType) {
    next();
    return;
  }
  if (contentType !== "application/json") {
    res.status(415).json({
      error: {
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Content-Type must be application/json",
      },
    });
    return;
  }
  next();
}

function queryHasInvalidShape(query: Record<string, unknown>): boolean {
  for (const value of Object.values(query)) {
    if (Array.isArray(value)) return true;
    if (value && typeof value === "object") return true;
  }
  for (const key of Object.keys(query)) {
    if (key.includes("[") || key.includes("]")) return true;
  }
  return false;
}

export function rejectComplexQueryStrings(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const raw = req.originalUrl.split("?")[1];
  if (raw) {
    const pairs = raw.split("&");
    const keys = new Set<string>();
    for (const pair of pairs) {
      const key = pair.split("=")[0]?.replace(/\+/g, " ");
      if (!key) continue;
      if (key.includes("[") || key.includes("]")) {
        next(new ApiError(400, "VALIDATION_ERROR", "Invalid query string"));
        return;
      }
      if (keys.has(key)) {
        next(new ApiError(400, "VALIDATION_ERROR", "Duplicate query key"));
        return;
      }
      keys.add(key);
    }
  }
  if (queryHasInvalidShape(req.query as Record<string, unknown>)) {
    next(new ApiError(400, "VALIDATION_ERROR", "Invalid query string"));
    return;
  }
  next();
}
