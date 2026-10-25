import type { Role, Vehicle } from "../types";
import { TOKEN_STORAGE_KEY } from "../api/client";
import { USER_STORAGE_KEY } from "../auth/session";

function encode(value: object): string {
  return btoa(JSON.stringify(value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export function makeToken(
  _role: Role = "USER",
  options: { id?: string; exp?: number; tv?: number } = {},
): string {
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
    sub: options.id ?? "user-1",
    tv: options.tv ?? 0,
    exp: options.exp ?? Math.floor(Date.now() / 1000) + 3_600,
  })}.signature`;
}

export function seedAuthSession(
  role: Role = "USER",
  options: { email?: string; id?: string; exp?: number } = {},
): void {
  const id = options.id ?? "user-1";
  sessionStorage.setItem(TOKEN_STORAGE_KEY, makeToken(role, { id, exp: options.exp }));
  sessionStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify({
      id,
      email: options.email ?? "user@example.com",
      role,
    }),
  );
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
    seats: null,
    rangeKm: null,
    batteryKwh: null,
    description: null,
    features: [],
    ...overrides,
  };
}
