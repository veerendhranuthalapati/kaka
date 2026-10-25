import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { makeVehicle } from "../test/fixtures";
import { ApiError } from "../api/client";
import * as vehiclesApi from "../api/vehicles";
import {
  VehicleDataProvider,
  useVehicleData,
} from "./VehicleDataProvider";
import { vehicleDataCache } from "./vehicleDataCache";

vi.mock("../api/vehicles", () => ({
  createVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
  getVehicleById: vi.fn(),
  purchaseVehicle: vi.fn(),
  restockVehicle: vi.fn(),
  searchVehicles: vi.fn(),
  updateVehicle: vi.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <VehicleDataProvider>{children}</VehicleDataProvider>;
}

describe("useVehicleData", () => {
  it("throws outside of VehicleDataProvider", () => {
    expect(() => renderHook(() => useVehicleData())).toThrow(
      /VehicleDataProvider/,
    );
  });
});

describe("VehicleDataProvider purchaseWithOptimistic", () => {
  beforeEach(() => {
    vehicleDataCache.invalidateAll();
    vi.clearAllMocks();
  });

  it("rolls back quantity when purchase fails", async () => {
    const vehicle = makeVehicle({ id: "v-purchase", quantity: 2 });
    vehicleDataCache.upsertVehicle(vehicle);
    vi.mocked(vehiclesApi.purchaseVehicle).mockRejectedValueOnce(
      new ApiError(500, "INTERNAL_ERROR", "fail"),
    );

    const { result } = renderHook(() => useVehicleData(), { wrapper });
    let outcome!: Awaited<
      ReturnType<typeof result.current.purchaseWithOptimistic>
    >;
    await act(async () => {
      outcome = await result.current.purchaseWithOptimistic(vehicle);
    });

    expect(outcome).toEqual({ ok: false, message: "fail" });
    expect(vehicleDataCache.getVehicle("v-purchase")?.quantity).toBe(2);
  });

  it("sets quantity to zero on OUT_OF_STOCK", async () => {
    const vehicle = makeVehicle({ id: "v-oos", quantity: 1 });
    vehicleDataCache.upsertVehicle(vehicle);
    vi.mocked(vehiclesApi.purchaseVehicle).mockRejectedValueOnce(
      new ApiError(409, "OUT_OF_STOCK", "Sold out"),
    );

    const { result } = renderHook(() => useVehicleData(), { wrapper });
    await act(async () => {
      await result.current.purchaseWithOptimistic(vehicle);
    });

    expect(vehicleDataCache.getVehicle("v-oos")?.quantity).toBe(0);
  });

  it("upserts created vehicles into the cache", async () => {
    const created = makeVehicle({ id: "new-v", make: "Mazda" });
    vi.mocked(vehiclesApi.createVehicle).mockResolvedValueOnce(created);

    const { result } = renderHook(() => useVehicleData(), { wrapper });
    await act(async () => {
      await result.current.createVehicleInCache({
        make: "Mazda",
        model: "3",
        category: "Sedan",
        price: 20000,
        quantity: 1,
      });
    });

    expect(vehicleDataCache.getVehicle("new-v")?.make).toBe("Mazda");
  });

  it("updates, restocks, and deletes cached vehicles", async () => {
    const vehicle = makeVehicle({ id: "mut", quantity: 2 });
    vehicleDataCache.upsertVehicle(vehicle);
    const updated = { ...vehicle, make: "Updated" };
    const restocked = { ...vehicle, quantity: 5 };
    vi.mocked(vehiclesApi.updateVehicle).mockResolvedValueOnce(updated);
    vi.mocked(vehiclesApi.restockVehicle).mockResolvedValueOnce(restocked);
    vi.mocked(vehiclesApi.deleteVehicle).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useVehicleData(), { wrapper });
    await act(async () => {
      await result.current.updateVehicleInCache("mut", {
        make: "Updated",
        model: vehicle.model,
        category: vehicle.category,
        price: vehicle.price,
      });
      await result.current.restockVehicleInCache("mut", 3);
      await result.current.deleteVehicleFromCache("mut");
    });

    expect(vehicleDataCache.getVehicle("mut")).toBeUndefined();
  });

  it("loads a vehicle through the cache", async () => {
    const vehicle = makeVehicle({ id: "load-me" });
    vi.mocked(vehiclesApi.getVehicleById).mockResolvedValueOnce(vehicle);

    const { result } = renderHook(() => useVehicleData(), { wrapper });
    await act(async () => {
      const loaded = await result.current.loadVehicle("load-me");
      expect(loaded.id).toBe("load-me");
    });
  });
});
