import { z } from "zod";

export const createVehicleBodySchema = z
  .object({
    make: z.string().min(1),
    model: z.string().min(1),
    category: z.string().min(1),
    price: z.number().nonnegative(),
    quantity: z.number().int().nonnegative(),
  })
  .strict();

export type CreateVehicleBody = z.infer<typeof createVehicleBodySchema>;
