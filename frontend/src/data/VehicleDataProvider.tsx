import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  purchaseVehicle,
  restockVehicle,
  searchVehicles,
  updateVehicle,
} from "../api/vehicles";
import { ApiError } from "../api/client";
import type {
  Vehicle,
  VehicleInput,
  VehicleSearchParams,
  VehicleUpdateInput,
} from "../types";
import {
  searchCacheKey,
  STALE_MS,
  vehicleDataCache,
} from "./vehicleDataCache";

export const SCROLL_RESTORE_KEY = "dealership_inventory_scroll_y";

type VehicleDataContextValue = {
  getCachedVehicle: (id: string) => Vehicle | undefined;
  loadVehicle: (id: string) => Promise<Vehicle>;
  purchaseWithOptimistic: (
    vehicle: Vehicle,
  ) => Promise<{ ok: true; vehicle: Vehicle } | { ok: false; code?: string; message: string }>;
  applyVehicleMutation: (vehicle: Vehicle) => void;
  removeVehicleFromCache: (id: string) => void;
  createVehicleInCache: (input: VehicleInput) => Promise<Vehicle>;
  createVehicleForSearch: (
    input: VehicleInput,
    searchParams: VehicleSearchParams,
  ) => Promise<Vehicle>;
  updateVehicleInCache: (id: string, input: VehicleUpdateInput) => Promise<Vehicle>;
  restockVehicleInCache: (id: string, amount: number) => Promise<Vehicle>;
  deleteVehicleFromCache: (id: string) => Promise<void>;
  bumpSearchRefresh: () => void;
  searchRefreshToken: number;
  searchDataVersion: number;
};

const VehicleDataContext = createContext<VehicleDataContextValue | null>(null);

export function VehicleDataProvider({ children }: { children: ReactNode }) {
  const lastFocusRevalidate = useRef(0);
  const [searchRefreshToken, setSearchRefreshToken] = useState(0);
  const [searchDataVersion, setSearchDataVersion] = useState(0);

  const bumpSearchRefresh = useCallback(() => {
    vehicleDataCache.invalidateAll();
    setSearchRefreshToken((t) => t + 1);
  }, []);

  const bumpSearchDataVersion = useCallback(() => {
    setSearchDataVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    function onFocus() {
      const now = Date.now();
      if (now - lastFocusRevalidate.current < STALE_MS) return;
      lastFocusRevalidate.current = now;
      bumpSearchRefresh();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [bumpSearchRefresh]);

  const value = useMemo<VehicleDataContextValue>(
    () => ({
      searchRefreshToken,
      searchDataVersion,
      bumpSearchRefresh,
      getCachedVehicle: (id) => vehicleDataCache.getVehicle(id),
      loadVehicle: (id) =>
        vehicleDataCache.loadVehicle(id, (vehicleId, signal) =>
          getVehicleById(vehicleId, signal),
        ),
      purchaseWithOptimistic: async (vehicle) => {
        const previousQty = vehicle.quantity;
        vehicleDataCache.patchVehicle(vehicle.id, {
          quantity: Math.max(0, vehicle.quantity - 1),
        });
        try {
          const updated = await purchaseVehicle(vehicle.id);
          vehicleDataCache.upsertVehicle(updated);
          return { ok: true, vehicle: updated };
        } catch (error) {
          vehicleDataCache.patchVehicle(vehicle.id, { quantity: previousQty });
          if (error instanceof ApiError && error.code === "OUT_OF_STOCK") {
            vehicleDataCache.patchVehicle(vehicle.id, { quantity: 0 });
            return { ok: false, code: error.code, message: error.message };
          }
          const message =
            error instanceof ApiError ? error.message : "Purchase failed. Try again.";
          return { ok: false, message };
        }
      },
      applyVehicleMutation: (vehicle) => vehicleDataCache.upsertVehicle(vehicle),
      removeVehicleFromCache: (id) => vehicleDataCache.removeVehicle(id),
      createVehicleInCache: async (input) => {
        const created = await createVehicle(input);
        vehicleDataCache.upsertVehicle(created);
        bumpSearchRefresh();
        return created;
      },
      createVehicleForSearch: async (input, searchParams) => {
        const created = await createVehicle(input);
        vehicleDataCache.upsertVehicle(created);
        vehicleDataCache.appendVehicleToMatchingSearches(created, searchParams);
        bumpSearchDataVersion();
        return created;
      },
      updateVehicleInCache: async (id, input) => {
        const updated = await updateVehicle(id, input);
        vehicleDataCache.upsertVehicle(updated);
        return updated;
      },
      restockVehicleInCache: async (id, amount) => {
        const updated = await restockVehicle(id, amount);
        vehicleDataCache.upsertVehicle(updated);
        return updated;
      },
      deleteVehicleFromCache: async (id) => {
        await deleteVehicle(id);
        vehicleDataCache.removeVehicle(id);
      },
    }),
    [bumpSearchRefresh, bumpSearchDataVersion, searchRefreshToken, searchDataVersion],
  );

  return (
    <VehicleDataContext.Provider value={value}>{children}</VehicleDataContext.Provider>
  );
}

export function useVehicleData(): VehicleDataContextValue {
  const ctx = useContext(VehicleDataContext);
  if (!ctx) {
    throw new Error("useVehicleData requires VehicleDataProvider");
  }
  return ctx;
}

export function useVehicleSearch(params: VehicleSearchParams) {
  const { searchRefreshToken, searchDataVersion } = useVehicleData();
  const key = searchCacheKey(params);
  const [error, setError] = useState<string | null>(null);
  const cached = vehicleDataCache.getSearch(key);
  const hasData = Boolean(cached);
  const [initialLoading, setInitialLoading] = useState(!hasData);

  useEffect(() => {
    let cancelled = false;
    const entry = vehicleDataCache.getSearch(key);
    const stale = vehicleDataCache.isSearchStale(key);
    if (entry && !stale) {
      setInitialLoading(false);
      return;
    }
    if (!entry) {
      setInitialLoading(true);
    } else {
      vehicleDataCache.setSearchRevalidating(key, true);
    }
    void vehicleDataCache
      .loadSearch(key, params, (p, signal) => searchVehicles(p, signal))
      .then(() => {
        if (!cancelled) {
          setError(null);
          setInitialLoading(false);
        }
      })
      .catch((caught) => {
        if (cancelled) return;
        if (caught instanceof ApiError) {
          setError(caught.message);
        } else {
          setError("Failed to load vehicles.");
        }
        setInitialLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [key, searchRefreshToken, searchDataVersion]);

  const entry = vehicleDataCache.getSearch(key);
  return {
    vehicles: entry?.data ?? [],
    loading: initialLoading && !hasData,
    isRevalidating: entry?.isRevalidating ?? false,
    error,
  };
}
