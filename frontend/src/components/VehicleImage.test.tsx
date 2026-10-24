import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VehicleImage } from "./VehicleImage";

describe("VehicleImage", () => {
  it("uses lazy loading, no-referrer, and shows the primary URL when provided", () => {
    render(
      <VehicleImage
        src="/cars/photo.jpg"
        category="Sedan"
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
      <VehicleImage src="/cars/sedan-01.svg" category="Sedan" alt="Hero" loading="eager" />,
    );
    expect(screen.getByRole("img", { name: "Hero" }).getAttribute("loading")).toBe(
      "eager",
    );
  });

  it("shows the category illustration when imageUrl is missing", () => {
    render(<VehicleImage category="SUV" alt="No photo" />);
    expect(screen.getByRole("img", { name: "No photo" }).getAttribute("src")).toContain(
      "/cars/suv-01.svg",
    );
    expect(screen.getByRole("img", { name: "No photo" }).className).toContain(
      "object-contain",
    );
  });

  it("falls back to the category illustration when the primary image fails", () => {
    render(
      <VehicleImage src="/cars/missing.jpg" category="Sedan" alt="Aurora LX" />,
    );
    const image = screen.getByRole("img", { name: "Aurora LX" });
    fireEvent.error(image);
    expect(image.getAttribute("src")).toContain("/cars/sedan-01.svg");
  });

  it("falls back to placeholder.svg when the category illustration also fails", () => {
    render(<VehicleImage category="Sedan" alt="Broken category art" />);
    const image = screen.getByRole("img", { name: "Broken category art" });
    fireEvent.error(image);
    expect(image.getAttribute("src")).toContain("/cars/placeholder.svg");
  });
});
