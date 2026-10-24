import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeVehicle } from "../test/fixtures";
import { HeroCarousel } from "./HeroCarousel";

describe("HeroCarousel", () => {
  const vehicles = [
    makeVehicle({ id: "a", make: "Aurora", model: "One", quantity: 2 }),
    makeVehicle({ id: "b", make: "Summit", model: "Two", quantity: 1 }),
  ];

  it("moves between slides with arrows and respects boundaries", async () => {
    const user = userEvent.setup();
    render(
      <HeroCarousel
        vehicles={vehicles}
        purchasingId={null}
        onPurchase={vi.fn()}
        onDetails={vi.fn()}
      />,
    );

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
    render(
      <HeroCarousel
        vehicles={vehicles}
        purchasingId={null}
        onPurchase={vi.fn()}
        onDetails={vi.fn()}
      />,
    );

    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("tab", { name: "Summit Two", selected: true }),
    ).toBeTruthy();

    await user.keyboard("{ArrowLeft}");
    expect(
      screen.getByRole("tab", { name: "Aurora One", selected: true }),
    ).toBeTruthy();
  });

  it("fires purchase and details callbacks from the hero actions", async () => {
    const user = userEvent.setup();
    const onPurchase = vi.fn();
    const onDetails = vi.fn();

    render(
      <HeroCarousel
        vehicles={vehicles}
        purchasingId={null}
        onPurchase={onPurchase}
        onDetails={onDetails}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Purchase" }));
    expect(onPurchase).toHaveBeenCalledWith(vehicles[0]);

    await user.click(screen.getByRole("button", { name: "Details" }));
    expect(onDetails).toHaveBeenCalledWith(vehicles[0]);
  });
});
