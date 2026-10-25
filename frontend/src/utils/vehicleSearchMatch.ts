import type { Vehicle, VehicleSearchParams } from "../types";

export function searchFiltersActive(params: VehicleSearchParams): boolean {
  return (
    Boolean(params.make?.trim()) ||
    Boolean(params.model?.trim()) ||
    Boolean(params.category?.trim()) ||
    params.minPrice != null ||
    params.maxPrice != null ||
    Boolean(params.fuelType?.trim()) ||
    params.minYear != null ||
    params.maxOdometerKm != null
  );
}

export function vehicleMatchesSearch(
  vehicle: Vehicle,
  params: VehicleSearchParams,
): boolean {
  if (params.make?.trim()) {
    const needle = params.make.trim().toLowerCase();
    if (
      !vehicle.make.toLowerCase().includes(needle) &&
      !vehicle.model.toLowerCase().includes(needle)
    ) {
      return false;
    }
  }
  if (params.model?.trim()) {
    const needle = params.model.trim().toLowerCase();
    if (!vehicle.model.toLowerCase().includes(needle)) return false;
  }
  if (params.category?.trim()) {
    if (vehicle.category.toLowerCase() !== params.category.trim().toLowerCase()) {
      return false;
    }
  }
  if (params.minPrice != null && vehicle.price < params.minPrice) return false;
  if (params.maxPrice != null && vehicle.price > params.maxPrice) return false;
  if (params.fuelType?.trim() && vehicle.fuelType !== params.fuelType) {
    return false;
  }
  if (params.minYear != null && (vehicle.year ?? 0) < params.minYear) {
    return false;
  }
  if (
    params.maxOdometerKm != null &&
    (vehicle.odometerKm ?? Number.MAX_SAFE_INTEGER) > params.maxOdometerKm
  ) {
    return false;
  }
  return true;
}
