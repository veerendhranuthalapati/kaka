import { describe, expect, it } from "vitest";
import { cardSpecChips } from "./cardSpecChips";
import type { Vehicle } from "../types";

const base: Vehicle = {
  id: "1",
  make: "Toyota",
  model: "Camry",
  category: "Sedan",
  price: 1,
  quantity: 1,
  imageUrl: null,
  createdAt: "",
  updatedAt: "",
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
  seats: null,
  rangeKm: null,
  batteryKwh: null,
  description: null,
  features: [],
};

describe("cardSpecChips", () => {
  it("returns up to four chips in priority order", () => {
    const chips = cardSpecChips({
      ...base,
      year: 2022,
      odometerKm: 12400,
      fuelType: "PETROL",
      transmission: "AUTOMATIC",
      drivetrain: "AWD",
    });
    expect(chips).toEqual(["2022", "12,400 km", "Petrol", "Automatic"]);
  });

  it('uses "New" for zero odometer and omits null fields', () => {
    expect(
      cardSpecChips({ ...base, year: 2024, odometerKm: 0, fuelType: "ELECTRIC" }),
    ).toEqual(["2024", "New", "Electric"]);
  });

  it("adds drivetrain when fewer than four chips exist", () => {
    expect(
      cardSpecChips({
        ...base,
        year: 2020,
        drivetrain: "FOUR_WD",
      }),
    ).toEqual(["2020", "4WD"]);
  });
});
