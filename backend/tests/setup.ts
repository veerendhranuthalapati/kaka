import { execSync } from "node:child_process";
import { afterAll, beforeAll } from "vitest";

process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST ??
  "postgresql://postgres:postgres@localhost:5432/dealership_test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret-for-vitest";

beforeAll(() => {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env },
  });
});

afterAll(async () => {
  const { prisma } = await import("../src/lib/prisma.js");
  await prisma.$disconnect();
});
