import type { Vehicle } from "../types";
import {
  formatBattery,
  formatCc,
  formatEconomy,
  formatKm,
  formatPower,
  formatRange,
  formatSeats,
  formatTorque,
  formatYear,
  labelDrivetrain,
  labelFuelType,
  labelTransmission,
} from "./vehicleSpecsFormat";

export type VehicleSpecRow = { label: string; value: string };

function hasDisplayValue(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed !== "-";
}

function isElectric(fuel: Vehicle["fuelType"]): boolean {
  return fuel === "ELECTRIC";
}

function isHybridFamily(fuel: Vehicle["fuelType"]): boolean {
  return fuel === "HYBRID" || fuel === "PLUG_IN_HYBRID";
}

export function vehicleSpecificationRows(vehicle: Vehicle): VehicleSpecRow[] {
  const electric = isElectric(vehicle.fuelType);
  const hybridFamily = isHybridFamily(vehicle.fuelType);

  const rows: VehicleSpecRow[] = [
    { label: "Distance travelled", value: formatKm(vehicle.odometerKm) },
    { label: "Year", value: formatYear(vehicle.year) },
    { label: "Seats", value: formatSeats(vehicle.seats) },
    ...(electric
      ? []
      : [{ label: "Engine (cc)", value: formatCc(vehicle.engineCc) }]),
    { label: "Power", value: formatPower(vehicle.powerBhp) },
    { label: "Torque", value: formatTorque(vehicle.torqueNm) },
    { label: "Fuel type", value: labelFuelType(vehicle.fuelType) },
    { label: "Transmission", value: labelTransmission(vehicle.transmission) },
    { label: "Drivetrain", value: labelDrivetrain(vehicle.drivetrain) },
    ...(electric
      ? []
      : [{ label: "Mileage (km/l)", value: formatEconomy(vehicle.fuelEconomyKmpl) }]),
    ...(electric || hybridFamily
      ? [
          { label: "Range", value: formatRange(vehicle.rangeKm) },
          { label: "Battery", value: formatBattery(vehicle.batteryKwh) },
        ]
      : []),
    { label: "Colour", value: vehicle.color?.trim() ?? "" },
    {
      label: "Owners",
      value: vehicle.owners == null ? "" : String(vehicle.owners),
    },
    { label: "VIN", value: vehicle.vin?.trim() ?? "" },
  ];

  return rows.filter((row) => hasDisplayValue(row.value));
}
