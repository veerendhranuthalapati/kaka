import { describe, expect, it } from "vitest";
import { makeVehicle } from "../test/fixtures";
import {
  buildVehicleSubmitPayload,
  currentModelYearMax,
  emptyVehicleFormValues,
  vehicleToFormValues,
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

  it("maps vehicles to form values including optional specs", () => {
    const form = vehicleToFormValues(
      makeVehicle({
        year: 2024,
        fuelType: "ELECTRIC",
        rangeKm: 400,
        batteryKwh: 75,
        features: ["Heated seats"],
      }),
    );
    expect(form.year).toBe("2024");
    expect(form.fuelType).toBe("ELECTRIC");
    expect(form.rangeKm).toBe("400");
    expect(form.features).toEqual(["Heated seats"]);
  });

  it("validates electrified range and battery bounds", () => {
    const base = {
      ...emptyVehicleFormValues(),
      make: "Tesla",
      model: "3",
      category: "Sedan",
      price: "40000",
      quantity: "1",
      fuelType: "ELECTRIC",
      rangeKm: "10",
      batteryKwh: "1",
    };
    const errors = validateVehicleFormValues(base, { requireQuantity: true });
    expect(errors?.rangeKm).toBeTruthy();
    expect(errors?.batteryKwh).toBeTruthy();
  });

  it("rejects invalid fuel, transmission, and drivetrain selections", () => {
    const values = {
      ...emptyVehicleFormValues(),
      make: "A",
      model: "B",
      category: "C",
      price: "1",
      quantity: "1",
      fuelType: "WATER",
      transmission: "MAGIC",
      drivetrain: "HOVER",
    };
    const errors = validateVehicleFormValues(values, { requireQuantity: true });
    expect(errors?.fuelType).toBeTruthy();
    expect(errors?.transmission).toBeTruthy();
    expect(errors?.drivetrain).toBeTruthy();
  });

  it("rejects angle brackets and duplicate features", () => {
    const values = {
      ...emptyVehicleFormValues(),
      make: "Ford",
      model: "F",
      category: "Truck",
      price: "1000",
      quantity: "1",
      description: "<script>",
      features: ["Sunroof", "sunroof"],
    };
    const errors = validateVehicleFormValues(values, { requireQuantity: true });
    expect(errors?.description).toBeTruthy();
    expect(errors?.features).toBeTruthy();
  });

  it("builds update payload without quantity and dedupes features", () => {
    const payload = buildVehicleSubmitPayload(
      {
        ...emptyVehicleFormValues(),
        make: "Honda",
        model: "Civic",
        category: "Sedan",
        price: "22000",
        quantity: "",
        features: ["ABS", "Cruise control"],
        description: "Clean title",
      },
      { requireQuantity: false },
    );
    expect(payload).toMatchObject({
      make: "Honda",
      description: "Clean title",
      features: ["ABS", "Cruise control"],
    });
    expect("quantity" in payload).toBe(false);
  });

  it("throws when build is called with invalid values", () => {
    expect(() =>
      buildVehicleSubmitPayload(emptyVehicleFormValues(), {
        requireQuantity: true,
      }),
    ).toThrow(/Invalid form/);
  });

  it("exposes current model year ceiling", () => {
    expect(currentModelYearMax()).toBe(new Date().getFullYear() + 1);
  });

  it("validates owners, seats, and feature list limits", () => {
    const base = {
      ...emptyVehicleFormValues(),
      make: "Ford",
      model: "F",
      category: "Truck",
      price: "1000",
      quantity: "1",
    };
    const errors = validateVehicleFormValues(
      {
        ...base,
        owners: "20",
        seats: "12",
        features: Array.from({ length: 13 }, (_, i) => `Feature ${i}`),
      },
      { requireQuantity: true },
    );
    expect(errors?.owners).toBeTruthy();
    expect(errors?.seats).toBeTruthy();
    expect(errors?.features).toMatch(/12 features/);
  });

  it("dedupes features case-insensitively in submit payload", () => {
    const payload = buildVehicleSubmitPayload(
      {
        ...emptyVehicleFormValues(),
        make: "Kia",
        model: "EV6",
        category: "SUV",
        price: "45000",
        quantity: "1",
        fuelType: "ELECTRIC",
        rangeKm: "500",
        batteryKwh: "77",
        features: ["Heated seats", " HUD ", "Sunroof"],
      },
      { requireQuantity: true },
    );
    expect(payload.features).toEqual(["Heated seats", "HUD", "Sunroof"]);
    expect(payload.rangeKm).toBe(500);
    expect(payload.batteryKwh).toBe(77);
  });
});
