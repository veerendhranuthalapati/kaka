import type { Role, Vehicle } from "../types";

function encode(value: object): string {
  return btoa(JSON.stringify(value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export function makeToken(
  role: Role = "USER",
  options: { email?: string; id?: string; exp?: number } = {},
): string {
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
    sub: options.id ?? "user-1",
    email: options.email ?? "user@example.com",
    role,
    exp: options.exp ?? Math.floor(Date.now() / 1000) + 3_600,
  })}.signature`;
}

export function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: "vehicle-1",
    make: "Toyota",
    model: "Corolla",
    category: "Sedan",
    price: 24_500,
    quantity: 3,
    imageUrl: null,
    createdAt: "2026-10-23T10:00:00.000Z",
    updatedAt: "2026-10-23T10:00:00.000Z",
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
    ...overrides,
  };
}
