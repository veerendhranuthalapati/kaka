import "dotenv/config";
import { resolve } from "node:path";
import { prisma } from "../src/lib/prisma.js";
import {
  listAllCarAssetFilenames,
  listDemoCarImagePaths,
  refuseProductionSeed,
  resolveDemoVehicleImageUrl,
} from "./seed-demo.lib.js";

const DEMO_TAG = "demo-seed";

const catalog = [
  { make: "Aurora", model: "LX", category: "Sedan", price: 28999, quantity: 3 },
  { make: "Summit", model: "Tour", category: "SUV", price: 34999, quantity: 2 },
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

  const repoRoot = resolve(process.cwd(), "..");
  const assets = listAllCarAssetFilenames(repoRoot);
  const fallbackSvgs = listDemoCarImagePaths(repoRoot);
  if (assets.length < 8) {
    throw new Error(
      `seed:demo needs at least 8 files in frontend/public/cars (found ${assets.length})`,
    );
  }
  if (fallbackSvgs.length === 0) {
    throw new Error("seed:demo needs at least one fallback SVG in frontend/public/cars");
  }

  await prisma.vehicle.deleteMany({
    where: { make: { startsWith: DEMO_TAG } },
  });

  for (const [index, item] of catalog.entries()) {
    const imageUrl = resolveDemoVehicleImageUrl(
      item.make,
      item.model,
      repoRoot,
      fallbackSvgs,
      index,
    );
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
