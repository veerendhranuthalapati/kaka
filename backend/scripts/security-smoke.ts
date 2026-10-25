#!/usr/bin/env tsx
import { execSync, spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import express from "express";
import jwt from "jsonwebtoken";
import { pathToFileURL } from "node:url";

const BACKEND_ROOT = resolve(import.meta.dirname, "..");
const SEC_DB = "dealership_sec_test";
const BASE_PG =
  process.env.SMOKE_PG_ADMIN_URL ??
  "postgresql://postgres:postgres@localhost:5432/postgres";
const JWT_SECRET =
  "smoke-jwt-secret-entropy-abcdefgh-0123456789-xyzz";
const PORT = Number(process.env.SECURITY_SMOKE_PORT ?? 3099);
const CORS_ORIGIN = `http://localhost:${PORT + 1}`;

type Row = {
  attack: string;
  expected: string;
  actual: string;
  pass: boolean;
};

const rows: Row[] = [];

function record(attack: string, expected: string, actual: string): void {
  const pass = actual === expected;
  rows.push({ attack, expected, actual, pass });
}

async function runAdminSql(sql: string): Promise<void> {
  const { PrismaClient } = await import("@prisma/client");
  const admin = new PrismaClient({ datasources: { db: { url: BASE_PG } } });
  try {
    await admin.$executeRawUnsafe(sql);
  } finally {
    await admin.$disconnect();
  }
}

async function resetSecDatabase(): Promise<void> {
  await runAdminSql(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${SEC_DB}' AND pid <> pg_backend_pid();`,
  ).catch(() => {});
  await runAdminSql(`DROP DATABASE IF EXISTS "${SEC_DB}";`);
  await runAdminSql(`CREATE DATABASE "${SEC_DB}";`);
}

function databaseUrl(): string {
  const url = new URL(BASE_PG);
  url.pathname = `/${SEC_DB}`;
  return url.toString();
}

async function waitForHealth(base: string, attempts = 40): Promise<void> {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(`${base}/health`);
      if (res.ok) return;
    } catch {
      // retry
    }
    await delay(250);
  }
  throw new Error("Server did not become healthy");
}

async function jsonFetch(
  base: string,
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; headers: Headers; body: unknown }> {
  const res = await fetch(`${base}${path}`, init);
  let body: unknown = null;
  const type = res.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    body = await res.json();
  } else if (res.status !== 204) {
    body = await res.text();
  }
  return { status: res.status, headers: res.headers, body };
}

