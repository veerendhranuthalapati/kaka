import { existsSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import {
  DEMO_VEHICLE_CATALOG,
  demoVehicleImageSlug,
  listAllCarAssetFilenames,
  listDemoCarImagePaths,
  refuseProductionSeed,
  refuseTestDatabase,
  resolveOptionalDemoImageUrl,
} from "../../scripts/seed-demo.lib.js";

describe("seed:demo helpers", () => {
  afterEach(() => {
    refuseProductionSeed("test");
  });

  it("refuses to run in production", () => {
    expect(() => refuseProductionSeed("production")).toThrow(/production/i);
    expect(() => refuseProductionSeed("test")).not.toThrow();
  });

  it("refuses to run against a database name ending in _test", () => {
    expect(() =>
      refuseTestDatabase("postgresql://user:pass@localhost:5432/dealership_test"),
    ).toThrow(/_test database/i);
    expect(() =>
      refuseTestDatabase("postgresql://user:pass@localhost:5432/dealership_dev"),
    ).not.toThrow();
  });

  it("lists only files that exist under frontend/public/cars", () => {
    const paths = listDemoCarImagePaths();
    expect(paths.length).toBeGreaterThanOrEqual(8);
    for (const path of paths) {
      expect(path.startsWith("/cars/")).toBe(true);
      expect(path.endsWith(".svg")).toBe(true);
    }
  });

  it("resolves optional photo filenames and returns null when nothing matches", () => {
    const root = join(tmpdir(), `seed-demo-test-${Date.now()}`);
    const carsDir = join(root, "frontend", "public", "cars");
    mkdirSync(carsDir, { recursive: true });
    writeFileSync(join(carsDir, "sedan-01.svg"), "<svg></svg>");
    writeFileSync(join(carsDir, "aurora-lx.jpg"), "jpeg");

    expect(demoVehicleImageSlug("Aurora", "LX")).toBe("aurora-lx");
    expect(resolveOptionalDemoImageUrl("Aurora", "LX", root)).toBe(
      "/cars/aurora-lx.jpg",
    );
    expect(resolveOptionalDemoImageUrl("Summit", "Tour", root)).toBeNull();

    rmSync(root, { recursive: true, force: true });
  });

  it("uses real make names and 10-12 illustrative catalog entries", () => {
    expect(DEMO_VEHICLE_CATALOG.length).toBeGreaterThanOrEqual(10);
    expect(DEMO_VEHICLE_CATALOG.length).toBeLessThanOrEqual(12);
    for (const entry of DEMO_VEHICLE_CATALOG) {
      expect(entry.make).not.toMatch(/demo-seed/i);
      expect(entry.make.length).toBeGreaterThan(0);
    }
  });

  it("lists all car asset filenames from disk", () => {
    const files = listAllCarAssetFilenames();
    expect(files.length).toBeGreaterThan(0);
    expect(files.every((name) => !name.includes(".."))).toBe(true);
    expect(existsSync(join(resolve(process.cwd(), ".."), "frontend", "public", "cars", files[0]!))).toBe(
      true,
    );
  });
});
