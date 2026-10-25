import { execSync } from "node:child_process";
import { afterAll, afterEach, beforeAll } from "vitest";

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
process.env.JWT_SECRET =
  process.env.JWT_SECRET ??
  "vitest-jwt-secret-entropy-abcdefgh-0123456789-xy";
process.env.BCRYPT_COST = process.env.BCRYPT_COST ?? "4";
process.env.CORS_ORIGIN =
  process.env.CORS_ORIGIN ?? "http://localhost:5173";

beforeAll(() => {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env },
  });
});

afterEach(async () => {
  const { loginThrottleStore } = await import(
    "../src/middleware/loginThrottle.js"
  );
  loginThrottleStore.reset();
});

afterAll(async () => {
  const { prisma } = await import("../src/lib/prisma.js");
  await prisma.$disconnect();
});
