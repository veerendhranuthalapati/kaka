import type { NextFunction, Request, Response } from "express";
import type { CreateVehicleBody } from "../validators/vehicle.create.schema.js";
import { VehicleService } from "../services/vehicle.service.js";

const vehicleService = new VehicleService();

export async function createVehicle(
  req: Request<object, object, CreateVehicleBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const vehicle = await vehicleService.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
}

export async function listVehicles(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const vehicles = await vehicleService.list();
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
}
