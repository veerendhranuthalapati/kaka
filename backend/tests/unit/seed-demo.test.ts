import { existsSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import {
  demoVehicleImageSlug,
  listAllCarAssetFilenames,
  listDemoCarImagePaths,
  refuseProductionSeed,
  resolveDemoVehicleImageUrl,
} from "../../scripts/seed-demo.lib.js";

describe("seed:demo helpers", () => {
  afterEach(() => {
    refuseProductionSeed("test");
  });

  it("refuses to run in production", () => {
    expect(() => refuseProductionSeed("production")).toThrow(/production/i);
    expect(() => refuseProductionSeed("test")).not.toThrow();
  });

  it("lists only files that exist under frontend/public/cars", () => {
    const paths = listDemoCarImagePaths();
    expect(paths.length).toBeGreaterThanOrEqual(8);
    for (const path of paths) {
      expect(path.startsWith("/cars/")).toBe(true);
      expect(path.endsWith(".svg")).toBe(true);
    }
  });

  it("resolves make-model photo filenames before falling back to SVG rotation", () => {
    const root = join(tmpdir(), `seed-demo-test-${Date.now()}`);
    const carsDir = join(root, "frontend", "public", "cars");
    mkdirSync(carsDir, { recursive: true });
    writeFileSync(join(carsDir, "sedan-01.svg"), "<svg></svg>");
    writeFileSync(join(carsDir, "aurora-lx.jpg"), "jpeg");

    expect(demoVehicleImageSlug("Aurora", "LX")).toBe("aurora-lx");
    expect(
      resolveDemoVehicleImageUrl("Aurora", "LX", root, ["/cars/sedan-01.svg"], 0),
    ).toBe("/cars/aurora-lx.jpg");
    expect(
      resolveDemoVehicleImageUrl("Summit", "Tour", root, ["/cars/sedan-01.svg"], 0),
    ).toBe("/cars/sedan-01.svg");

    rmSync(root, { recursive: true, force: true });
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
