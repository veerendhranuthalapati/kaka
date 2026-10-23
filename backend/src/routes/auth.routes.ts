import { Router } from "express";
import { validateBody } from "../middleware/validateBody.js";
import { registerBodySchema } from "../validators/auth.register.schema.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  validateBody(registerBodySchema),
  (_req, res) => {
    // Registration logic added in later TDD steps.
    res.status(501).json({
      error: { code: "NOT_IMPLEMENTED", message: "Registration not implemented" },
    });
  },
);
