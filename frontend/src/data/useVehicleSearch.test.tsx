import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { makeVehicle } from "../test/fixtures";
import * as vehiclesApi from "../api/vehicles";
import { VehicleDataProvider, useVehicleSearch } from "./VehicleDataProvider";
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

describe("useVehicleSearch", () => {
  beforeEach(() => {
    vehicleDataCache.invalidateAll();
    vi.clearAllMocks();
  });

  it("loads vehicles and clears loading state", async () => {
    vi.mocked(vehiclesApi.searchVehicles).mockResolvedValueOnce([
      makeVehicle({ id: "search-1" }),
    ]);

    const { result } = renderHook(() => useVehicleSearch({}), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.vehicles).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

});
