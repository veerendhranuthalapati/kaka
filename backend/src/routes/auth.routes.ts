import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validateBody.js";
import { registerBodySchema } from "../validators/auth.register.schema.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerBodySchema), register);
