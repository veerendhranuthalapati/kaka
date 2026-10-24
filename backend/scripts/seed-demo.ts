import "dotenv/config";
import { resolve } from "node:path";
import { prisma } from "../src/lib/prisma.js";
import {
  buildDemoSeedUpdatePatch,
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

  let created = 0;
  let updated = 0;

  for (const item of DEMO_VEHICLE_CATALOG) {
    const resolvedImage =
      resolveOptionalDemoImageUrl(item.make, item.model, repoRoot) ?? null;
    const imageUrl = resolvedImage ?? item.imageUrl ?? null;

    const { imageUrl: _catalogImage, ...rest } = item;
    const existing = await prisma.vehicle.findFirst({
      where: { make: item.make, model: item.model },
    });

    if (existing) {
      const patch = buildDemoSeedUpdatePatch(existing, item, resolvedImage);
      if (Object.keys(patch).length > 0) {
        await prisma.vehicle.update({
          where: { id: existing.id },
          data: patch,
        });
      }
      updated += 1;
    } else {
      await prisma.vehicle.create({
        data: {
          ...rest,
          imageUrl,
        },
      });
      created += 1;
    }
  }

  console.log(
    `seed:demo upserted ${DEMO_VEHICLE_CATALOG.length} vehicles (${created} created, ${updated} updated)`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
