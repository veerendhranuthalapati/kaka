import { prisma } from "../../src/lib/prisma.js";

export async function truncateTables(): Promise<void> {
  await prisma.user.deleteMany();
}
