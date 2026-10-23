import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validateBody.js";
import { loginBodySchema } from "../validators/auth.login.schema.js";
import { registerBodySchema } from "../validators/auth.register.schema.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerBodySchema), register);
authRouter.post("/login", validateBody(loginBodySchema), login);
