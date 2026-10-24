import { describe, expect, it } from "vitest";
import { vehicleImageUrlSchema } from "../../src/validators/vehicle.imageUrl.schema.js";

describe("vehicleImageUrlSchema", () => {
  it("accepts https URLs and site-relative paths", () => {
    expect(vehicleImageUrlSchema.safeParse("https://cdn.example.com/a.jpg").success).toBe(
      true,
    );
    expect(vehicleImageUrlSchema.safeParse("/cars/sedan-01.svg").success).toBe(true);
  });

  it("rejects http, protocol-relative, and dangerous schemes", () => {
    for (const value of [
      "http://example.com/x.jpg",
      "//cdn.example.com/x.jpg",
      "javascript:alert(1)",
      "data:image/png;base64,abc",
      "file:///etc/passwd",
    ]) {
      expect(vehicleImageUrlSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rejects whitespace, control characters, and strings over 2048 chars", () => {
    expect(vehicleImageUrlSchema.safeParse("/cars/a b.svg").success).toBe(false);
    expect(vehicleImageUrlSchema.safeParse("/cars/a\nb.svg").success).toBe(false);
    expect(vehicleImageUrlSchema.safeParse(`/${"a".repeat(2048)}`).success).toBe(false);
  });
});