function bearer(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

async function main(): Promise<void> {
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.JWT_ISSUER = process.env.JWT_ISSUER ?? "autoyard-api";
  process.env.JWT_AUDIENCE = process.env.JWT_AUDIENCE ?? "autoyard-client";
  process.env.CORS_ORIGIN = CORS_ORIGIN;

  await resetSecDatabase();

  const dbUrl = databaseUrl();
  process.env.DATABASE_URL = dbUrl;
  execSync("npx prisma migrate deploy", {
    cwd: BACKEND_ROOT,
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
    },
  });
  execSync("npm run build", { cwd: BACKEND_ROOT, stdio: "inherit" });

  const logPath = resolve(BACKEND_ROOT, ".security-smoke.log");
  const logStream = createWriteStream(logPath, { flags: "w" });
  const serverEnv = {
    ...process.env,
    NODE_ENV: "test",
    PORT: String(PORT),
    DATABASE_URL: dbUrl,
    JWT_SECRET,
    BCRYPT_COST: "4",
    CORS_ORIGIN,
    AUTH_RATE_LIMIT_MAX: "1000",
    GLOBAL_RATE_LIMIT_MAX: "1000",
    WRITE_RATE_LIMIT_MAX: "1000",
  };

  const server = spawn("node", ["dist/index.js"], {
    cwd: BACKEND_ROOT,
    env: serverEnv,
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout?.pipe(logStream);
  server.stderr?.pipe(logStream);

  const base = `http://127.0.0.1:${PORT}`;

  try {
    await waitForHealth(base);

    const { signAccessToken } = await import(
      pathToFileURL(resolve(BACKEND_ROOT, "dist/services/auth.service.js")).href
    );
    const { config } = await import(
      pathToFileURL(resolve(BACKEND_ROOT, "dist/config/env.js")).href
    );
    const { errorHandler } = await import(
      pathToFileURL(resolve(BACKEND_ROOT, "dist/middleware/errorHandler.js")).href
    );
    const { createApp } = await import(
      pathToFileURL(resolve(BACKEND_ROOT, "dist/app.js")).href
    );

    const registerRes = await jsonFetch(base, "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "smoke-user@example.com",
        password: "Str0ng!User9x",
      }),
    });
    const userToken = (registerRes.body as { token: string }).token;

    const adminRegister = await jsonFetch(base, "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "smoke-admin@example.com",
        password: "Str0ng!User9x",
      }),
    });
    const adminBody = adminRegister.body as {
      user: { id: string };
      token: string;
    };
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    await prisma.user.update({
      where: { id: adminBody.user.id },
      data: { role: "ADMIN" },
    });
    const adminUser = await prisma.user.findUniqueOrThrow({
      where: { id: adminBody.user.id },
    });
    const adminToken = signAccessToken(adminUser);
    await prisma.$disconnect();

    const probe = async (label: string, token: string | null, path: string) => {
      const headers: Record<string, string> = token
        ? bearer(token)
        : {};
      const res = await jsonFetch(base, path, { headers });
      record(label, "401", String(res.status));
    };

    await probe("missing token", null, "/api/vehicles");
    await probe("malformed token", "not.a.jwt", "/api/vehicles");

    const tampered = `${userToken.slice(0, -1)}x`;
    await probe("tampered token", tampered, "/api/vehicles");

    const noneHeader = Buffer.from(
      JSON.stringify({ alg: "none", typ: "JWT" }),
    ).toString("base64url");
    const noneBody = Buffer.from(
      JSON.stringify({ sub: adminUser.id, tv: 0 }),
    ).toString("base64url");
    await probe("alg none token", `${noneHeader}.${noneBody}.`, "/api/vehicles");

    const hs512 = jwt.sign(
      { tv: 0 },
      JWT_SECRET,
      {
        algorithm: "HS512",
        subject: adminUser.id,
        issuer: config.jwtIssuer,
        audience: config.jwtAudience,
        expiresIn: "15m",
      },
    );
    await probe("HS512 token", hs512, "/api/vehicles");

    const expired = jwt.sign(
      { tv: 0, exp: Math.floor(Date.now() / 1000) - 60 },
      JWT_SECRET,
      {
        algorithm: "HS256",
        subject: adminUser.id,
        issuer: config.jwtIssuer,
        audience: config.jwtAudience,
      },
    );
    await probe("expired token", expired, "/api/vehicles");

    const wrongIssuer = jwt.sign(
      { tv: 0 },
      JWT_SECRET,
      {
        algorithm: "HS256",
        subject: adminUser.id,
        issuer: "wrong-issuer",
        audience: config.jwtAudience,
        expiresIn: "15m",
      },
    );
    await probe("wrong-issuer token", wrongIssuer, "/api/vehicles");

    const wrongAudience = jwt.sign(
      { tv: 0 },
      JWT_SECRET,
      {
        algorithm: "HS256",
        subject: adminUser.id,
        issuer: config.jwtIssuer,
        audience: "wrong-audience",
        expiresIn: "15m",
      },
    );
    await probe("wrong-audience token", wrongAudience, "/api/vehicles");

    const adminChecks: Array<{ label: string; path: string; method: string }> =
      [
        { label: "USER on POST /api/vehicles", path: "/api/vehicles", method: "POST" },
        {
          label: "USER on PUT /api/vehicles/:id",
          path: "/api/vehicles/00000000-0000-4000-8000-000000000099",
          method: "PUT",
        },
        {
          label: "USER on DELETE /api/vehicles/:id",
          path: "/api/vehicles/00000000-0000-4000-8000-000000000099",
          method: "DELETE",
        },
        {
          label: "USER on POST restock",
          path: "/api/vehicles/00000000-0000-4000-8000-000000000099/restock",
          method: "POST",
        },
      ];
    for (const check of adminChecks) {
      const res = await jsonFetch(base, check.path, {
        method: check.method,
        headers: {
          ...bearer(userToken),
          "Content-Type": "application/json",
        },
        body:
          check.method === "DELETE"
            ? undefined
            : JSON.stringify(
                check.path.includes("restock")
                  ? { amount: 1 }
                  : {
                      make: "Smoke",
                      model: "Test",
                      category: "SEDAN",
                      price: 10000,
                      quantity: 1,
                    },
              ),
      });
      record(check.label, "403", String(res.status));
    }

    const sqli = await jsonFetch(
      base,
      `/api/vehicles/search?make=${encodeURIComponent("' OR 1=1 --")}`,
      { headers: bearer(adminToken) },
    );
    record("SQL injection in search", "200", String(sqli.status));

    const jsImage = await jsonFetch(base, "/api/vehicles", {
      method: "POST",
      headers: {
        ...bearer(adminToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        make: "Img",
        model: "X",
        category: "SEDAN",
        price: 1,
        quantity: 1,
        imageUrl: "javascript:alert(1)",
      }),
    });
    record("javascript: image URL", "400", String(jsImage.status));

    const dataImage = await jsonFetch(base, "/api/vehicles", {
      method: "POST",
      headers: {
        ...bearer(adminToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        make: "Img2",
        model: "Y",
        category: "SEDAN",
        price: 1,
        quantity: 1,
        imageUrl: "data:image/png;base64,xx",
      }),
    });
    record("data: image URL", "400", String(dataImage.status));

    const pollution = await jsonFetch(
      base,
      "/api/vehicles/search?make=honda&constructor=polluted",
      { headers: bearer(adminToken) },
    );
    record("prototype pollution query", "400", String(pollution.status));

    const dupQuery = await jsonFetch(
      base,
      "/api/vehicles/search?make=honda&make=toyota",
      { headers: bearer(adminToken) },
    );
    record("duplicated query params", "400", String(dupQuery.status));

    const nestedQuery = await jsonFetch(
      base,
      "/api/vehicles/search?filter[make]=honda",
      { headers: bearer(adminToken) },
    );
    record("nested query params", "400", String(nestedQuery.status));

    await jsonFetch(base, "/api/auth/logout", {
      method: "POST",
      headers: bearer(userToken),
    });
    const afterLogout = await jsonFetch(base, "/api/vehicles", {
      headers: bearer(userToken),
    });
    record("revoked token after logout", "401", String(afterLogout.status));

    const demotePrisma = new PrismaClient({
      datasources: { db: { url: dbUrl } },
    });
    const demoteUser = await demotePrisma.user.findFirstOrThrow({
      where: { email: "smoke-admin@example.com" },
    });
    await demotePrisma.user.update({
      where: { id: demoteUser.id },
      data: { role: "USER" },
    });
    const demoteToken = signAccessToken(demoteUser);
    const demoted = await jsonFetch(base, "/api/vehicles", {
      method: "POST",
      headers: {
        ...bearer(demoteToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        make: "X",
        model: "Y",
        category: "SEDAN",
        price: 1,
        quantity: 1,
      }),
    });
    record("role demoted in DB", "403", String(demoted.status));
    await demotePrisma.$disconnect();

    for (let i = 0; i < 5; i += 1) {
      await jsonFetch(base, "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "unknown-throttle@example.com",
          password: "wrong-pass-9!",
        }),
      });
    }
    const unknownBlocked = await jsonFetch(base, "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "unknown-throttle@example.com",
        password: "wrong-pass-9!",
      }),
    });
    for (let i = 0; i < 5; i += 1) {
      await jsonFetch(base, "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "smoke-user@example.com",
          password: "wrong-pass-9!",
        }),
      });
    }
    const knownBlocked = await jsonFetch(base, "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "smoke-user@example.com",
        password: "wrong-pass-9!",
      }),
    });
    record(
      "login throttling unknown email",
      "429",
      String(unknownBlocked.status),
    );
    record(
      "login throttling known email",
      "429",
      String(knownBlocked.status),
    );
    record(
      "login throttling identical envelope",
      JSON.stringify(unknownBlocked.body),
      JSON.stringify(knownBlocked.body),
    );

    const dup = await jsonFetch(base, "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "Smoke-User@example.com",
        password: "Str0ng!User9x",
      }),
    });
    record("email case-variant duplicate", "409", String(dup.status));

    const common = await jsonFetch(base, "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "common@example.com",
        password: "password",
      }),
    });
    record("common password", "400", String(common.status));

    const weak = await jsonFetch(base, "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "weak@example.com",
        password: "short",
      }),
    });
    record("weak password", "400", String(weak.status));

    const oversized = await jsonFetch(base, "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "big@example.com",
        password: `Str0ng!${"x".repeat(20_000)}`,
      }),
    });
    record("oversized body", "413", String(oversized.status));

    const wrongType = await jsonFetch(base, "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "email=a@b.com&password=x",
    });
    record("wrong content type", "415", String(wrongType.status));

    const corsRes = await fetch(`${base}/health`, {
      headers: { Origin: "https://evil.example" },
    });
    const corsHeader = corsRes.headers.get("access-control-allow-origin");
    record(
      "CORS unlisted origin",
      "no Access-Control-Allow-Origin",
      corsHeader ?? "no Access-Control-Allow-Origin",
    );

    const headerRes = await jsonFetch(base, "/health");
    const expectedHeaders = [
      "content-security-policy",
      "x-content-type-options",
      "referrer-policy",
      "cross-origin-opener-policy",
      "cross-origin-resource-policy",
      "permissions-policy",
    ];
    const missing = expectedHeaders.filter(
      (name) => !headerRes.headers.get(name),
    );
    record(
      "security headers present",
      "all present",
      missing.length === 0 ? "all present" : `missing: ${missing.join(",")}`,
    );

    const leakApp = express();
    leakApp.get("/boom", () => {
      throw new Error(
        "postgres://user:secret@localhost SELECT * FROM User /secret/path",
      );
    });
    leakApp.use(errorHandler);
    const leakServer = leakApp.listen(PORT + 2);
    const internal = await fetch(`http://127.0.0.1:${PORT + 2}/boom`);
    const bodyText = JSON.stringify(await internal.json());
    record(
      "forced 500 leak guard",
      "sanitized",
      bodyText.includes("postgres://") || bodyText.includes("/secret/")
        ? "leaked"
        : "sanitized",
    );
    await new Promise<void>((resolveClose) => leakServer.close(() => resolveClose()));

    const limitedApp = createApp({ globalMax: 2, globalWindowMs: 60_000 });
    const { default: supertest } = await import("supertest");
    await supertest(limitedApp).get("/api/vehicles");
    await supertest(limitedApp).get("/api/vehicles");
    const globalLimited = await supertest(limitedApp).get("/api/vehicles");
    record(
      "global rate limit",
      "429",
      String(globalLimited.status),
    );
    record(
      "global Retry-After",
      "present",
      globalLimited.headers["retry-after"] ? "present" : "missing",
    );

    await jsonFetch(base, "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "write-limit@example.com",
        password: "Str0ng!User9x",
      }),
    });
    const writePrisma = new PrismaClient({
      datasources: { db: { url: dbUrl } },
    });
    const writeAdmin = await writePrisma.user.update({
      where: { email: "write-limit@example.com" },
      data: { role: "ADMIN" },
    });
    const writeToken = signAccessToken(writeAdmin);
    await writePrisma.$disconnect();

    const writeLimited = createApp({ writeMax: 1, writeWindowMs: 60_000 });
    const writeHeaders = {
      ...bearer(writeToken),
      "Content-Type": "application/json",
    };
    await supertest(writeLimited)
      .post("/api/vehicles")
      .set(writeHeaders)
      .send({
        make: "W",
        model: "1",
        category: "SEDAN",
        price: 1,
        quantity: 1,
      });
    const writeBlock = await supertest(writeLimited)
      .post("/api/vehicles")
      .set(writeHeaders)
      .send({
        make: "W",
        model: "2",
        category: "SEDAN",
        price: 1,
        quantity: 1,
      });
    record("write rate limit", "429", String(writeBlock.status));

    const reqId = await jsonFetch(base, "/health");
    const generated = reqId.headers.get("x-request-id") ?? "";
    record(
      "request-id echo",
      "uuid",
      /^[0-9a-f-]{36}$/i.test(generated) ? "uuid" : generated,
    );
    const inbound = "short";
    const echoed = await fetch(`${base}/health`, {
      headers: { "X-Request-Id": inbound },
    });
    const echoedId = echoed.headers.get("x-request-id") ?? "";
    record(
      "request-id validation",
      "rejects malformed",
      echoedId === inbound ? "accepted malformed" : "rejects malformed",
    );

    await jsonFetch(base, "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "smoke-user@example.com",
        password: "Str0ng!User9x",
      }),
    });

    logStream.end();
    await delay(300);
    const logs = readFileSync(logPath, "utf8");
    const logLeak =
      logs.includes("Str0ng!User9x") || /eyJ[A-Za-z0-9_-]+\./.test(logs);
    record(
      "logs omit password and tokens",
      "clean",
      logLeak ? "leaked" : "clean",
    );
  } finally {
    server.kill("SIGTERM");
    await delay(500);
    await runAdminSql(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${SEC_DB}' AND pid <> pg_backend_pid();`,
    ).catch(() => {});
    await runAdminSql(`DROP DATABASE IF EXISTS "${SEC_DB}";`);
  }

  console.log("\nSecurity smoke results\n");
  console.log(
    "| Attack | Expected | Actual | OK |",
  );
  console.log("|--------|----------|--------|-----|");
  for (const row of rows) {
    console.log(
      `| ${row.attack} | ${row.expected} | ${row.actual} | ${row.pass ? "yes" : "NO"} |`,
    );
  }

  const failed = rows.filter((row) => !row.pass);
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
