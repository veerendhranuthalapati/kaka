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

const plainTextNoAngles = z
  .string()
  .trim()
  .refine((value) => !value.includes("<") && !value.includes(">"), {
    message: "Plain text only; angle brackets are not allowed",
  });

const featureItemSchema = plainTextNoAngles
  .min(2)
  .max(40);

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
    seats: z.number().int().min(1).max(9).nullable().optional(),
    rangeKm: z.number().int().min(20).max(1500).nullable().optional(),
    batteryKwh: z.number().min(5).max(250).nullable().optional(),
    description: plainTextNoAngles.max(600).nullable().optional(),
    features: z
      .array(featureItemSchema)
      .max(12)
      .optional()
      .transform((items) => {
        if (!items) return items;
        return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
      }),
  })
  .strict();

export type OptionalVehicleSpecFields = z.infer<
  typeof optionalVehicleSpecFieldsSchema
>;
