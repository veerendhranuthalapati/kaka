import { describe, expect, it } from "vitest";
import {
  buildDemoSeedUpdatePatch,
  DEMO_VEHICLE_CATALOG,
} from "../../scripts/seed-demo.lib.js";

describe("buildDemoSeedUpdatePatch", () => {
  const catalog = DEMO_VEHICLE_CATALOG[0]!;

  it("fills only null fields and imageUrl", () => {
    const patch = buildDemoSeedUpdatePatch(
      {
        category: "Sedan",
        price: 1000,
        quantity: 1,
        imageUrl: null,
        year: null,
        odometerKm: 999,
        engineCc: null,
      },
      catalog,
      "/cars/toyota-camry.jpg",
    );

    expect(patch.year).toBe(catalog.year);
    expect(patch.odometerKm).toBeUndefined();
    expect(patch.engineCc).toBe(catalog.engineCc);
    expect(patch.imageUrl).toBe("/cars/toyota-camry.jpg");
  });

  it("is idempotent when nothing is null", () => {
    const patch = buildDemoSeedUpdatePatch(
      {
        category: catalog.category,
        price: catalog.price,
        quantity: catalog.quantity,
        imageUrl: "/cars/custom.jpg",
        year: catalog.year ?? null,
        odometerKm: catalog.odometerKm ?? null,
        engineCc: catalog.engineCc ?? null,
        powerBhp: catalog.powerBhp ?? null,
        torqueNm: catalog.torqueNm ?? null,
        fuelType: catalog.fuelType ?? null,
        transmission: catalog.transmission ?? null,
        drivetrain: catalog.drivetrain ?? null,
        fuelEconomyKmpl: catalog.fuelEconomyKmpl ?? null,
        color: catalog.color ?? null,
        owners: catalog.owners ?? null,
        vin: catalog.vin ?? null,
        seats: catalog.seats ?? null,
        rangeKm: catalog.rangeKm ?? null,
        batteryKwh: catalog.batteryKwh ?? null,
        description: catalog.description ?? null,
        features: catalog.features ?? null,
      },
      catalog,
      "/cars/toyota-camry.jpg",
    );
    expect(patch).toEqual({});
  });
});
