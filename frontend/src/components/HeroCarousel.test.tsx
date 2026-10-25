import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { VehicleDataProvider } from "../data/VehicleDataProvider";
import { makeVehicle } from "../test/fixtures";
import { HeroCarousel } from "./HeroCarousel";

describe("HeroCarousel", () => {
  const vehicles = [
    makeVehicle({ id: "a", make: "Aurora", model: "One", quantity: 2 }),
    makeVehicle({ id: "b", make: "Summit", model: "Two", quantity: 1 }),
  ];

  function renderCarousel(
    props: Partial<ComponentProps<typeof HeroCarousel>> = {},
  ) {
    return render(
      <MemoryRouter>
        <VehicleDataProvider>
        <HeroCarousel
          vehicles={vehicles}
          purchasingId={null}
          onPurchase={vi.fn()}
          {...props}
        />
        </VehicleDataProvider>
      </MemoryRouter>,
    );
  }

  it("moves between slides with arrows and respects boundaries", async () => {
    const user = userEvent.setup();
    renderCarousel();

    expect(
      screen.getByRole("tab", { name: "Aurora One", selected: true }),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Next featured vehicle" }));
    expect(
      screen.getByRole("tab", { name: "Summit Two", selected: true }),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Next featured vehicle" }));
    expect(
      screen.getByRole("tab", { name: "Summit Two", selected: true }),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Previous featured vehicle" }));
    expect(
      screen.getByRole("tab", { name: "Aurora One", selected: true }),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Previous featured vehicle" }));
    expect(
      screen.getByRole("tab", { name: "Aurora One", selected: true }),
    ).toBeTruthy();
  });

  it("responds to arrow key presses", async () => {
    const user = userEvent.setup();
    renderCarousel();

    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("tab", { name: "Summit Two", selected: true }),
    ).toBeTruthy();

    await user.keyboard("{ArrowLeft}");
    expect(
      screen.getByRole("tab", { name: "Aurora One", selected: true }),
    ).toBeTruthy();
  });

  it("renders visible chevron controls with 44px targets", () => {
    renderCarousel();
    const prev = screen.getByRole("button", { name: "Previous featured vehicle" });
    const next = screen.getByRole("button", { name: "Next featured vehicle" });
    expect(prev.querySelector("svg")).toBeTruthy();
    expect(next.querySelector("svg")).toBeTruthy();
    expect(prev.className).toMatch(/min-h-11/);
    expect(next.className).toMatch(/min-w-11/);
  });

  it("keeps arrow controls outside the text zone and uses fixed scrim values", () => {
    const { container } = renderCarousel();
    const textZone = container.querySelector("[data-hero-text-zone]");
    const controlZone = container.querySelector("[data-hero-control-zone]");
    expect(textZone).toBeTruthy();
    expect(controlZone).toBeTruthy();
    expect(textZone?.contains(controlZone)).toBe(false);

    const bottom = container.querySelector('[data-hero-scrim="bottom"]');
    expect(bottom?.getAttribute("style")).toContain("rgba(8, 10, 14");
    expect(bottom?.getAttribute("style")).not.toMatch(/ink|var\(--/);
  });

  it("fires purchase and links details to the vehicle page", async () => {
    const user = userEvent.setup();
    const onPurchase = vi.fn();

    renderCarousel({ onPurchase });

    await user.click(screen.getByRole("button", { name: "Purchase" }));
    expect(onPurchase).toHaveBeenCalledWith(vehicles[0]);

    const details = screen.getByRole("link", { name: "Details" });
    expect(details.getAttribute("href")).toBe("/vehicles/a");
  });
});
