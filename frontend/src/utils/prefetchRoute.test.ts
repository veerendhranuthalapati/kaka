import { describe, expect, it, vi } from "vitest";
import { prefetchRouteChunk, prefetchVehicleDetails, resetPrefetchForTests } from "./prefetchRoute";

describe("prefetchRoute", () => {
  it("loads a route chunk only once", async () => {
    resetPrefetchForTests();
    const importer = vi.fn(async () => ({}));
    prefetchRouteChunk("details", importer);
    prefetchRouteChunk("details", importer);
    expect(importer).toHaveBeenCalledTimes(1);
  });

  it("prefetches route and vehicle data on details hover", async () => {
    resetPrefetchForTests();
    const route = vi.fn(async () => ({}));
    const data = vi.fn(async () => ({}));
    prefetchVehicleDetails("v1", { route, data });
    expect(route).toHaveBeenCalledOnce();
    expect(data).toHaveBeenCalledWith("v1");
  });
});
