import type { PrismaClient } from "@prisma/client";
export type { DemoCatalogEntry } from "../src/demo/catalog.js";
export { DEMO_VEHICLE_CATALOG } from "../src/demo/catalog.js";
export {
  demoVehicleImageSlug,
  listAllCarAssetFilenames,
  listDemoCarImagePaths,
  resolveOptionalDemoImageUrl,
} from "../src/demo/images.js";
export { buildDemoSeedUpdatePatch } from "../src/demo/patch.js";
export type { DemoSeedExistingRow } from "../src/demo/patch.js";
export {
  refuseProductionSeed,
  refuseTestDatabase,
} from "../src/demo/scriptGuards.js";

export const LEGACY_DEMO_SEED_MAKE = "demo-seed";

export function legacyDemoSeedVehicleWhere() {
  return {
    OR: [
      { make: LEGACY_DEMO_SEED_MAKE },
      { make: { startsWith: `${LEGACY_DEMO_SEED_MAKE} ` } },
    ],
  };
}

export async function cleanupLegacyDemoSeedVehicles(
  client: Pick<PrismaClient, "vehicle">,
): Promise<number> {
  const result = await client.vehicle.deleteMany({
    where: legacyDemoSeedVehicleWhere(),
  });
  return result.count;
}

const DEV_VERIFICATION_PREFIXES = ["RUN", "E2E", "Test"] as const;

export function devVerificationVehicleWhere() {
  return {
    OR: [
      { make: LEGACY_DEMO_SEED_MAKE },
      ...DEV_VERIFICATION_PREFIXES.flatMap((prefix) => [
        { make: { startsWith: prefix, mode: "insensitive" as const } },
        { model: { startsWith: prefix, mode: "insensitive" as const } },
      ]),
    ],
  };
}

export async function listDevVerificationVehicles(
  client: Pick<PrismaClient, "vehicle">,
): Promise<
  { id: string; make: string; model: string; createdAt: Date }[]
> {
  return client.vehicle.findMany({
    where: devVerificationVehicleWhere(),
    select: { id: true, make: true, model: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function deleteDevVerificationVehicles(
  client: Pick<PrismaClient, "vehicle">,
): Promise<number> {
  const result = await client.vehicle.deleteMany({
    where: devVerificationVehicleWhere(),
  });
  return result.count;
}
