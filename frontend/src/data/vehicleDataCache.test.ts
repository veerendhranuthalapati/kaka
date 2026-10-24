import { describe, expect, it, vi } from "vitest";
import { makeVehicle } from "../test/fixtures";
import { searchCacheKey, VehicleDataCache } from "./vehicleDataCache";

describe("VehicleDataCache", () => {
  it("dedupes concurrent in-flight search requests", async () => {
    const cache = new VehicleDataCache();
    const key = searchCacheKey({});
    const fetcher = vi.fn(
      () =>
        new Promise<ReturnType<typeof makeVehicle>[]>((resolve) => {
          setTimeout(() => resolve([makeVehicle({ id: "a" })]), 20);
        }),
    );

    const [one, two] = await Promise.all([
      cache.loadSearch(key, {}, fetcher),
      cache.loadSearch(key, {}, fetcher),
    ]);
    expect(one).toEqual(two);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("aborts in-flight search when invalidateAll runs", async () => {
    const cache = new VehicleDataCache();
    const key = searchCacheKey({ make: "x" });
    let captured: AbortSignal | undefined;
    const fetcher = vi.fn((_params, signal): Promise<ReturnType<typeof makeVehicle>[]> => {
      captured = signal;
      return new Promise(() => {});
    });

    void cache.loadSearch(key, { make: "x" }, fetcher);
    await new Promise((resolve) => setTimeout(resolve, 0));
    cache.invalidateAll();
    expect(captured?.aborted).toBe(true);
  });

  it("invalidates list entries after delete and patches after purchase", () => {
    const cache = new VehicleDataCache();
    const key = searchCacheKey({});
    const vehicle = makeVehicle({ id: "v1", quantity: 3 });
    cache.setSearch(key, [vehicle]);

    cache.patchVehicle("v1", { quantity: 2 });
    expect(cache.getSearch(key)?.data[0]?.quantity).toBe(2);

    cache.removeVehicle("v1");
    expect(cache.getSearch(key)?.data).toHaveLength(0);
  });
});
