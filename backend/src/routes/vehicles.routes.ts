import { Router } from "express";
import {
  createVehicle,
  listVehicles,
  searchVehicles,
} from "../controllers/vehicle.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { createVehicleBodySchema } from "../validators/vehicle.create.schema.js";
import { searchVehiclesQuerySchema } from "../validators/vehicle.search.schema.js";

export const vehiclesRouter = Router();

vehiclesRouter.get("/", requireAuth, listVehicles);

vehiclesRouter.get(
  "/search",
  requireAuth,
  validateQuery(searchVehiclesQuerySchema),
  searchVehicles,
);

vehiclesRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validateBody(createVehicleBodySchema),
  createVehicle,
);
