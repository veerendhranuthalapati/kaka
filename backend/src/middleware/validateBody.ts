import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

/** Runs Zod on JSON body; rejects unknown keys when schema is .strict(). */
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: parsed.error.flatten(),
        },
      });
      return;
    }
    req.body = parsed.data;
    next();
  };
}
