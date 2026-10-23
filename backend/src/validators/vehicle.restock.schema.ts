import { z } from "zod";

export const restockVehicleBodySchema = z
  .object({
    amount: z.number().int().gte(1),
  })
  .strict();
