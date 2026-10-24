import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { pickCategoryPhoto } from "../utils/carPhotos";
import { VehicleImage } from "./VehicleImage";

describe("VehicleImage", () => {
  it("uses lazy loading, no-referrer, and shows the primary URL when provided", () => {
    render(
      <VehicleImage
        src="/cars/photo.jpg"
        category="Sedan"
        vehicleId="v1"
        alt="Aurora LX"
      />,
    );

    const image = screen.getByRole("img", { name: "Aurora LX" });
    expect(image.getAttribute("loading")).toBe("lazy");
    expect(image.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(image.getAttribute("src")).toContain("/cars/photo.jpg");
    expect(image.className).toContain("object-cover");
  });

  it("supports eager loading for hero slides", () => {
    render(
      <VehicleImage
        src="/cars/sedan-01.svg"
        category="Sedan"
        vehicleId="v1"
        alt="Hero"
        loading="eager"
      />,
    );
    expect(screen.getByRole("img", { name: "Hero" }).getAttribute("loading")).toBe(
      "eager",
    );
  });

  it("uses a manifest category photo when imageUrl is missing", () => {
    const expected = pickCategoryPhoto("SUV", "vehicle-99");
    render(<VehicleImage category="SUV" vehicleId="vehicle-99" alt="No photo" />);
    const image = screen.getByRole("img", { name: "No photo" });
    expect(image.getAttribute("src")).toBe(expected);
    expect(image.className).toContain("object-cover");
  });

  it("shows a cached-complete image without waiting for onLoad", async () => {
    const completeDesc = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "complete",
    );
    const widthDesc = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "naturalWidth",
    );
    Object.defineProperty(HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", {
      configurable: true,
      get: () => 1200,
    });

    try {
      render(
        <VehicleImage
          src="/cars/toyota-camry.jpg"
          category="Sedan"
          vehicleId="v-cached"
          alt="Cached"
        />,
      );
      const image = screen.getByRole("img", { name: "Cached" });
      await waitFor(() => {
        expect(image.className).toContain("vehicle-img-ready");
        expect(image.className).not.toContain("vehicle-img-loading");
      });
    } finally {
      if (completeDesc) {
        Object.defineProperty(HTMLImageElement.prototype, "complete", completeDesc);
      }
      if (widthDesc) {
        Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", widthDesc);
      }
    }
  });

  it("falls back through category photo, svg, and placeholder", () => {
    render(
      <VehicleImage
        src="/cars/missing.jpg"
        category="Sedan"
        vehicleId="vehicle-1"
        alt="Aurora LX"
      />,
    );
    const image = screen.getByRole("img", { name: "Aurora LX" });
    fireEvent.error(image);
    expect(image.getAttribute("src")).toBe(pickCategoryPhoto("Sedan", "vehicle-1"));

    fireEvent.error(image);
    expect(image.getAttribute("src")).toContain("/cars/sedan-01.svg");

    fireEvent.error(image);
    expect(image.getAttribute("src")).toContain("/cars/placeholder.svg");
  });
});
