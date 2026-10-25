import { z } from "zod";
import { VEHICLE_FUEL_TYPES } from "./vehicle.specs.schema.js";
import { safeText } from "./safeText.js";

const numericQuery = z.coerce.number();

export const searchVehiclesQuerySchema = z
  .object({
    make: safeText(120).min(1).optional(),
    model: safeText(120).min(1).optional(),
    category: safeText(80).min(1).optional(),
    minPrice: numericQuery.optional(),
    maxPrice: numericQuery.optional(),
    fuelType: z.enum(VEHICLE_FUEL_TYPES).optional(),
    minYear: numericQuery.int().optional(),
    maxOdometerKm: numericQuery.int().optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "Invalid price range",
    },
  );

export type SearchVehiclesQuery = z.infer<typeof searchVehiclesQuerySchema>;
