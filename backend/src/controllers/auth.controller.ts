import type { Request, Response, NextFunction } from "express";
import type { LoginBody } from "../validators/auth.login.schema.js";
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

export async function login(
  req: Request<object, object, LoginBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
