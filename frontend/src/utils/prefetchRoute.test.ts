import { describe, expect, it, vi } from "vitest";
import {
  prefetchRouteChunk,
  prefetchVehicleDetails,
  resetPrefetchForTests,
} from "./prefetchRoute";

describe("prefetchRoute", () => {
  it("imports a route chunk only once", () => {
    resetPrefetchForTests();
    const importer = vi.fn(() => Promise.resolve({}));
    prefetchRouteChunk("login", importer);
    prefetchRouteChunk("login", importer);
    expect(importer).toHaveBeenCalledTimes(1);
  });

  it("prefetches vehicle details route and optional data loader", () => {
    resetPrefetchForTests();
    const route = vi.fn(() => Promise.resolve({}));
    const data = vi.fn(() => Promise.resolve({}));
    prefetchVehicleDetails("veh-1", { route, data });
    expect(route).toHaveBeenCalledTimes(1);
    expect(data).toHaveBeenCalledWith("veh-1");
  });
});
