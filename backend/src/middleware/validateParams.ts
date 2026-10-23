import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validateParams<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request params",
          details: parsed.error.flatten(),
        },
      });
      return;
    }

    req.params = parsed.data as Request["params"];
    next();
  };
}
