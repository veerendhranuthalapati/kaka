import { z } from "zod";
import { normalizeEmail } from "./normalizeEmail.js";
import { validatePasswordPolicy } from "../security/passwordPolicy.js";
import { safeText } from "./safeText.js";

export const registerBodySchema = z
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
  .strict()
  .superRefine((body, ctx) => {
    const message = validatePasswordPolicy(body.password, { email: body.email });
    if (message) {
      ctx.addIssue({ code: "custom", path: ["password"], message });
    }
  });

export type RegisterBody = z.infer<typeof registerBodySchema>;
