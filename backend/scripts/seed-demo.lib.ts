import type { PrismaClient } from "@prisma/client";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

export const LEGACY_DEMO_SEED_MAKE = "demo-seed";

/** Rows from an older seed:make prefix scheme, or make exactly `demo-seed`. */
export function legacyDemoSeedVehicleWhere() {
  return {
    OR: [
      { make: LEGACY_DEMO_SEED_MAKE },
      { make: { startsWith: `${LEGACY_DEMO_SEED_MAKE} ` } },
    ],
  };
}

export async function cleanupLegacyDemoSeedVehicles(
  client: Pick<PrismaClient, "vehicle">,
): Promise<number> {
  const result = await client.vehicle.deleteMany({
    where: legacyDemoSeedVehicleWhere(),
  });
  return result.count;
}

export function refuseProductionSeed(nodeEnv: string | undefined): void {
  if (nodeEnv === "production") {
    throw new Error("seed:demo refuses to run in production");
  }
}

export function refuseTestDatabase(databaseUrl: string | undefined): void {
  if (!databaseUrl) {
    return;
  }
  const match = databaseUrl.match(/\/([^/?]+)(?:\?|$)/);
  const databaseName = match?.[1] ?? "";
  if (databaseName.endsWith("_test")) {
    throw new Error("seed:demo refuses to run against a _test database");
  }
}

