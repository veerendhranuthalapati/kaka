import { z } from "zod";

const CONTROL_OR_NUL = /[\u0000-\u001F\u007F]/;

export function hasUnsafeText(value: string): boolean {
  return CONTROL_OR_NUL.test(value);
}

export const safeText = (maxLength: number) =>
  z
    .string()
    .max(maxLength)
    .refine((value) => !hasUnsafeText(value), {
      message: "Must not contain control characters or NUL bytes",
    });
