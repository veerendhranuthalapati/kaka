import { z } from "zod";
import { optionalNullableVehicleImageUrlSchema } from "./vehicle.imageUrl.schema.js";
import { optionalVehicleSpecFieldsSchema } from "./vehicle.specs.schema.js";

export const createVehicleBodySchema = z
  .object({
    make: z.string().min(1).max(100),
    model: z.string().min(1).max(100),
    category: z.string().min(1).max(100),
    price: z.number().nonnegative(),
    quantity: z.number().int().nonnegative(),
    imageUrl: optionalNullableVehicleImageUrlSchema,
  })
  .merge(optionalVehicleSpecFieldsSchema)
  .strict();

export type CreateVehicleBody = z.infer<typeof createVehicleBodySchema>;
