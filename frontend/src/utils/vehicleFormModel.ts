import type {
  DrivetrainType,
  FuelType,
  TransmissionType,
  Vehicle,
  VehicleInput,
  VehicleUpdateInput,
} from "../types";
import { validateImageUrl } from "./validation";

export type VehicleFormValues = {
  make: string;
  model: string;
  category: string;
  price: string;
  quantity: string;
  imageUrl: string;
  year: string;
  odometerKm: string;
  engineCc: string;
  powerBhp: string;
  torqueNm: string;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  fuelEconomyKmpl: string;
  color: string;
  owners: string;
  vin: string;
  seats: string;
  rangeKm: string;
  batteryKwh: string;
  description: string;
  features: string[];
};

const FUEL_TYPES: FuelType[] = [
  "PETROL",
  "DIESEL",
  "ELECTRIC",
  "HYBRID",
  "PLUG_IN_HYBRID",
  "CNG",
  "LPG",
];

const TRANSMISSION_TYPES: TransmissionType[] = ["MANUAL", "AUTOMATIC", "CVT", "DCT"];

const DRIVETRAIN_TYPES: DrivetrainType[] = ["FWD", "RWD", "AWD", "FOUR_WD"];

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;
const COLOR_PATTERN = /^[A-Za-z][A-Za-z\s-]*$/;

export function currentModelYearMax(): number {
  return new Date().getFullYear() + 1;
}

export function vehicleToFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    make: vehicle.make,
    model: vehicle.model,
    category: vehicle.category,
    price: String(vehicle.price),
    quantity: String(vehicle.quantity),
    imageUrl: vehicle.imageUrl ?? "",
    year: vehicle.year == null ? "" : String(vehicle.year),
    odometerKm: vehicle.odometerKm == null ? "" : String(vehicle.odometerKm),
    engineCc: vehicle.engineCc == null ? "" : String(vehicle.engineCc),
    powerBhp: vehicle.powerBhp == null ? "" : String(vehicle.powerBhp),
    torqueNm: vehicle.torqueNm == null ? "" : String(vehicle.torqueNm),
    fuelType: vehicle.fuelType ?? "",
    transmission: vehicle.transmission ?? "",
    drivetrain: vehicle.drivetrain ?? "",
    fuelEconomyKmpl:
      vehicle.fuelEconomyKmpl == null ? "" : String(vehicle.fuelEconomyKmpl),
    color: vehicle.color ?? "",
    owners: vehicle.owners == null ? "" : String(vehicle.owners),
    vin: vehicle.vin ?? "",
    seats: vehicle.seats == null ? "" : String(vehicle.seats),
    rangeKm: vehicle.rangeKm == null ? "" : String(vehicle.rangeKm),
    batteryKwh: vehicle.batteryKwh == null ? "" : String(vehicle.batteryKwh),
    description: vehicle.description ?? "",
    features: [...vehicle.features],
  };
}

export function vehicleToDuplicateFormValues(vehicle: Vehicle): VehicleFormValues {
  const base = vehicleToFormValues(vehicle);
  return {
    ...base,
    vin: "",
    imageUrl: "",
    quantity: "1",
  };
}

export function isVehicleFormDirty(
  initial: VehicleFormValues,
  current: VehicleFormValues,
): boolean {
  return JSON.stringify(initial) !== JSON.stringify(current);
}

export function emptyVehicleFormValues(): VehicleFormValues {
  return {
    make: "",
    model: "",
    category: "",
    price: "",
    quantity: "",
    imageUrl: "",
    year: "",
    odometerKm: "",
    engineCc: "",
    powerBhp: "",
    torqueNm: "",
    fuelType: "",
    transmission: "",
    drivetrain: "",
    fuelEconomyKmpl: "",
    color: "",
    owners: "",
    vin: "",
    seats: "",
    rangeKm: "",
    batteryKwh: "",
    description: "",
    features: [],
  };
}

function isElectrifiedFuel(fuelType: string): boolean {
  return (
    fuelType === "ELECTRIC" ||
    fuelType === "HYBRID" ||
    fuelType === "PLUG_IN_HYBRID"
  );
}

