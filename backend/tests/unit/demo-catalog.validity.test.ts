import { describe, expect, it } from "vitest";
import { createVehicleBodySchema } from "../../src/validators/vehicle.create.schema.js";
import { DEMO_VEHICLE_CATALOG } from "../../scripts/seed-demo.lib.js";

describe("demo vehicle catalog validity", () => {
  it("has 24+ unique make/model rows and category distribution", () => {
    expect(DEMO_VEHICLE_CATALOG.length).toBeGreaterThanOrEqual(24);
    const keys = new Set(
      DEMO_VEHICLE_CATALOG.map((v) => `${v.make}::${v.model}`),
    );
    expect(keys.size).toBe(DEMO_VEHICLE_CATALOG.length);

    const byCategory = new Map<string, number>();
    for (const vehicle of DEMO_VEHICLE_CATALOG) {
      byCategory.set(vehicle.category, (byCategory.get(vehicle.category) ?? 0) + 1);
    }
    for (const count of byCategory.values()) {
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(5);
    }
  });

  it("passes create schema and EV null rules for every entry", () => {
    const outOfStock = DEMO_VEHICLE_CATALOG.filter((v) => v.quantity === 0);
    expect(outOfStock.length).toBeGreaterThanOrEqual(2);

    for (const vehicle of DEMO_VEHICLE_CATALOG) {
      const parsed = createVehicleBodySchema.safeParse({
        ...vehicle,
        imageUrl: null,
      });
      expect(parsed.success).toBe(true);
      if (vehicle.fuelType === "ELECTRIC") {
        expect(vehicle.engineCc).toBeNull();
        expect(vehicle.fuelEconomyKmpl).toBeNull();
        expect(vehicle.rangeKm).not.toBeNull();
        expect(vehicle.batteryKwh).not.toBeNull();
      }
      expect(vehicle.description.length).toBeGreaterThan(10);
      expect(vehicle.features.length).toBeGreaterThanOrEqual(5);
      expect(vehicle.vin).toBeNull();
    }
  });
});
