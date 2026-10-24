import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { emptyVehicleFormValues } from "../utils/vehicleFormModel";
import { VehicleForm } from "./VehicleForm";

describe("VehicleForm", () => {
  it("shows client validation errors and does not submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <VehicleForm
        mode="create"
        initialValues={emptyVehicleFormValues()}
        submitting={false}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create vehicle" }));
    expect(onSubmit).not.toHaveBeenCalled();
    const alerts = screen.getAllByRole("alert");
    expect(alerts.some((node) => /check the vehicle/i.test(node.textContent ?? ""))).toBe(
      true,
    );
  });

  it("submits trimmed basics without empty optional specs", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <VehicleForm
        mode="create"
        initialValues={emptyVehicleFormValues()}
        submitting={false}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Make"), "Toyota");
    await user.type(screen.getByLabelText("Model"), "Camry");
    await user.type(screen.getByLabelText("Category"), "Sedan");
    await user.type(screen.getByLabelText("Price"), "20000");
    await user.type(screen.getByLabelText("Quantity"), "2");
    await user.click(screen.getByRole("button", { name: "Create vehicle" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0]?.[0];
    expect(payload).toMatchObject({
      make: "Toyota",
      quantity: 2,
    });
    expect(payload && "year" in payload).toBe(false);
  });

  it("renders server field errors under inputs", () => {
    render(
      <VehicleForm
        mode="edit"
        initialValues={emptyVehicleFormValues()}
        submitting={false}
        serverFieldErrors={{ vin: "Invalid VIN format" }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText("Invalid VIN format")).toBeTruthy();
  });
});
