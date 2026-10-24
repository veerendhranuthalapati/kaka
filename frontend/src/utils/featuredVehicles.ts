import type { Vehicle } from "../types";

/** Featured rule: in-stock vehicles, newest first, maximum six. */
export function selectFeaturedVehicles(vehicles: Vehicle[]): Vehicle[] {
  return vehicles
    .filter((vehicle) => vehicle.quantity > 0)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )
    .slice(0, 6);
}
