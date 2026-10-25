import { describe, expect, it } from "vitest";
import {
  formatBattery,
  formatCc,
  formatEconomy,
  formatKm,
  formatPower,
  formatRange,
  formatSeats,
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
    expect(labelFuelType("DIESEL")).toBe("Diesel");
    expect(labelFuelType("ELECTRIC")).toBe("Electric");
    expect(labelFuelType("HYBRID")).toBe("Hybrid");
    expect(labelFuelType("CNG")).toBe("CNG");
    expect(labelFuelType("LPG")).toBe("LPG");
    expect(labelFuelType("UNKNOWN_FUEL")).toBe("UNKNOWN_FUEL");
    expect(labelTransmission("MANUAL")).toBe("Manual");
    expect(labelTransmission("AUTOMATIC")).toBe("Automatic");
    expect(labelTransmission("CVT")).toBe("CVT");
    expect(labelTransmission("DCT")).toBe("DCT");
    expect(labelTransmission("OTHER")).toBe("OTHER");
    expect(labelDrivetrain("FWD")).toBe("FWD");
    expect(labelDrivetrain("RWD")).toBe("RWD");
    expect(labelDrivetrain("AWD")).toBe("AWD");
    expect(labelDrivetrain("FOUR_WD")).toBe("4WD");
    expect(labelDrivetrain(null)).toBe("-");
    expect(labelFuelType(null)).toBe("-");
  });

  it("formats seats, range, and battery", () => {
    expect(formatSeats(5)).toBe("5");
    expect(formatSeats(null)).toBe("-");
    expect(formatRange(400)).toBe("400 km");
    expect(formatBattery(75)).toBe("75 kWh");
  });
});
