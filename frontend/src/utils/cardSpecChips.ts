import type { Vehicle } from "../types";
import { formatKm, labelFuelType, labelTransmission } from "./vehicleSpecsFormat";

/** Up to four short labels for inventory cards (null specs omitted). */
export function cardSpecChips(vehicle: Vehicle): string[] {
  const chips: string[] = [];

  if (vehicle.year != null) {
    chips.push(String(vehicle.year));
  }

  if (vehicle.odometerKm != null) {
    chips.push(formatKm(vehicle.odometerKm));
  }

  if (vehicle.fuelType) {
    chips.push(labelFuelType(vehicle.fuelType));
  }

  if (vehicle.transmission) {
    chips.push(labelTransmission(vehicle.transmission));
  }

  if (chips.length < 4 && vehicle.drivetrain) {
    chips.push(vehicle.drivetrain.replace("FOUR_WD", "4WD"));
  }

  return chips.slice(0, 4);
}
