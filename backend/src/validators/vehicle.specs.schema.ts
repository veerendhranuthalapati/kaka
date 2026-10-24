import { z } from "zod";

export const VEHICLE_FUEL_TYPES = [
  "PETROL",
  "DIESEL",
  "ELECTRIC",
  "HYBRID",
  "PLUG_IN_HYBRID",
  "CNG",
  "LPG",
] as const;

export const VEHICLE_TRANSMISSION_TYPES = [
  "MANUAL",
  "AUTOMATIC",
  "CVT",
  "DCT",
] as const;

export const VEHICLE_DRIVETRAIN_TYPES = [
  "FWD",
  "RWD",
  "AWD",
  "FOUR_WD",
] as const;

export function currentModelYearMax(): number {
  return new Date().getFullYear() + 1;
}

const vinSchema = z
  .string()
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/i, "Invalid VIN format")
  .transform((value) => value.toUpperCase());

const colorSchema = z
  .string()
  .max(32)
  .regex(/^[A-Za-z][A-Za-z\s-]*$/, "Color may only contain letters, spaces, and hyphens");

export const optionalVehicleSpecFieldsSchema = z
  .object({
    year: z
      .number()
      .int()
      .min(1980)
      .max(currentModelYearMax())
      .nullable()
      .optional(),
    odometerKm: z.number().int().min(0).max(2_000_000).nullable().optional(),
    engineCc: z.number().int().min(50).max(10_000).nullable().optional(),
    powerBhp: z.number().int().min(1).max(2_000).nullable().optional(),
    torqueNm: z.number().int().min(1).max(3_000).nullable().optional(),
    fuelType: z.enum(VEHICLE_FUEL_TYPES).nullable().optional(),
    transmission: z.enum(VEHICLE_TRANSMISSION_TYPES).nullable().optional(),
    drivetrain: z.enum(VEHICLE_DRIVETRAIN_TYPES).nullable().optional(),
    fuelEconomyKmpl: z.number().min(0.1).max(100).nullable().optional(),
    color: colorSchema.nullable().optional(),
    owners: z.number().int().min(1).max(10).nullable().optional(),
    vin: vinSchema.nullable().optional(),
  })
  .strict();

export type OptionalVehicleSpecFields = z.infer<
  typeof optionalVehicleSpecFieldsSchema
>;
