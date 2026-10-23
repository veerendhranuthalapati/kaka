import { z } from "zod";

export const loginBodySchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .max(72)
      .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
        message: "Password must be at most 72 UTF-8 bytes",
      }),
  })
  .strict();

export type LoginBody = z.infer<typeof loginBodySchema>;
