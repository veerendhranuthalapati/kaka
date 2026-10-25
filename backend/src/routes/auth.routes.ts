import { Router } from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import { loginThrottleMiddleware } from "../middleware/loginThrottle.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody } from "../middleware/validateBody.js";
import { loginBodySchema } from "../validators/auth.login.schema.js";
import { registerBodySchema } from "../validators/auth.register.schema.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerBodySchema), register);
authRouter.post(
  "/login",
  validateBody(loginBodySchema),
  loginThrottleMiddleware,
  login,
);
authRouter.post("/logout", requireAuth, logout);
