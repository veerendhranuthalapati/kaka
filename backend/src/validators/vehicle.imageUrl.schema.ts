import { z } from "zod";

const hasControlOrWhitespace = (value: string): boolean =>
  /[\s\x00-\x1F\x7F]/.test(value);

const isAllowedImageUrl = (value: string): boolean => {
  const lower = value.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("http:") ||
    value.startsWith("//")
  ) {
    return false;
  }
  if (lower.startsWith("https://")) {
    return true;
  }
  return value.startsWith("/") && !value.startsWith("//");
};

export const vehicleImageUrlSchema = z
  .string()
  .max(2048, "imageUrl must be at most 2048 characters")
  .refine((value) => !hasControlOrWhitespace(value), {
    message: "imageUrl must not contain whitespace or control characters",
  })
  .refine(isAllowedImageUrl, {
    message:
      "imageUrl must be an https:// URL or a site-relative path starting with /",
  });

export const optionalNullableVehicleImageUrlSchema = z
  .union([vehicleImageUrlSchema, z.null()])
  .optional();
