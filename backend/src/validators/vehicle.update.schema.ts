import { z } from "zod";
import { optionalNullableVehicleImageUrlSchema } from "./vehicle.imageUrl.schema.js";
import { optionalVehicleSpecFieldsSchema } from "./vehicle.specs.schema.js";

export const updateVehicleBodySchema = z
  .object({
    make: z.string().min(1).max(100).optional(),
    model: z.string().min(1).max(100).optional(),
    category: z.string().min(1).max(100).optional(),
    price: z.number().nonnegative().optional(),
    imageUrl: optionalNullableVehicleImageUrlSchema,
  })
  .merge(optionalVehicleSpecFieldsSchema)
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No updates provided",
  });

export type UpdateVehicleBody = z.infer<typeof updateVehicleBodySchema>;
