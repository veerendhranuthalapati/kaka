import type { PrismaClient } from "@prisma/client";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  DEMO_VEHICLE_CATALOG,
  type DemoCatalogEntry,
} from "./demo-vehicle-catalog.js";

export type { DemoCatalogEntry };
export { DEMO_VEHICLE_CATALOG };

export const LEGACY_DEMO_SEED_MAKE = "demo-seed";

/** Rows from an older seed:make prefix scheme, or make exactly `demo-seed`. */
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

export function refuseProductionSeed(nodeEnv: string | undefined): void {
  if (nodeEnv === "production") {
    throw new Error("seed:demo refuses to run in production");
  }
}

export function refuseTestDatabase(databaseUrl: string | undefined): void {
  if (!databaseUrl) {
    return;
  }
  const match = databaseUrl.match(/\/([^/?]+)(?:\?|$)/);
  const databaseName = match?.[1] ?? "";
  if (databaseName.endsWith("_test")) {
    throw new Error("seed:demo refuses to run against a _test database");
  }
}

export function demoVehicleImageSlug(make: string, model: string): string {
  return `${make}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export function listDemoCarImagePaths(repoRoot = resolve(process.cwd(), "..")): string[] {
  const carsDir = join(repoRoot, "frontend", "public", "cars");
  if (!existsSync(carsDir)) {
    return [];
  }
  return readdirSync(carsDir)
    .filter((name) => name.endsWith(".svg") && name !== "placeholder.svg")
    .sort()
    .map((name) => `/cars/${name}`);
}

export function listAllCarAssetFilenames(
  repoRoot = resolve(process.cwd(), ".."),
): string[] {
  const carsDir = join(repoRoot, "frontend", "public", "cars");
  if (!existsSync(carsDir)) {
    return [];
  }
  return readdirSync(carsDir)
    .filter((name) => name !== "placeholder.svg")
    .sort();
}

export type DemoSeedExistingRow = {
  category: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  year?: number | null;
  odometerKm?: number | null;
  engineCc?: number | null;
  powerBhp?: number | null;
  torqueNm?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  fuelEconomyKmpl?: number | null;
  color?: string | null;
  owners?: number | null;
  vin?: string | null;
  seats?: number | null;
  rangeKm?: number | null;
  batteryKwh?: number | null;
  description?: string | null;
  features?: string[] | null;
};

const DEMO_NULLABLE_FIELDS: (keyof DemoCatalogEntry)[] = [
  "year",
  "odometerKm",
  "engineCc",
  "powerBhp",
  "torqueNm",
  "fuelType",
  "transmission",
  "drivetrain",
  "fuelEconomyKmpl",
  "color",
  "owners",
  "seats",
  "rangeKm",
  "batteryKwh",
  "description",
  "features",
];

/** Fill only NULL columns from the catalog; idempotent; never overwrites set values. */
export function buildDemoSeedUpdatePatch(
  existing: DemoSeedExistingRow,
  catalog: DemoCatalogEntry,
  resolvedImageUrl: string | null,
): Partial<DemoCatalogEntry> {
  const patch: Partial<DemoCatalogEntry> = {};

  for (const key of DEMO_NULLABLE_FIELDS) {
    const current = existing[key];
    const next = catalog[key];
    if (key === "features") {
      const currentFeatures = existing.features;
      const needsFeatures =
        currentFeatures == null || currentFeatures.length === 0;
      if (needsFeatures && next != null && next.length > 0) {
        patch.features = next;
      }
      continue;
    }
    if (current == null && next != null) {
      (patch as Record<string, unknown>)[key] = next;
    }
  }

  const imageUrl = resolvedImageUrl ?? catalog.imageUrl ?? null;
  if (existing.imageUrl == null && imageUrl != null) {
    patch.imageUrl = imageUrl;
  }

  return patch;
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

export function resolveOptionalDemoImageUrl(
  make: string,
  model: string,
  repoRoot: string,
): string | null {
  const carsDir = join(repoRoot, "frontend", "public", "cars");
  const slug = demoVehicleImageSlug(make, model);

  for (const extension of PHOTO_EXTENSIONS) {
    const filename = `${slug}${extension}`;
    if (existsSync(join(carsDir, filename))) {
      return `/cars/${filename}`;
    }
  }

  const svgMatch = `${slug}.svg`;
  if (existsSync(join(carsDir, svgMatch))) {
    return `/cars/${svgMatch}`;
  }

  return null;
}
