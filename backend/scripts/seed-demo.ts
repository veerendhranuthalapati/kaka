import "dotenv/config";
import { resolve } from "node:path";
import { prisma } from "../src/lib/prisma.js";
import {
  cleanupLegacyDemoSeedVehicles,
  DEMO_VEHICLE_CATALOG,
  listAllCarAssetFilenames,
  refuseProductionSeed,
  refuseTestDatabase,
  resolveOptionalDemoImageUrl,
} from "./seed-demo.lib.js";

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

  await cleanupLegacyDemoSeedVehicles(prisma);

  await prisma.vehicle.deleteMany({
    where: {
      OR: DEMO_VEHICLE_CATALOG.map((item) => ({
        make: item.make,
        model: item.model,
      })),
    },
  });

  for (const item of DEMO_VEHICLE_CATALOG) {
    const imageUrl =
      item.imageUrl ??
      resolveOptionalDemoImageUrl(item.make, item.model, repoRoot) ??
      null;

    const { imageUrl: _ignored, ...rest } = item;
    await prisma.vehicle.create({
      data: {
        ...rest,
        imageUrl,
      },
    });
  }

  console.log(`seed:demo created ${DEMO_VEHICLE_CATALOG.length} vehicles`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
