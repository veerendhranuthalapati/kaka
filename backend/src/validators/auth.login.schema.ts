import { z } from "zod";
import { normalizeEmail } from "./normalizeEmail.js";
import { safeText } from "./safeText.js";

export const loginBodySchema = z
  .object({
    email: safeText(320)
      .email()
      .transform((value) => normalizeEmail(value)),
    password: safeText(72)
      .min(8)
      .max(72)
      .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
        message: "Password must be at most 72 UTF-8 bytes",
      }),
  })
  .strict();

export type LoginBody = z.infer<typeof loginBodySchema>;
