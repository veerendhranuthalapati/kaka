import { describe, expect, it } from "vitest";
import { makeVehicle } from "../test/fixtures";
import { vehicleSpecificationRows } from "./vehicleSpecRows";

describe("vehicleSpecificationRows", () => {
  it("omits rows with missing values", () => {
    const rows = vehicleSpecificationRows(
      makeVehicle({
        year: 2022,
        odometerKm: 5000,
        engineCc: null,
        fuelType: "PETROL",
        color: null,
        vin: null,
      }),
    );
    const labels = rows.map((row) => row.label);
    expect(labels).toContain("Year");
    expect(labels).toContain("Fuel type");
    expect(labels).not.toContain("Engine (cc)");
    expect(labels).not.toContain("Colour");
    expect(labels).not.toContain("VIN");
  });

  it("returns an empty list when nothing is populated", () => {
    expect(
      vehicleSpecificationRows(
        makeVehicle({
          year: null,
          odometerKm: null,
          engineCc: null,
          powerBhp: null,
          torqueNm: null,
          fuelType: null,
          transmission: null,
          drivetrain: null,
          fuelEconomyKmpl: null,
          color: null,
          owners: null,
          vin: null,
        }),
      ),
    ).toHaveLength(0);
  });
});