function validatePlainTextNoAngles(
  value: string,
  field: string,
  errors: Record<string, string>,
  maxLength: number,
): void {
  const trimmed = value.trim();
  if (!trimmed) return;
  if (trimmed.includes("<") || trimmed.includes(">")) {
    errors[field] = "Plain text only; angle brackets are not allowed.";
    return;
  }
  if (trimmed.length > maxLength) {
    errors[field] = `Maximum ${maxLength} characters.`;
  }
}

function validateFeaturesList(
  features: string[],
  errors: Record<string, string>,
): void {
  if (features.length > 12) {
    errors.features = "At most 12 features.";
    return;
  }
  const seen = new Set<string>();
  for (const raw of features) {
    const item = raw.trim();
    if (item.includes("<") || item.includes(">")) {
      errors.features = "Plain text only; angle brackets are not allowed.";
      return;
    }
    if (item.length < 2 || item.length > 40) {
      errors.features = "Each feature must be 2–40 characters.";
      return;
    }
    const key = item.toLowerCase();
    if (seen.has(key)) {
      errors.features = "Duplicate features are not allowed.";
      return;
    }
    seen.add(key);
  }
}

function parseOptionalInt(
  raw: string,
  field: string,
  errors: Record<string, string>,
  range: { min: number; max: number },
): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < range.min || value > range.max) {
    errors[field] = `Enter a whole number between ${range.min} and ${range.max}.`;
    return undefined;
  }
  return value;
}

function parseOptionalFloat(
  raw: string,
  field: string,
  errors: Record<string, string>,
  range: { min: number; max: number },
): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < range.min || value > range.max) {
    errors[field] = `Enter a number between ${range.min} and ${range.max}.`;
    return undefined;
  }
  return value;
}

export function validateVehicleFormValues(
  values: VehicleFormValues,
  options: { requireQuantity: boolean },
): Record<string, string> | null {
  const errors: Record<string, string> = {};

  if (!values.make.trim() || values.make.length > 100) {
    errors.make = "Make is required (max 100 characters).";
  }
  if (!values.model.trim() || values.model.length > 100) {
    errors.model = "Model is required (max 100 characters).";
  }
  if (!values.category.trim() || values.category.length > 100) {
    errors.category = "Category is required (max 100 characters).";
  }

  const price = Number(values.price);
  if (!Number.isFinite(price) || price < 0) {
    errors.price = "Enter a valid price.";
  }

  if (options.requireQuantity) {
    const quantityRaw = values.quantity.trim();
    if (!quantityRaw) {
      errors.quantity = "Quantity is required.";
    } else {
      const quantity = Number(quantityRaw);
      if (!Number.isInteger(quantity) || quantity < 0) {
        errors.quantity = "Quantity must be a non-negative integer.";
      }
    }
  }

  const imageUrlError = validateImageUrl(values.imageUrl);
  if (imageUrlError) {
    errors.imageUrl = imageUrlError;
  }

  parseOptionalInt(values.year, "year", errors, {
    min: 1980,
    max: currentModelYearMax(),
  });
  parseOptionalInt(values.odometerKm, "odometerKm", errors, {
    min: 0,
    max: 2_000_000,
  });
  parseOptionalInt(values.engineCc, "engineCc", errors, { min: 50, max: 10_000 });
  parseOptionalInt(values.powerBhp, "powerBhp", errors, { min: 1, max: 2_000 });
  parseOptionalInt(values.torqueNm, "torqueNm", errors, { min: 1, max: 3_000 });
  parseOptionalFloat(values.fuelEconomyKmpl, "fuelEconomyKmpl", errors, {
    min: 0.1,
    max: 100,
  });

  if (values.fuelType.trim() && !FUEL_TYPES.includes(values.fuelType as FuelType)) {
    errors.fuelType = "Select a valid fuel type.";
  }
  if (
    values.transmission.trim() &&
    !TRANSMISSION_TYPES.includes(values.transmission as TransmissionType)
  ) {
    errors.transmission = "Select a valid transmission.";
  }
  if (
    values.drivetrain.trim() &&
    !DRIVETRAIN_TYPES.includes(values.drivetrain as DrivetrainType)
  ) {
    errors.drivetrain = "Select a valid drivetrain.";
  }

  if (values.color.trim()) {
    if (values.color.length > 32 || !COLOR_PATTERN.test(values.color)) {
      errors.color = "Use letters, spaces, and hyphens only (max 32).";
    }
  }

  if (values.owners.trim()) {
    parseOptionalInt(values.owners, "owners", errors, { min: 1, max: 10 });
  }

  if (values.vin.trim()) {
    if (!VIN_PATTERN.test(values.vin.trim())) {
      errors.vin = "VIN must be 17 characters (no I, O, or Q).";
    }
  }

  parseOptionalInt(values.seats, "seats", errors, { min: 1, max: 9 });
  if (isElectrifiedFuel(values.fuelType.trim())) {
    parseOptionalInt(values.rangeKm, "rangeKm", errors, { min: 20, max: 1500 });
    parseOptionalFloat(values.batteryKwh, "batteryKwh", errors, {
      min: 5,
      max: 250,
    });
  }
  validatePlainTextNoAngles(values.description, "description", errors, 600);
  validateFeaturesList(values.features, errors);

  return Object.keys(errors).length > 0 ? errors : null;
}

