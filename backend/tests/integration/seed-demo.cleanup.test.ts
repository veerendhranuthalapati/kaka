import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/lib/prisma.js";
import { cleanupLegacyDemoSeedVehicles } from "../../scripts/seed-demo.lib.js";
import { truncateTables } from "../helpers/db.js";

const base = {
  category: "Sedan",
  price: 1000,
  quantity: 1,
};

describe("cleanupLegacyDemoSeedVehicles", () => {
  beforeEach(async () => {
    await truncateTables();
  });

  afterEach(async () => {
    await truncateTables();
  });

  it("removes legacy demo-seed rows and keeps real inventory", async () => {
    await prisma.vehicle.create({
      data: { make: "demo-seed", model: "Legacy", ...base },
    });
    await prisma.vehicle.create({
      data: { make: "demo-seed Aurora", model: "LX", ...base },
    });
    await prisma.vehicle.create({
      data: { make: "Toyota", model: "Camry", ...base },
    });

    const removed = await cleanupLegacyDemoSeedVehicles(prisma);
    expect(removed).toBe(2);

    const remaining = await prisma.vehicle.findMany();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toMatchObject({ make: "Toyota", model: "Camry" });
  });
});
