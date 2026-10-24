import "dotenv/config";
import { resolve } from "node:path";
import { prisma } from "../src/lib/prisma.js";
import {
  listAllCarAssetFilenames,
  refuseProductionSeed,
  refuseTestDatabase,
  resolveOptionalDemoImageUrl,
} from "./seed-demo.lib.js";

const DEMO_TAG = "demo-seed";

type CatalogEntry = {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

const catalog: CatalogEntry[] = [
  {
    make: "Aurora",
    model: "LX",
    category: "Sedan",
    price: 28999,
    quantity: 3,
    imageUrl: "/cars/sedan-01.svg",
  },
  {
    make: "Summit",
    model: "Tour",
    category: "SUV",
    price: 34999,
    quantity: 2,
    imageUrl: "/cars/suv-01.svg",
  },
  { make: "Harbor", model: "Crew", category: "Truck", price: 41999, quantity: 1 },
  { make: "Pulse", model: "EV", category: "Electric", price: 45999, quantity: 2 },
  { make: "Metro", model: "Five", category: "Hatchback", price: 21999, quantity: 4 },
  { make: "Coast", model: "Wagon", category: "Wagon", price: 26999, quantity: 1 },
  { make: "Vertex", model: "GT", category: "Coupe", price: 38999, quantity: 0 },
  { make: "Ridge", model: "Trail", category: "SUV", price: 36999, quantity: 2 },
  { make: "Lane", model: "City", category: "Sedan", price: 24999, quantity: 2 },
];

async function main(): Promise<void> {
  refuseProductionSeed(process.env.NODE_ENV);
  refuseTestDatabase(process.env.DATABASE_URL);

  const repoRoot = resolve(process.cwd(), "..");
  const assets = listAllCarAssetFilenames(repoRoot);
  if (assets.length < 8) {
    throw new Error(
      `seed:demo needs at least 8 files in frontend/public/cars (found ${assets.length})`,
    );
  }

  await prisma.vehicle.deleteMany({
    where: { make: { startsWith: DEMO_TAG } },
  });

  for (const item of catalog) {
    const imageUrl =
      item.imageUrl ??
      resolveOptionalDemoImageUrl(item.make, item.model, repoRoot) ??
      null;

    await prisma.vehicle.create({
      data: {
        make: `${DEMO_TAG} ${item.make}`,
        model: item.model,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        imageUrl,
      },
    });
  }

  console.log(`seed:demo created ${catalog.length} vehicles`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
