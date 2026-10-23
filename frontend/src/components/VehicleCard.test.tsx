import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { makeVehicle } from "../test/fixtures";
import { VehicleCard } from "./VehicleCard";

function renderCard(
  props: Partial<ComponentProps<typeof VehicleCard>> = {},
) {
  return render(
    <MemoryRouter>
      <VehicleCard vehicle={makeVehicle()} {...props} />
    </MemoryRouter>,
  );
}

describe("VehicleCard", () => {
  it("disables purchasing and labels the button when stock is zero", () => {
    renderCard({ vehicle: makeVehicle({ quantity: 0 }) });

    const button = screen.getByRole("button", { name: "Out of stock" });

    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("shows a busy purchase state and blocks repeat clicks", () => {
    renderCard({ purchasing: true });

    const button = screen.getByRole("button", { name: "Purchasing..." });

    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("calls onPurchase once for an available vehicle", async () => {
    const user = userEvent.setup();
    const onPurchase = vi.fn();
    const vehicle = makeVehicle();
    renderCard({ vehicle, onPurchase });

    await user.click(screen.getByRole("button", { name: "Purchase" }));

    expect(onPurchase).toHaveBeenCalledOnce();
    expect(onPurchase).toHaveBeenCalledWith(vehicle);
  });

  it("hides admin controls from non-admins", () => {
    renderCard({ canManage: false });

    expect(
      screen.queryByRole("link", { name: "Edit Toyota Corolla" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Restock Toyota Corolla" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Delete Toyota Corolla" }),
    ).toBeNull();
  });

  it("shows admin controls to admins", () => {
    renderCard({
      canManage: true,
      onRestock: vi.fn(),
      onDelete: vi.fn(),
    });

    expect(
      screen.getByRole("link", { name: "Edit Toyota Corolla" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Restock Toyota Corolla" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Delete Toyota Corolla" }),
    ).toBeTruthy();
  });
});
