import { z } from "zod";

export const updateVehicleBodySchema = z
  .object({
    make: z.string().min(1).max(100).optional(),
    model: z.string().min(1).max(100).optional(),
    category: z.string().min(1).max(100).optional(),
    price: z.number().nonnegative().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No updates provided",
  });

export type UpdateVehicleBody = z.infer<typeof updateVehicleBodySchema>;
