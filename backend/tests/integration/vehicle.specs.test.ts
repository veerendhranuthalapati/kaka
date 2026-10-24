import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { truncateTables } from "../helpers/db.js";
import { createTestUser } from "../helpers/auth.js";

const baseVehicle = {
  make: "Toyota",
  model: "Corolla",
  category: "Sedan",
  price: 25000.5,
  quantity: 3,
};

const fullSpecs = {
  year: 2022,
  odometerKm: 12400,
  engineCc: 1998,
  powerBhp: 187,
  torqueNm: 320,
  fuelType: "PETROL",
  transmission: "AUTOMATIC",
  drivetrain: "FWD",
  fuelEconomyKmpl: 18.4,
  color: "Pearl White",
  owners: 1,
  vin: "1hgbh41jxmn109186",
};

const nullSpecKeys = [
  "year",
  "odometerKm",
  "engineCc",
  "powerBhp",
  "torqueNm",
  "fuelType",
  "transmission",
  "drivetrain",
  "fuelEconomyKmpl",
  "color",
  "owners",
  "vin",
] as const;

function expectNullSpecs(body: Record<string, unknown>): void {
  for (const key of nullSpecKeys) {
    expect(body[key]).toBeNull();
  }
}

describe("vehicle optional specs — create", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("creates a vehicle with all optional spec fields", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({ ...baseVehicle, ...fullSpecs });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      ...baseVehicle,
      year: 2022,
      odometerKm: 12400,
      engineCc: 1998,
      powerBhp: 187,
      torqueNm: 320,
      fuelType: "PETROL",
      transmission: "AUTOMATIC",
      drivetrain: "FWD",
      fuelEconomyKmpl: 18.4,
      color: "Pearl White",
      owners: 1,
      vin: "1HGBH41JXMN109186",
    });
    expect(typeof res.body.fuelEconomyKmpl).toBe("number");
  });

  it("creates a vehicle with no optional spec fields (all null in response)", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(baseVehicle);

    expect(res.status).toBe(201);
    expectNullSpecs(res.body);
  });

  it("rejects invalid spec values on create", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const cases = [
      { ...baseVehicle, year: 1900 },
      { ...baseVehicle, odometerKm: -1 },
      { ...baseVehicle, engineCc: 0 },
      { ...baseVehicle, fuelType: "WATER" },
      { ...baseVehicle, vin: "TOO-SHORT" },
      { ...baseVehicle, color: "Red123" },
      { ...baseVehicle, color: "<script>" },
    ];

    for (const payload of cases) {
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", admin.auth)
        .send(payload);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    }
  });
});

describe("vehicle optional specs — update", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("sets and clears each spec field via PUT", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(baseVehicle);
    const id = created.body.id;

    const withSpecs = await request(app)
      .put(`/api/vehicles/${id}`)
      .set("Authorization", admin.auth)
      .send({ year: 2020, fuelType: "DIESEL" });
    expect(withSpecs.status).toBe(200);
    expect(withSpecs.body.year).toBe(2020);
    expect(withSpecs.body.fuelType).toBe("DIESEL");

    const cleared = await request(app)
      .put(`/api/vehicles/${id}`)
      .set("Authorization", admin.auth)
      .send({ year: null, fuelType: null });
    expect(cleared.status).toBe(200);
    expect(cleared.body.year).toBeNull();
    expect(cleared.body.fuelType).toBeNull();
  });

  it("still rejects quantity on PUT", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(baseVehicle);

    const res = await request(app)
      .put(`/api/vehicles/${created.body.id}`)
      .set("Authorization", admin.auth)
      .send({ quantity: 5 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
  });
});

describe("vehicle optional specs — list, search, get one", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("includes spec fields in list and search results", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");

    await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({ ...baseVehicle, ...fullSpecs });

    const list = await request(app)
      .get("/api/vehicles")
      .set("Authorization", user.auth);
    expect(list.status).toBe(200);
    expect(list.body[0].year).toBe(2022);
    expect(typeof list.body[0].fuelEconomyKmpl).toBe("number");

    const search = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", user.auth)
      .query({ make: "Toyota" });
    expect(search.status).toBe(200);
    expect(search.body[0].odometerKm).toBe(12400);
    expect(search.body[0].vin).toBe("1HGBH41JXMN109186");
  });

  it("GET /api/vehicles/:id returns 200, 400, 404, 401", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");

    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({ ...baseVehicle, ...fullSpecs });

    const noAuth = await request(app).get(`/api/vehicles/${created.body.id}`);
    expect(noAuth.status).toBe(401);

    const ok = await request(app)
      .get(`/api/vehicles/${created.body.id}`)
      .set("Authorization", user.auth);
    expect(ok.status).toBe(200);
    expect(ok.body.year).toBe(2022);

    const badId = await request(app)
      .get("/api/vehicles/not-a-uuid")
      .set("Authorization", user.auth);
    expect(badId.status).toBe(400);

    const missing = await request(app)
      .get("/api/vehicles/00000000-0000-4000-8000-000000000099")
      .set("Authorization", user.auth);
    expect(missing.status).toBe(404);
  });
});
