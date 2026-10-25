import type { Request, Response, NextFunction } from "express";
import { resolve } from "node:path";
import { seedDemoVehicles } from "../demo/seedDemoVehicles.js";
import { logSecurityEvent } from "../lib/logger.js";
import { PrismaVehicleRepository } from "../repositories/vehicle.repository.js";

const vehicleRepository = new PrismaVehicleRepository();

export async function loadDemoVehicles(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const repoRoot = resolve(process.cwd(), "..");
    const result = await seedDemoVehicles(vehicleRepository, { repoRoot });
    logSecurityEvent("admin_demo_seed", {
      actorId: req.user!.id,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
