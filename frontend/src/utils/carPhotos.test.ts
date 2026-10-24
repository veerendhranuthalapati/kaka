import { describe, expect, it } from "vitest";
import {
  normalizeCategoryKey,
  pickCategoryPhoto,
  resolveVehicleImageChain,
  stableHash,
} from "./carPhotos";

describe("pickCategoryPhoto", () => {
  it("returns null for unknown categories when manifest has no matches", () => {
    expect(pickCategoryPhoto("Unknown", "vehicle-1")).toBeNull();
  });

  it("is deterministic for the same vehicle id", () => {
    const first = pickCategoryPhoto("Sedan", "abc-123");
    const second = pickCategoryPhoto("Sedan", "abc-123");
    expect(first).toBe(second);
  });

  it("spreads selections across ids when multiple category photos exist", () => {
    const urls = new Set(
      ["id-1", "id-2", "id-3", "id-4", "id-5"].map((id) =>
        pickCategoryPhoto("SUV", id),
      ),
    );
    expect(urls.size).toBeGreaterThan(1);
  });

  it("matches categories case-insensitively with trimmed spaces", () => {
    expect(pickCategoryPhoto("  sedan ", "vehicle-1")).toBe(
      pickCategoryPhoto("Sedan", "vehicle-1"),
    );
    expect(normalizeCategoryKey("  Sedan ")).toBe("sedan");
  });
});

describe("resolveVehicleImageChain", () => {
  it("uses primary url when present", () => {
    const result = resolveVehicleImageChain({
      imageUrl: "/cars/toyota-camry.jpg",
      category: "Sedan",
      vehicleId: "v1",
      primaryFailed: false,
      categoryPhotoFailed: false,
      categorySvgFailed: false,
    });
    expect(result.level).toBe("primary");
    expect(result.url).toBe("/cars/toyota-camry.jpg");
  });

  it("falls back to category photo then svg then placeholder", () => {
    const categoryPhoto = resolveVehicleImageChain({
      imageUrl: null,
      category: "SUV",
      vehicleId: "v2",
      primaryFailed: false,
      categoryPhotoFailed: false,
      categorySvgFailed: false,
    });
    expect(categoryPhoto.level).toBe("category-photo");

    const svg = resolveVehicleImageChain({
      imageUrl: null,
      category: "SUV",
      vehicleId: "v2",
      primaryFailed: false,
      categoryPhotoFailed: true,
      categorySvgFailed: false,
    });
    expect(svg.level).toBe("category-svg");
    expect(svg.url).toContain(".svg");

    const placeholder = resolveVehicleImageChain({
      imageUrl: null,
      category: "SUV",
      vehicleId: "v2",
      primaryFailed: false,
      categoryPhotoFailed: true,
      categorySvgFailed: true,
    });
    expect(placeholder.level).toBe("placeholder");
  });

  it("falls back when primary fails", () => {
    const result = resolveVehicleImageChain({
      imageUrl: "/cars/missing.jpg",
      category: "Truck",
      vehicleId: "v3",
      primaryFailed: true,
      categoryPhotoFailed: false,
      categorySvgFailed: false,
    });
    expect(result.level).toBe("category-photo");
  });
});

describe("stableHash", () => {
  it("returns stable numeric hashes", () => {
    expect(stableHash("abc")).toBe(stableHash("abc"));
    expect(stableHash("abc")).not.toBe(stableHash("def"));
  });
});
