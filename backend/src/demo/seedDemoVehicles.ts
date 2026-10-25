import { resolve } from "node:path";
import type { Vehicle } from "@prisma/client";
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleRepository,
} from "../repositories/vehicle.repository.js";
import type { DemoSeedExistingRow } from "./patch.js";
import { DEMO_VEHICLE_CATALOG } from "./catalog.js";
import {
  listAllCarAssetFilenames,
  resolveOptionalDemoImageUrl,
} from "./images.js";
import { buildDemoSeedUpdatePatch } from "./patch.js";

export type DemoSeedResult = {
  created: number;
  updated: number;
  skipped: number;
};

export type SeedDemoVehiclesOptions = {
  repoRoot?: string;
  /** When set, throws after this many catalog entries (for rollback tests). */
  failAfterCreates?: number;
};

export async function seedDemoVehicles(
  repository: VehicleRepository,
  options: SeedDemoVehiclesOptions = {},
): Promise<DemoSeedResult> {
  const repoRoot = options.repoRoot ?? resolve(process.cwd(), "..");
  const assets = listAllCarAssetFilenames(repoRoot);
  if (assets.length < 8) {
    throw new Error(
      `Demo seed needs at least 8 files in frontend/public/cars (found ${assets.length})`,
    );
  }

  return repository.runDemoSeedTransaction(async (repo) => {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let createsSeen = 0;

    for (const item of DEMO_VEHICLE_CATALOG) {
      const resolvedImage =
        resolveOptionalDemoImageUrl(item.make, item.model, repoRoot) ?? null;
      const { imageUrl: _catalogImage, ...rest } = item;
      const imageUrl = resolvedImage ?? item.imageUrl ?? null;

      const existing = await repo.findByMakeAndModel(item.make, item.model);

      if (existing) {
        const patch = buildDemoSeedUpdatePatch(
          toDemoSeedRow(existing),
          item,
          resolvedImage,
        );
        if (Object.keys(patch).length > 0) {
          await repo.update(existing.id, patch as UpdateVehicleInput);
          updated += 1;
        } else {
          skipped += 1;
        }
      } else {
        if (
          options.failAfterCreates !== undefined &&
          createsSeen >= options.failAfterCreates
        ) {
          throw new Error("demo seed rollback test failure");
        }
        await repo.create({
          ...(rest as CreateVehicleInput),
          imageUrl,
        });
        createsSeen += 1;
        created += 1;
      }
    }

    return { created, updated, skipped };
  });
}

export function demoCatalogSize(): number {
  return DEMO_VEHICLE_CATALOG.length;
}

function toDemoSeedRow(vehicle: Vehicle): DemoSeedExistingRow {
  return {
    category: vehicle.category,
    price: Number(vehicle.price),
    quantity: vehicle.quantity,
    imageUrl: vehicle.imageUrl,
    year: vehicle.year,
    odometerKm: vehicle.odometerKm,
    engineCc: vehicle.engineCc,
    powerBhp: vehicle.powerBhp,
    torqueNm: vehicle.torqueNm,
    fuelType: vehicle.fuelType,
    transmission: vehicle.transmission,
    drivetrain: vehicle.drivetrain,
    fuelEconomyKmpl:
      vehicle.fuelEconomyKmpl == null ? null : Number(vehicle.fuelEconomyKmpl),
    color: vehicle.color,
    owners: vehicle.owners,
    vin: vehicle.vin,
    seats: vehicle.seats,
    rangeKm: vehicle.rangeKm,
    batteryKwh:
      vehicle.batteryKwh == null ? null : Number(vehicle.batteryKwh),
    description: vehicle.description,
    features: vehicle.features,
  };
}
