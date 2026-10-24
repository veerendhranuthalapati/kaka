import type { Vehicle, VehicleSearchParams } from "../types";

export const STALE_MS = 30_000;

export type SearchCacheState = {
  data: Vehicle[];
  fetchedAt: number;
  isRevalidating: boolean;
};

type InFlight<T> = {
  promise: Promise<T>;
  generation: number;
  abort: AbortController;
};

export function searchCacheKey(params: VehicleSearchParams): string {
  return JSON.stringify({
    make: params.make ?? "",
    model: params.model ?? "",
    category: params.category ?? "",
    minPrice: params.minPrice ?? null,
    maxPrice: params.maxPrice ?? null,
    fuelType: params.fuelType ?? "",
    minYear: params.minYear ?? null,
    maxOdometerKm: params.maxOdometerKm ?? null,
  });
}

export class VehicleDataCache {
  private search = new Map<string, SearchCacheState>();
  private vehicles = new Map<string, Vehicle>();
  private vehicleFetchedAt = new Map<string, number>();
  private searchInFlight = new Map<string, InFlight<Vehicle[]>>();
  private vehicleInFlight = new Map<string, InFlight<Vehicle>>();
  private searchGeneration = new Map<string, number>();
  private vehicleGeneration = new Map<string, number>();

  getSearch(key: string): SearchCacheState | undefined {
    return this.search.get(key);
  }

  getVehicle(id: string): Vehicle | undefined {
    return this.vehicles.get(id);
  }

  isSearchStale(key: string, now = Date.now()): boolean {
    const entry = this.search.get(key);
    if (!entry) return true;
    return now - entry.fetchedAt > STALE_MS;
  }

  isVehicleStale(id: string, now = Date.now()): boolean {
    const fetchedAt = this.vehicleFetchedAt.get(id);
    if (fetchedAt == null) return true;
    return now - fetchedAt > STALE_MS;
  }

  setSearch(key: string, data: Vehicle[], fetchedAt = Date.now()): void {
    this.search.set(key, { data, fetchedAt, isRevalidating: false });
    for (const vehicle of data) {
      this.vehicles.set(vehicle.id, vehicle);
      this.vehicleFetchedAt.set(vehicle.id, fetchedAt);
    }
  }

  setSearchRevalidating(key: string, revalidating: boolean): void {
    const current = this.search.get(key);
    if (!current) return;
    this.search.set(key, { ...current, isRevalidating: revalidating });
  }

  setVehicle(vehicle: Vehicle, fetchedAt = Date.now()): void {
    this.vehicles.set(vehicle.id, vehicle);
    this.vehicleFetchedAt.set(vehicle.id, fetchedAt);
  }

  patchVehicle(id: string, patch: Partial<Vehicle>): void {
    const current = this.vehicles.get(id);
    if (!current) return;
    this.vehicles.set(id, { ...current, ...patch, id });
    this.syncVehicleInAllSearches({ ...current, ...patch, id });
  }

  upsertVehicle(vehicle: Vehicle): void {
    this.setVehicle(vehicle);
    this.syncVehicleInAllSearches(vehicle);
  }

  removeVehicle(id: string): void {
    this.vehicles.delete(id);
    this.vehicleFetchedAt.delete(id);
    for (const [key, entry] of this.search) {
      this.search.set(key, {
        ...entry,
        data: entry.data.filter((v) => v.id !== id),
      });
    }
  }

  clearAllForTests(): void {
    this.search.clear();
    this.vehicles.clear();
    this.vehicleFetchedAt.clear();
    this.searchInFlight.clear();
    this.vehicleInFlight.clear();
    this.searchGeneration.clear();
    this.vehicleGeneration.clear();
  }

  invalidateAll(): void {
    for (const [key, inflight] of this.searchInFlight) {
      inflight.abort.abort();
      this.searchInFlight.delete(key);
      this.searchGeneration.set(key, (this.searchGeneration.get(key) ?? 0) + 1);
    }
    for (const key of this.search.keys()) {
      this.searchGeneration.set(key, (this.searchGeneration.get(key) ?? 0) + 1);
    }
    for (const [id, inflight] of this.vehicleInFlight) {
      inflight.abort.abort();
      this.vehicleInFlight.delete(id);
      this.vehicleGeneration.set(id, (this.vehicleGeneration.get(id) ?? 0) + 1);
    }
    for (const id of this.vehicles.keys()) {
      this.vehicleGeneration.set(id, (this.vehicleGeneration.get(id) ?? 0) + 1);
    }
  }

  private syncVehicleInAllSearches(vehicle: Vehicle): void {
    for (const [key, entry] of this.search) {
      const index = entry.data.findIndex((v) => v.id === vehicle.id);
      if (index === -1) continue;
      const next = [...entry.data];
      next[index] = vehicle;
      this.search.set(key, { ...entry, data: next });
    }
  }

  async loadSearch(
    key: string,
    params: VehicleSearchParams,
    fetcher: (params: VehicleSearchParams, signal: AbortSignal) => Promise<Vehicle[]>,
  ): Promise<Vehicle[]> {
    const inflight = this.searchInFlight.get(key);
    if (inflight) {
      return inflight.promise;
    }

    const generation = (this.searchGeneration.get(key) ?? 0) + 1;
    this.searchGeneration.set(key, generation);

    const abort = new AbortController();
    const promise = fetcher(params, abort.signal)
      .then((data) => {
        if (this.searchGeneration.get(key) !== generation) {
          return this.search.get(key)?.data ?? data;
        }
        this.setSearch(key, data);
        return data;
      })
      .finally(() => {
        if (this.searchInFlight.get(key)?.generation === generation) {
          this.searchInFlight.delete(key);
        }
        const entry = this.search.get(key);
        if (entry) {
          this.setSearchRevalidating(key, false);
        }
      });

    this.searchInFlight.set(key, { promise, generation, abort });
    const cached = this.search.get(key);
    if (cached) {
      this.setSearchRevalidating(key, true);
    }
    return promise;
  }

  async loadVehicle(
    id: string,
    fetcher: (id: string, signal: AbortSignal) => Promise<Vehicle>,
  ): Promise<Vehicle> {
    const generation = (this.vehicleGeneration.get(id) ?? 0) + 1;
    this.vehicleGeneration.set(id, generation);
    const previous = this.vehicleInFlight.get(id);
    if (previous) {
      previous.abort.abort();
    }

    const abort = new AbortController();
    const promise = fetcher(id, abort.signal)
      .then((vehicle) => {
        if (this.vehicleGeneration.get(id) !== generation) {
          return this.vehicles.get(id) ?? vehicle;
        }
        this.setVehicle(vehicle);
        return vehicle;
      })
      .finally(() => {
        if (this.vehicleInFlight.get(id)?.generation === generation) {
          this.vehicleInFlight.delete(id);
        }
      });

    this.vehicleInFlight.set(id, { promise, generation, abort });
    return promise;
  }
}

export const vehicleDataCache = new VehicleDataCache();

/** Clears cached search/vehicle rows (unit tests only). */
export function resetVehicleDataCacheForTests(): void {
  vehicleDataCache.clearAllForTests();
}
