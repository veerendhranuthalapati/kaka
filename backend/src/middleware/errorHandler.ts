import type { ErrorRequestHandler } from "express";
import { ApiError } from "../errors/ApiError.js";

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

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
};
