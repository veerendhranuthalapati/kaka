import { describe, expect, it } from "vitest";
import {
  buildVehicleSubmitPayload,
  emptyVehicleFormValues,
  validateVehicleFormValues,
} from "./vehicleFormModel";

describe("vehicleFormModel", () => {
  it("requires basics and quantity on create", () => {
    const errors = validateVehicleFormValues(emptyVehicleFormValues(), {
      requireQuantity: true,
    });
    expect(errors?.make).toBeTruthy();
    expect(errors?.quantity).toBeTruthy();
  });

  it("rejects invalid spec ranges and VIN", () => {
    const values = {
      ...emptyVehicleFormValues(),
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: "1000",
      quantity: "1",
      year: "1900",
      vin: "BAD",
      color: "Red1",
    };
    const errors = validateVehicleFormValues(values, { requireQuantity: true });
    expect(errors?.year).toBeTruthy();
    expect(errors?.vin).toBeTruthy();
    expect(errors?.color).toBeTruthy();
  });

  it("omits empty optional spec fields from the payload", () => {
    const payload = buildVehicleSubmitPayload(
      {
        ...emptyVehicleFormValues(),
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: "25000",
        quantity: "2",
        year: "2022",
        fuelType: "PETROL",
      },
      { requireQuantity: true },
    );
    expect(payload).toMatchObject({
      make: "Toyota",
      year: 2022,
      fuelType: "PETROL",
    });
    expect("odometerKm" in payload).toBe(false);
    expect("engineCc" in payload).toBe(false);
  });
});
