import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError.js";
import {
  recordLoginFailure,
  recordLoginSuccess,
} from "../middleware/loginThrottle.js";
import type { LoginBody } from "../validators/auth.login.schema.js";
import type { RegisterBody } from "../validators/auth.register.schema.js";
import { hashEmailForLog, logSecurityEvent } from "../lib/logger.js";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export async function register(
  req: Request<Record<string, string>, unknown, RegisterBody>,
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
  req: Request<Record<string, string>, unknown, LoginBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    recordLoginSuccess(req, req.body.email);
    logSecurityEvent("login_success", {
      requestId: req.requestId,
      userId: result.user.id,
    });
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ApiError && error.code === "INVALID_CREDENTIALS") {
      recordLoginFailure(req, req.body.email);
      logSecurityEvent("login_failure", {
        requestId: req.requestId,
        emailHash: hashEmailForLog(req.body.email),
      });
    }
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
      return;
    }
    await authService.logout(req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
