import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VehicleImage } from "./VehicleImage";

describe("VehicleImage", () => {
  it("uses lazy loading, no-referrer, and falls back to the placeholder on error", () => {
    render(<VehicleImage src="/cars/sedan-01.svg" alt="Aurora LX" />);

    const image = screen.getByRole("img", { name: "Aurora LX" });
    expect(image.getAttribute("loading")).toBe("lazy");
    expect(image.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(image.getAttribute("src")).toContain("/cars/sedan-01.svg");

    fireEvent.error(image);
    expect(image.getAttribute("src")).toContain("/cars/placeholder.svg");
  });

  it("renders the placeholder when src is missing", () => {
    render(<VehicleImage alt="No photo" />);
    expect(screen.getByRole("img", { name: "No photo" }).getAttribute("src")).toContain(
      "/cars/placeholder.svg",
    );
  });
});
