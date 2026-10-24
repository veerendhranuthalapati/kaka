import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import {
  deleteDevVerificationVehicles,
  listDevVerificationVehicles,
  refuseProductionSeed,
  refuseTestDatabase,
} from "./seed-demo.lib.js";

async function main(): Promise<void> {
  refuseProductionSeed(process.env.NODE_ENV);
  refuseTestDatabase(process.env.DATABASE_URL);

  const rows = await listDevVerificationVehicles(prisma);
  for (const row of rows) {
    console.log(
      JSON.stringify({
        id: row.id,
        make: row.make,
        model: row.model,
        createdAt: row.createdAt.toISOString(),
      }),
    );
  }

  const removed = await deleteDevVerificationVehicles(prisma);
  console.log(`Removed ${removed} dev verification row(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
