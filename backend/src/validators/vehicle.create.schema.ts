import { z } from "zod";

export const createVehicleBodySchema = z
  .object({
    make: z.string(),
    model: z.string(),
    category: z.string(),
    price: z.number(),
    quantity: z.number().int(),
  })
  .strict();

export type CreateVehicleBody = z.infer<typeof createVehicleBodySchema>;
