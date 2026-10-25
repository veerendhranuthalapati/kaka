import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const INBOUND_REQUEST_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const inbound = req.headers["x-request-id"];
  const inboundValue = Array.isArray(inbound) ? inbound[0] : inbound;
  const requestId =
    typeof inboundValue === "string" &&
    INBOUND_REQUEST_ID_RE.test(inboundValue)
      ? inboundValue
      : randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}
