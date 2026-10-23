import { z } from "zod";

export const searchVehiclesQuerySchema = z
  .object({
    make: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
  })
  .strict();

export type SearchVehiclesQuery = z.infer<typeof searchVehiclesQuerySchema>;
