import type { Request, Response, NextFunction } from "express";
import type { RegisterBody } from "../validators/auth.register.schema.js";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export async function register(
  req: Request<object, object, RegisterBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