export function demoVehicleImageSlug(make: string, model: string): string {
  return `${make}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export function listDemoCarImagePaths(repoRoot = resolve(process.cwd(), "..")): string[] {
  const carsDir = join(repoRoot, "frontend", "public", "cars");
  if (!existsSync(carsDir)) {
    return [];
  }
  return readdirSync(carsDir)
    .filter((name) => name.endsWith(".svg") && name !== "placeholder.svg")
    .sort()
    .map((name) => `/cars/${name}`);
}

export function listAllCarAssetFilenames(
  repoRoot = resolve(process.cwd(), ".."),
): string[] {
  const carsDir = join(repoRoot, "frontend", "public", "cars");
  if (!existsSync(carsDir)) {
    return [];
  }
  return readdirSync(carsDir)
    .filter((name) => name !== "placeholder.svg")
    .sort();
}

export type DemoCatalogEntry = {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  year?: number | null;
  odometerKm?: number | null;
  engineCc?: number | null;
  powerBhp?: number | null;
  torqueNm?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  fuelEconomyKmpl?: number | null;
  color?: string | null;
  owners?: number | null;
  vin?: string | null;
};

/** Illustrative sample inventory — figures are not verified against real vehicles. */
export const DEMO_VEHICLE_CATALOG: DemoCatalogEntry[] = [
  {
    make: "Toyota",
    model: "Camry",
    category: "Sedan",
    price: 32999,
    quantity: 2,
    imageUrl: "/cars/sedan-01.svg",
    year: 2022,
    odometerKm: 18400,
    engineCc: 2487,
    powerBhp: 203,
    torqueNm: 247,
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    drivetrain: "FWD",
    fuelEconomyKmpl: 14.2,
    color: "Silver",
    owners: 1,
    vin: "4T1B11HK5JU123456",
  },
  {
    make: "Honda",
    model: "CR-V",
    category: "SUV",
    price: 36499,
    quantity: 1,
    imageUrl: "/cars/suv-01.svg",
    year: 2021,
    odometerKm: 32100,
    engineCc: 1996,
    powerBhp: 190,
    torqueNm: 243,
    fuelType: "PETROL",
    transmission: "CVT",
    drivetrain: "AWD",
    fuelEconomyKmpl: 12.8,
    color: "White",
    owners: 2,
    vin: "2HKRW2H85MH123456",
  },
  {
    make: "Ford",
    model: "F-150",
    category: "Truck",
    price: 48999,
    quantity: 1,
    imageUrl: "/cars/truck-01.svg",
    year: 2020,
    odometerKm: 45200,
    engineCc: 3496,
    powerBhp: 400,
    torqueNm: 678,
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    drivetrain: "FOUR_WD",
    fuelEconomyKmpl: 9.4,
    color: "Blue",
    owners: 1,
    vin: "1FTEW1EP5LFA12345",
  },
  {
    make: "Tesla",
    model: "Model 3",
    category: "EV",
    price: 45999,
    quantity: 2,
    imageUrl: "/cars/ev-01.svg",
    year: 2023,
    odometerKm: 8200,
    engineCc: null,
    powerBhp: 283,
    torqueNm: 420,
    fuelType: "ELECTRIC",
    transmission: "AUTOMATIC",
    drivetrain: "RWD",
    fuelEconomyKmpl: null,
    color: "Pearl White",
    owners: 1,
    vin: "5YJ3E1EA8PF123456",
  },
  {
    make: "Volkswagen",
    model: "Golf",
    category: "Hatchback",
    price: 27999,
    quantity: 3,
    imageUrl: "/cars/hatch-01.svg",
    year: 2019,
    odometerKm: 54800,
    engineCc: 1395,
    powerBhp: 147,
    torqueNm: 250,
    fuelType: "PETROL",
    transmission: "DCT",
    drivetrain: "FWD",
    fuelEconomyKmpl: 15.1,
    color: "Grey",
    owners: 2,
    vin: "3VW5T7AU9KM123456",
  },
  {
    make: "Subaru",
    model: "Outback",
    category: "Wagon",
    price: 33999,
    quantity: 1,
    imageUrl: "/cars/wagon-01.svg",
    year: 2022,
    odometerKm: 22100,
    engineCc: 2498,
    powerBhp: 182,
    torqueNm: 239,
    fuelType: "PETROL",
    transmission: "CVT",
    drivetrain: "AWD",
    fuelEconomyKmpl: 11.9,
    color: "Green",
    owners: 1,
    vin: "4S4BTACC5N3123456",
  },
  {
    make: "BMW",
    model: "430i",
    category: "Coupe",
    price: 52999,
    quantity: 0,
    imageUrl: "/cars/coupe-01.svg",
    year: 2021,
    odometerKm: 28900,
    engineCc: 1998,
    powerBhp: 255,
    torqueNm: 400,
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    drivetrain: "RWD",
    fuelEconomyKmpl: 12.4,
    color: "Black",
    owners: 1,
    vin: "WBA4Z1C05M5A12345",
  },
  {
    make: "Hyundai",
    model: "Kona Electric",
    category: "EV",
    price: 38999,
    quantity: 1,
    imageUrl: "/cars/ev-01.svg",
    year: 2024,
    odometerKm: 0,
    engineCc: null,
    powerBhp: 201,
    torqueNm: 395,
    fuelType: "ELECTRIC",
    transmission: "AUTOMATIC",
    drivetrain: "FWD",
    fuelEconomyKmpl: null,
    color: "Blue",
    owners: 1,
    vin: "KM8K33AA4RU123456",
  },
  {
    make: "Mazda",
    model: "CX-5",
    category: "SUV",
    price: 31999,
    quantity: 2,
    imageUrl: "/cars/suv-02.svg",
    year: 2020,
    odometerKm: 61200,
    engineCc: 2488,
    powerBhp: 187,
    torqueNm: 252,
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    drivetrain: "AWD",
    fuelEconomyKmpl: 11.2,
    color: "Red",
    owners: 2,
    vin: "JM3KFBDM5L0123456",
  },
  {
    make: "Mercedes-Benz",
    model: "C 300",
    category: "Sedan",
    price: 47999,
    quantity: 1,
    imageUrl: "/cars/sedan-02.svg",
    year: 2023,
    odometerKm: 11200,
    engineCc: 1991,
    powerBhp: 255,
    torqueNm: 400,
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    drivetrain: "RWD",
    fuelEconomyKmpl: 12.0,
    color: "Silver",
    owners: 1,
    vin: "W1KAF4HB5PR123456",
  },
  {
    make: "Toyota",
    model: "RAV4 Hybrid",
    category: "SUV",
    price: 39999,
    quantity: 2,
    imageUrl: "/cars/suv-01.svg",
    year: 2024,
    odometerKm: 0,
    engineCc: 2487,
    powerBhp: 219,
    torqueNm: 221,
    fuelType: "HYBRID",
    transmission: "CVT",
    drivetrain: "AWD",
    fuelEconomyKmpl: 18.6,
    color: "White",
    owners: 1,
    vin: "2T3RWRFV5RW123456",
  },
];

export function resolveOptionalDemoImageUrl(
  make: string,
  model: string,
  repoRoot: string,
): string | null {
  const carsDir = join(repoRoot, "frontend", "public", "cars");
  const slug = demoVehicleImageSlug(make, model);

  for (const extension of PHOTO_EXTENSIONS) {
    const filename = `${slug}${extension}`;
    if (existsSync(join(carsDir, filename))) {
      return `/cars/${filename}`;
    }
  }

  const svgMatch = `${slug}.svg`;
  if (existsSync(join(carsDir, svgMatch))) {
    return `/cars/${svgMatch}`;
  }

  return null;
}