export function buildVehicleSubmitPayload(
  values: VehicleFormValues,
  options: { requireQuantity: boolean },
): VehicleInput | VehicleUpdateInput {
  const errors = validateVehicleFormValues(values, options);
  if (errors) {
    throw new Error("Invalid form");
  }

  const payload: VehicleUpdateInput = {
    make: values.make.trim(),
    model: values.model.trim(),
    category: values.category.trim(),
    price: Number(values.price),
    imageUrl: values.imageUrl.trim() ? values.imageUrl.trim() : null,
  };

  const year = parseOptionalInt(values.year, "year", {}, {
    min: 1980,
    max: currentModelYearMax(),
  });
  if (year !== undefined) payload.year = year;

  const odometerKm = parseOptionalInt(values.odometerKm, "odometerKm", {}, {
    min: 0,
    max: 2_000_000,
  });
  if (odometerKm !== undefined) payload.odometerKm = odometerKm;

  const engineCc = parseOptionalInt(values.engineCc, "engineCc", {}, {
    min: 50,
    max: 10_000,
  });
  if (engineCc !== undefined) payload.engineCc = engineCc;

  const powerBhp = parseOptionalInt(values.powerBhp, "powerBhp", {}, {
    min: 1,
    max: 2_000,
  });
  if (powerBhp !== undefined) payload.powerBhp = powerBhp;

  const torqueNm = parseOptionalInt(values.torqueNm, "torqueNm", {}, {
    min: 1,
    max: 3_000,
  });
  if (torqueNm !== undefined) payload.torqueNm = torqueNm;

  if (values.fuelType.trim()) {
    payload.fuelType = values.fuelType as FuelType;
  }
  if (values.transmission.trim()) {
    payload.transmission = values.transmission as TransmissionType;
  }
  if (values.drivetrain.trim()) {
    payload.drivetrain = values.drivetrain as DrivetrainType;
  }

  const economy = parseOptionalFloat(values.fuelEconomyKmpl, "fuelEconomyKmpl", {}, {
    min: 0.1,
    max: 100,
  });
  if (economy !== undefined) payload.fuelEconomyKmpl = economy;

  if (values.color.trim()) payload.color = values.color.trim();
  const owners = parseOptionalInt(values.owners, "owners", {}, { min: 1, max: 10 });
  if (owners !== undefined) payload.owners = owners;
  if (values.vin.trim()) payload.vin = values.vin.trim().toUpperCase();

  const seats = parseOptionalInt(values.seats, "seats", {}, { min: 1, max: 9 });
  if (seats !== undefined) payload.seats = seats;

  if (isElectrifiedFuel(values.fuelType.trim())) {
    const rangeKm = parseOptionalInt(values.rangeKm, "rangeKm", {}, {
      min: 20,
      max: 1500,
    });
    if (rangeKm !== undefined) payload.rangeKm = rangeKm;
    const batteryKwh = parseOptionalFloat(values.batteryKwh, "batteryKwh", {}, {
      min: 5,
      max: 250,
    });
    if (batteryKwh !== undefined) payload.batteryKwh = batteryKwh;
  }

  if (values.description.trim()) {
    payload.description = values.description.trim();
  }

  if (values.features.length > 0) {
    const deduped: string[] = [];
    const seen = new Set<string>();
    for (const raw of values.features) {
      const item = raw.trim();
      const key = item.toLowerCase();
      if (!item || seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }
    payload.features = deduped;
  }

  if (options.requireQuantity) {
    return {
      ...payload,
      quantity: Number(values.quantity),
    };
  }

  return payload;
}
