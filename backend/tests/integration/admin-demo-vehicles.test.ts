import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app.js";
import { DEMO_VEHICLE_CATALOG } from "../../src/demo/catalog.js";
import { seedDemoVehicles } from "../../src/demo/seedDemoVehicles.js";
import * as logger from "../../src/lib/logger.js";
import { prisma } from "../../src/lib/prisma.js";
import { PrismaVehicleRepository } from "../../src/repositories/vehicle.repository.js";
import { createTestUser } from "../helpers/auth.js";
import { truncateTables } from "../helpers/db.js";
import { resolve } from "node:path";

const path = "/api/admin/demo-vehicles";
const repoRoot = resolve(process.cwd(), "..");

describe("POST /api/admin/demo-vehicles", () => {
  afterEach(async () => {
    await truncateTables();
    vi.restoreAllMocks();
  });

  it("returns 404 when the feature flag is disabled", async () => {
    const app = createApp({ demoDataEndpointEnabled: false });
    const admin = await createTestUser("ADMIN");

    const res = await request(app)
      .post(path)
      .set("Authorization", admin.auth)
      .send({});

    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns 401 without a token", async () => {
    const app = createApp({ demoDataEndpointEnabled: true });

    const res = await request(app).post(path).send({});

    expect(res.status).toBe(401);
    expect(res.body.error).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns 403 for USER role", async () => {
    const app = createApp({ demoDataEndpointEnabled: true });
    const user = await createTestUser("USER");

    const res = await request(app)
      .post(path)
      .set("Authorization", user.auth)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.error).toMatchObject({ code: "FORBIDDEN" });
  });

  it("lets ADMIN seed demo vehicles and reports counts", async () => {
    const app = createApp({
      authRateLimitMax: 1000,
      demoDataEndpointEnabled: true,
    });
    const admin = await createTestUser("ADMIN");
    const logSpy = vi.spyOn(logger, "logSecurityEvent");

    const res = await request(app)
      .post(path)
      .set("Authorization", admin.auth)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.created).toBeGreaterThan(0);
    expect(res.body.updated).toBe(0);
    expect(res.body.skipped).toBe(0);
    expect(typeof res.body.created).toBe("number");

    const count = await prisma.vehicle.count();
    expect(count).toBe(DEMO_VEHICLE_CATALOG.length);

    expect(logSpy).toHaveBeenCalledWith(
      "admin_demo_seed",
      expect.objectContaining({
        actorId: admin.id,
        created: res.body.created,
        updated: res.body.updated,
        skipped: res.body.skipped,
      }),
    );
  });

  it("second call creates 0 new vehicles", async () => {
    const app = createApp({
      authRateLimitMax: 1000,
      demoDataEndpointEnabled: true,
    });
    const admin = await createTestUser("ADMIN");

    const first = await request(app)
      .post(path)
      .set("Authorization", admin.auth)
      .send({});
    expect(first.status).toBe(200);

    const second = await request(app)
      .post(path)
      .set("Authorization", admin.auth)
      .send({});

    expect(second.status).toBe(200);
    expect(second.body.created).toBe(0);
    expect(second.body.updated).toBe(0);
    expect(second.body.skipped).toBe(DEMO_VEHICLE_CATALOG.length);
  });

  it("fills NULL fields without overwriting non-null values", async () => {
    const app = createApp({
      authRateLimitMax: 1000,
      demoDataEndpointEnabled: true,
    });
    const admin = await createTestUser("ADMIN");
    const catalog = DEMO_VEHICLE_CATALOG.find(
      (entry) => entry.make === "Toyota" && entry.model === "Camry",
    )!;

    await prisma.vehicle.create({
      data: {
        make: catalog.make,
        model: catalog.model,
        category: "Legacy",
        price: 999,
        quantity: 5,
        year: 2010,
        odometerKm: null,
      },
    });

    const res = await request(app)
      .post(path)
      .set("Authorization", admin.auth)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.created).toBe(DEMO_VEHICLE_CATALOG.length - 1);
    expect(res.body.updated).toBe(1);

    const row = await prisma.vehicle.findFirstOrThrow({
      where: { make: catalog.make, model: catalog.model },
    });
    expect(row.year).toBe(2010);
    expect(row.category).toBe("Legacy");
    expect(Number(row.price)).toBe(999);
    expect(row.odometerKm).toBe(catalog.odometerKm);
  });

  it("rejects a non-empty JSON body", async () => {
    const app = createApp({ demoDataEndpointEnabled: true });
    const admin = await createTestUser("ADMIN");

    const res = await request(app)
      .post(path)
      .set("Authorization", admin.auth)
      .send({ force: true });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("rolls back the transaction when seeding fails mid-run", async () => {
    const repository = new PrismaVehicleRepository();
    const before = await prisma.vehicle.count();

    await expect(
      seedDemoVehicles(repository, {
        repoRoot,
        failAfterCreates: 1,
      }),
    ).rejects.toThrow(/rollback test failure/i);

    const after = await prisma.vehicle.count();
    expect(after).toBe(before);
  });
});
