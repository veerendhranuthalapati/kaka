import { describe, expect, it } from "vitest";
import {
  formatCc,
  formatEconomy,
  formatKm,
  formatPower,
  formatTorque,
  formatYear,
  labelDrivetrain,
  labelFuelType,
  labelTransmission,
} from "./vehicleSpecsFormat";

describe("vehicleSpecsFormat", () => {
  it("formats distance with New for zero", () => {
    expect(formatKm(0)).toBe("New");
    expect(formatKm(12400)).toBe("12,400 km");
    expect(formatKm(null)).toBe("-");
  });

  it("formats engine, power, torque, economy, and year", () => {
    expect(formatCc(1998)).toBe("1,998 cc");
    expect(formatCc(null)).toBe("-");
    expect(formatPower(187)).toBe("187 bhp");
    expect(formatTorque(320)).toBe("320 Nm");
    expect(formatEconomy(18.4)).toBe("18.4 km/l");
    expect(formatYear(2022)).toBe("2022");
    expect(formatYear(null)).toBe("-");
  });

  it("labels enum values", () => {
    expect(labelFuelType("PETROL")).toBe("Petrol");
    expect(labelFuelType("PLUG_IN_HYBRID")).toBe("Plug-in hybrid");
    expect(labelTransmission("DCT")).toBe("DCT");
    expect(labelDrivetrain("FOUR_WD")).toBe("4WD");
    expect(labelFuelType(null)).toBe("-");
  });
});
