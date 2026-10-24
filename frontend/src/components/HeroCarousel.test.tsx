import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
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
        <HeroCarousel
          vehicles={vehicles}
          purchasingId={null}
          onPurchase={vi.fn()}
          {...props}
        />
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
