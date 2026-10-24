import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "../../src/lib/prisma.js";
import {
  buildDemoSeedUpdatePatch,
  DEMO_VEHICLE_CATALOG,
  resolveOptionalDemoImageUrl,
} from "../../scripts/seed-demo.lib.js";
import { truncateTables } from "../helpers/db.js";
import { resolve } from "node:path";

const base = {
  category: "Sedan",
  price: 1000,
  quantity: 1,
};

describe("seed:demo fill-gaps on _test database", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("updates null spec columns without overwriting set values", async () => {
    const catalog = DEMO_VEHICLE_CATALOG.find(
      (entry) => entry.make === "Toyota" && entry.model === "Camry",
    )!;
    const repoRoot = resolve(process.cwd(), "..");
    const resolved = resolveOptionalDemoImageUrl(
      catalog.make,
      catalog.model,
      repoRoot,
    );

    const created = await prisma.vehicle.create({
      data: {
        make: catalog.make,
        model: catalog.model,
        ...base,
        imageUrl: null,
        year: 2015,
        odometerKm: null,
        engineCc: null,
      },
    });

    const patch = buildDemoSeedUpdatePatch(created, catalog, resolved);
    await prisma.vehicle.update({
      where: { id: created.id },
      data: patch,
    });

    const updated = await prisma.vehicle.findUniqueOrThrow({
      where: { id: created.id },
    });
    expect(updated.year).toBe(2015);
    expect(updated.odometerKm).toBe(catalog.odometerKm);
    expect(updated.engineCc).toBe(catalog.engineCc);
    if (resolved) {
      expect(updated.imageUrl).toBe(resolved);
    }

    const secondPatch = buildDemoSeedUpdatePatch(updated, catalog, resolved);
    expect(secondPatch).toEqual({});
  });
});
