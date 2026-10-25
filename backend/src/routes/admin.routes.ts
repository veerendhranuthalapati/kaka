import { Router } from "express";
import { loadDemoVehicles } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { createWriteRateLimiter } from "../middleware/writeRateLimit.js";
import { validateBody } from "../middleware/validateBody.js";
import { adminDemoSeedBodySchema } from "../validators/admin.demoSeed.schema.js";

export const adminRouter = Router();

const writeLimiter = createWriteRateLimiter();

adminRouter.post(
  "/demo-vehicles",
  writeLimiter,
  requireAuth,
  requireRole("ADMIN"),
  validateBody(adminDemoSeedBodySchema),
  loadDemoVehicles,
);
