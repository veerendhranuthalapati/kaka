import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../errors/ApiError.js";

function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): ApiError | null {
  if (error.code === "P2002") {
    const target = error.meta?.target;
    const fields = Array.isArray(target) ? target : [];
    if (fields.includes("email")) {
      return new ApiError(409, "EMAIL_TAKEN", "Email already registered");
    }
    return new ApiError(409, "CONFLICT", "Resource conflict");
  }
  return null;
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details === undefined ? {} : { details: err.details }),
      },
    });
    return;
  }

  if (
    err instanceof SyntaxError &&
    "status" in err &&
    (err as { status: unknown }).status === 400 &&
    "body" in err
  ) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Malformed JSON in request body",
      },
    });
    return;
  }

  if (err && typeof err === "object" && (err as { type?: string }).type === "entity.too.large") {
    res.status(413).json({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body too large",
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaError(err);
    if (mapped) {
      res.status(mapped.status).json({
        error: { code: mapped.code, message: mapped.message },
      });
      return;
    }
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
};
