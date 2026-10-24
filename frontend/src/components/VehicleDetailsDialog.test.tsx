import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeVehicle } from "../test/fixtures";
import { VehicleDetailsDialog } from "./VehicleDetailsDialog";

describe("VehicleDetailsDialog", () => {
  it("closes when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <VehicleDetailsDialog
        vehicle={makeVehicle({ make: "Aurora", model: "LX" })}
        open={true}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
