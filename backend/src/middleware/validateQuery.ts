import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request query",
          details: parsed.error.flatten(),
        },
      });
      return;
    }

    res.locals.query = parsed.data;
    next();
  };
}
