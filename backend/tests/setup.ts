import { execSync } from "node:child_process";
import { afterAll, beforeAll } from "vitest";

const databaseUrl =
  process.env.DATABASE_URL_TEST ??
  "postgresql://postgres:postgres@localhost:5432/dealership_test";
const databaseName = new URL(databaseUrl).pathname.replace(/^\//, "");

if (!databaseName.endsWith("_test")) {
  throw new Error(
    `Refusing to run tests against non-test database: ${databaseName}`,
  );
}

process.env.DATABASE_URL = databaseUrl;
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
