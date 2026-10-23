import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { truncateTables } from "../helpers/db.js";
import { createTestUser } from "../helpers/auth.js";

const vehicle = {
  make: "Toyota",
  model: "Corolla",
  category: "Sedan",
  price: 25000.5,
  quantity: 3,
};

async function createVehicle(
  app: ReturnType<typeof createApp>,
  auth: string,
  overrides: Partial<typeof vehicle> = {},
): Promise<void> {
  await request(app)
    .post("/api/vehicles")
    .set("Authorization", auth)
    .send({ ...vehicle, ...overrides });
}

describe("POST /api/vehicles", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("lets an admin create a vehicle", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(vehicle);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(vehicle);
    expect(res.body.id).toEqual(expect.any(String));
    expect(typeof res.body.price).toBe("number");
  });

  it("forbids a non-admin from creating a vehicle", async () => {
    const app = createApp();
    const user = await createTestUser("USER");

    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", user.auth)
      .send(vehicle);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects invalid or negative vehicle input", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const missingModel = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({ ...vehicle, model: undefined });
    const negativePrice = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({ ...vehicle, price: -1 });
    const negativeQuantity = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({ ...vehicle, quantity: -1 });

    for (const res of [missingModel, negativePrice, negativeQuantity]) {
      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    }
  });

  it("rejects non-integer quantity, unknown fields, and overlong strings", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const nonIntegerQuantity = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({ ...vehicle, quantity: 1.5 });
    const unknownField = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({ ...vehicle, color: "red" });
    const overlongMake = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({ ...vehicle, make: "a".repeat(101) });

    for (const res of [nonIntegerQuantity, unknownField, overlongMake]) {
      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    }
  });
});

describe("GET /api/vehicles", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("rejects unauthenticated list requests", async () => {
    const app = createApp();

    const res = await request(app).get("/api/vehicles");

    expect(res.status).toBe(401);
    expect(res.body.error).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("includes vehicles with zero quantity", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");

    await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({ ...vehicle, quantity: 0 });

    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", user.auth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ quantity: 0 });
  });

  it("lists vehicles for any authenticated user", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");

    await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(vehicle);
    await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({ ...vehicle, make: "Honda", model: "Civic" });

    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", user.auth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({
      make: expect.any(String),
      price: expect.any(Number),
      quantity: expect.any(Number),
    });
  });
});

describe("GET /api/vehicles/search", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("matches make/model contains and category exactly, case-insensitively", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");

    await createVehicle(app, admin.auth, {
      make: "Toyota",
      model: "Corolla",
      category: "Sedan",
    });
    await createVehicle(app, admin.auth, {
      make: "toyota",
      model: "RAV4",
      category: "SUV",
    });
    await createVehicle(app, admin.auth, {
      make: "Honda",
      model: "Civic",
      category: "sedan",
    });

    const byMake = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", user.auth)
      .query({ make: "TOYO" });
    const byModel = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", user.auth)
      .query({ model: "civ" });
    const byCategory = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", user.auth)
      .query({ category: "SEDAN" });

    expect(byMake.status).toBe(200);
    expect(byMake.body).toHaveLength(2);
    for (const found of byMake.body) {
      expect(found.make.toLowerCase()).toContain("toyo");
    }

    expect(byModel.status).toBe(200);
    expect(byModel.body).toHaveLength(1);
    expect(byModel.body[0]).toMatchObject({ model: "Civic" });

    expect(byCategory.status).toBe(200);
    expect(byCategory.body).toHaveLength(2);
    for (const found of byCategory.body) {
      expect(found.category.toLowerCase()).toBe("sedan");
    }
  });

  it("filters by an inclusive price range and combines filters", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");

    await createVehicle(app, admin.auth, {
      make: "Toyota",
      model: "Corolla",
      category: "Sedan",
      price: 20000,
    });
    await createVehicle(app, admin.auth, {
      make: "Honda",
      model: "Civic",
      category: "Sedan",
      price: 25000,
    });
    await createVehicle(app, admin.auth, {
      make: "Toyota",
      model: "RAV4",
      category: "SUV",
      price: 30000,
    });
    await createVehicle(app, admin.auth, {
      make: "Tesla",
      model: "Model Y",
      category: "SUV",
      price: 40000,
    });

    const byPrice = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", user.auth)
      .query({ minPrice: 25000, maxPrice: 30000 });
    const combined = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", user.auth)
      .query({
        make: "toyota",
        category: "suv",
        minPrice: 25000,
        maxPrice: 35000,
      });

    expect(byPrice.status).toBe(200);
    expect(byPrice.body.map((found: { model: string }) => found.model)).toEqual([
      "Civic",
      "RAV4",
    ]);

    expect(combined.status).toBe(200);
    expect(combined.body).toHaveLength(1);
    expect(combined.body[0]).toMatchObject({ model: "RAV4" });
  });

  it("returns 400 for non-numeric price and for minPrice > maxPrice", async () => {
    const app = createApp();
    const user = await createTestUser("USER");

    const badNumeric = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", user.auth)
      .query({ minPrice: "abc" });
    const badRange = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", user.auth)
      .query({ minPrice: 30000, maxPrice: 20000 });

    expect(badNumeric.status).toBe(400);
    expect(badNumeric.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(badRange.status).toBe(400);
    expect(badRange.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("returns an empty array when no matches are found", async () => {
    const app = createApp();
    const user = await createTestUser("USER");

    const res = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", user.auth)
      .query({ make: "NonExistentBrandXYZ" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("PUT /api/vehicles/:id", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("allows an admin to partially update make, model, category, or price", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(vehicle);

    const res = await request(app)
      .put(`/api/vehicles/${created.body.id}`)
      .set("Authorization", admin.auth)
      .send({ price: 19999.99, make: "Honda" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: created.body.id,
      make: "Honda",
      model: vehicle.model,
      category: vehicle.category,
      price: 19999.99,
      quantity: vehicle.quantity,
    });
  });

  it("rejects updating quantity", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(vehicle);

    const res = await request(app)
      .put(`/api/vehicles/${created.body.id}`)
      .set("Authorization", admin.auth)
      .send({ quantity: 10 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("rejects an empty body", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(vehicle);

    const res = await request(app)
      .put(`/api/vehicles/${created.body.id}`)
      .set("Authorization", admin.auth)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("returns 404 for an unknown id", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const res = await request(app)
      .put("/api/vehicles/00000000-0000-0000-0000-000000000000")
      .set("Authorization", admin.auth)
      .send({ price: 10000 });

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid UUID", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const res = await request(app)
      .put("/api/vehicles/not-a-uuid")
      .set("Authorization", admin.auth)
      .send({ price: 10000 });

    expect(res.status).toBe(400);
  });
});
