import { describe, expect, it } from "vitest";
import {
  listDemoCarImagePaths,
  refuseProductionSeed,
} from "../../scripts/seed-demo.lib.js";

describe("seed:demo helpers", () => {
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
});
