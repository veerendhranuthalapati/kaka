import { Router } from "express";
import { createVehicle } from "../controllers/vehicle.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validateBody.js";
import { createVehicleBodySchema } from "../validators/vehicle.create.schema.js";

export const vehiclesRouter = Router();

vehiclesRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validateBody(createVehicleBodySchema),
  createVehicle,
);
