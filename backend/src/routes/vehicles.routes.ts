import { Router } from "express";
import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  purchaseVehicle,
  restockVehicle,
  searchVehicles,
  updateVehicle,
} from "../controllers/vehicle.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createWriteRateLimiter,
  type RateLimitOptions,
} from "../middleware/rateLimits.js";
import { validateBody } from "../middleware/validateBody.js";
import { validateParams } from "../middleware/validateParams.js";
import { validateQuery } from "../middleware/validateQuery.js";
import { createVehicleBodySchema } from "../validators/vehicle.create.schema.js";
import { searchVehiclesQuerySchema } from "../validators/vehicle.search.schema.js";
import { vehicleIdParamsSchema } from "../validators/vehicle.params.schema.js";
import { updateVehicleBodySchema } from "../validators/vehicle.update.schema.js";
import { restockVehicleBodySchema } from "../validators/vehicle.restock.schema.js";
import { privateNoCache } from "../middleware/privateCache.js";

export function createVehiclesRouter(
  rateOptions: RateLimitOptions = {},
): Router {
  const vehiclesRouter = Router();
  const writeRateLimiter = createWriteRateLimiter(rateOptions);

  vehiclesRouter.use(requireAuth, privateNoCache);

  vehiclesRouter.get("/", listVehicles);

  vehiclesRouter.get(
    "/search",
    validateQuery(searchVehiclesQuerySchema),
    searchVehicles,
  );

  vehiclesRouter.get(
    "/:id",
    validateParams(vehicleIdParamsSchema),
    getVehicle,
  );

  vehiclesRouter.post(
    "/",
    writeRateLimiter,
    requireRole("ADMIN"),
    validateBody(createVehicleBodySchema),
    createVehicle,
  );

  vehiclesRouter.put(
    "/:id",
    writeRateLimiter,
    requireRole("ADMIN"),
    validateParams(vehicleIdParamsSchema),
    validateBody(updateVehicleBodySchema),
    updateVehicle,
  );

  vehiclesRouter.delete(
    "/:id",
    writeRateLimiter,
    requireRole("ADMIN"),
    validateParams(vehicleIdParamsSchema),
    deleteVehicle,
  );

  vehiclesRouter.post(
    "/:id/purchase",
    writeRateLimiter,
    validateParams(vehicleIdParamsSchema),
    purchaseVehicle,
  );

  vehiclesRouter.post(
    "/:id/restock",
    writeRateLimiter,
    requireRole("ADMIN"),
    validateParams(vehicleIdParamsSchema),
    validateBody(restockVehicleBodySchema),
    restockVehicle,
  );

  return vehiclesRouter;
}

export const vehiclesRouter = createVehiclesRouter();
