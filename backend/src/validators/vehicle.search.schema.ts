import { z } from "zod";

const numericQuery = z.coerce.number();

export const searchVehiclesQuerySchema = z
  .object({
    make: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    minPrice: numericQuery.optional(),
    maxPrice: numericQuery.optional(),
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
