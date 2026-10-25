import "dotenv/config";
import { resolve } from "node:path";
import { seedDemoVehicles } from "../src/demo/seedDemoVehicles.js";
import { prisma } from "../src/lib/prisma.js";
import { PrismaVehicleRepository } from "../src/repositories/vehicle.repository.js";
import {
  cleanupLegacyDemoSeedVehicles,
  refuseProductionSeed,
  refuseTestDatabase,
} from "./seed-demo.lib.js";

async function main(): Promise<void> {
  refuseProductionSeed(process.env.NODE_ENV);
  refuseTestDatabase(process.env.DATABASE_URL);

  const repoRoot = resolve(process.cwd(), "..");
  await cleanupLegacyDemoSeedVehicles(prisma);

  const repository = new PrismaVehicleRepository();
  const result = await seedDemoVehicles(repository, { repoRoot });

  console.log(
    `seed:demo upserted catalog (${result.created} created, ${result.updated} updated, ${result.skipped} skipped)`,
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
