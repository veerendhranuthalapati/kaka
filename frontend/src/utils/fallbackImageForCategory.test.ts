import { describe, expect, it } from "vitest";
import { fallbackImageForCategory } from "./fallbackImageForCategory";

describe("fallbackImageForCategory", () => {
  it("maps known categories to existing SVG assets (case and spacing insensitive)", () => {
    expect(fallbackImageForCategory("SUV")).toBe("/cars/suv-01.svg");
    expect(fallbackImageForCategory("  sedan ")).toBe("/cars/sedan-01.svg");
    expect(fallbackImageForCategory("TRUCK")).toBe("/cars/truck-01.svg");
    expect(fallbackImageForCategory("Hatchback")).toBe("/cars/hatch-01.svg");
    expect(fallbackImageForCategory("coupe")).toBe("/cars/coupe-01.svg");
    expect(fallbackImageForCategory("EV")).toBe("/cars/ev-01.svg");
    expect(fallbackImageForCategory(" electric ")).toBe("/cars/ev-01.svg");
    expect(fallbackImageForCategory("Wagon")).toBe("/cars/wagon-01.svg");
  });

  it("uses placeholder.svg for unknown categories and empty strings", () => {
    expect(fallbackImageForCategory("Convertible")).toBe("/cars/placeholder.svg");
    expect(fallbackImageForCategory("")).toBe("/cars/placeholder.svg");
    expect(fallbackImageForCategory("   ")).toBe("/cars/placeholder.svg");
  });
});
