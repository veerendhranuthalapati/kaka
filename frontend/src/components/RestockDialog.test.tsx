import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeVehicle } from "../test/fixtures";
import { RestockDialog } from "./RestockDialog";

describe("RestockDialog", () => {
  const vehicle = makeVehicle({ make: "Aurora", model: "LX", quantity: 2 });

  it("accepts integer amounts from 1 to 10000", async () => {
    const user = userEvent.setup();
    const onRestock = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <RestockDialog vehicle={vehicle} onRestock={onRestock} onClose={onClose} />,
    );

    await user.clear(screen.getByLabelText("Restock amount"));
    await user.type(screen.getByLabelText("Restock amount"), "250");
    await user.click(screen.getByRole("button", { name: "Restock" }));

    await waitFor(() => {
      expect(onRestock).toHaveBeenCalledWith(vehicle, 250);
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("rejects 0, negative, decimal and 10001 amounts", async () => {
    const user = userEvent.setup();
    const onRestock = vi.fn();

    render(
      <RestockDialog vehicle={vehicle} onRestock={onRestock} onClose={vi.fn()} />,
    );

    for (const value of ["0", "-1", "1.5", "10001"]) {
      await user.clear(screen.getByLabelText("Restock amount"));
      await user.type(screen.getByLabelText("Restock amount"), value);
      await user.click(screen.getByRole("button", { name: "Restock" }));
      expect(screen.getByRole("alert").textContent).toContain(
        "Amount must be a whole number between 1 and 10,000.",
      );
      expect(onRestock).not.toHaveBeenCalled();
    }
  });

  it("shows an error when restock fails", async () => {
    const user = userEvent.setup();
    const onRestock = vi.fn().mockRejectedValue(new Error("network"));

    render(
      <RestockDialog vehicle={vehicle} onRestock={onRestock} onClose={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "Restock" }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("Failed to restock");
    });
  });

  it("closes when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <RestockDialog vehicle={vehicle} onRestock={vi.fn()} onClose={onClose} />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
