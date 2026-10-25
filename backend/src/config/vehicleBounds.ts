/** Bounds aligned with `vehicle.specs.schema.ts` for DB CHECK constraints. */

export const VEHICLE_YEAR_MIN = 1980;

export function vehicleYearMax(): number {
  return new Date().getFullYear() + 1;
}

export const VEHICLE_ODOMETER_MAX = 2_000_000;
export const VEHICLE_ENGINE_CC_MIN = 50;
export const VEHICLE_ENGINE_CC_MAX = 10_000;
export const VEHICLE_POWER_BHP_MIN = 1;
export const VEHICLE_POWER_BHP_MAX = 2_000;
export const VEHICLE_TORQUE_NM_MIN = 1;
export const VEHICLE_TORQUE_NM_MAX = 3_000;
export const VEHICLE_FUEL_ECONOMY_MIN = 0.1;
export const VEHICLE_FUEL_ECONOMY_MAX = 100;
export const VEHICLE_SEATS_MIN = 1;
export const VEHICLE_SEATS_MAX = 9;
export const VEHICLE_OWNERS_MIN = 1;
export const VEHICLE_OWNERS_MAX = 10;
export const VEHICLE_RANGE_KM_MIN = 20;
export const VEHICLE_RANGE_KM_MAX = 1500;
export const VEHICLE_BATTERY_KWH_MIN = 5;
export const VEHICLE_BATTERY_KWH_MAX = 250;
export const VEHICLE_FEATURES_MAX = 12;
