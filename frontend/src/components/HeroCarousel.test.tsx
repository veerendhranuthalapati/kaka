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

    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("Aurora One");

    await user.click(screen.getByRole("button", { name: "Next featured vehicle" }));
    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("Summit Two");

    await user.click(screen.getByRole("button", { name: "Next featured vehicle" }));
    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("Summit Two");

    await user.click(screen.getByRole("button", { name: "Previous featured vehicle" }));
    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("Aurora One");

    await user.click(screen.getByRole("button", { name: "Previous featured vehicle" }));
    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("Aurora One");
  });
});
