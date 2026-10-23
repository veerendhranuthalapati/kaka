import { Router } from "express";
import {
  createVehicle,
  deleteVehicle,
  listVehicles,
  searchVehicles,
  updateVehicle,
} from "../controllers/vehicle.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { createVehicleBodySchema } from "../validators/vehicle.create.schema.js";
import { searchVehiclesQuerySchema } from "../validators/vehicle.search.schema.js";
import { vehicleIdParamsSchema } from "../validators/vehicle.params.schema.js";
import { updateVehicleBodySchema } from "../validators/vehicle.update.schema.js";

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

vehiclesRouter.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateParams(vehicleIdParamsSchema),
  validateBody(updateVehicleBodySchema),
  updateVehicle,
);

vehiclesRouter.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateParams(vehicleIdParamsSchema),
  deleteVehicle,
);
