import { z } from "zod";
import { optionalNullableVehicleImageUrlSchema } from "./vehicle.imageUrl.schema.js";

export const createVehicleBodySchema = z
  .object({
    make: z.string().min(1).max(100),
    model: z.string().min(1).max(100),
    category: z.string().min(1).max(100),
    price: z.number().nonnegative(),
    quantity: z.number().int().nonnegative(),
    imageUrl: optionalNullableVehicleImageUrlSchema,
  })
  .strict();

export type CreateVehicleBody = z.infer<typeof createVehicleBodySchema>;
