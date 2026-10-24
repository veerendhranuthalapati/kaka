import type { NextFunction, Request, Response } from "express";
import type { CreateVehicleBody } from "../validators/vehicle.create.schema.js";
import type { SearchVehiclesQuery } from "../validators/vehicle.search.schema.js";
import type { UpdateVehicleBody } from "../validators/vehicle.update.schema.js";
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

export async function getVehicle(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const vehicle = await vehicleService.getById(req.params.id);
    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
}

export async function searchVehicles(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = res.locals.query as SearchVehiclesQuery;
    const vehicles = await vehicleService.search(query);
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
}

export async function updateVehicle(
  req: Request<{ id: string }, object, UpdateVehicleBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const vehicle = await vehicleService.update(req.params.id, req.body);
    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
}

export async function deleteVehicle(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await vehicleService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function purchaseVehicle(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const vehicle = await vehicleService.purchase(req.params.id);
    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
}

export async function restockVehicle(
  req: Request<{ id: string }, object, { amount: number }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const vehicle = await vehicleService.restock(req.params.id, req.body.amount);
    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
}
