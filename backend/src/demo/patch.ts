import type { DemoCatalogEntry } from "./catalog.js";

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
    if (key === "features") {
      const currentFeatures = existing.features;
      const nextFeatures = catalog.features;
      const needsFeatures =
        currentFeatures == null || currentFeatures.length === 0;
      if (
        needsFeatures &&
        nextFeatures != null &&
        nextFeatures.length > 0
      ) {
        patch.features = nextFeatures;
      }
      continue;
    }
    const current = existing[key as keyof DemoSeedExistingRow];
    const next = catalog[key];
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
