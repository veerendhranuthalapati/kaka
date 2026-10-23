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
});

describe("GET /api/vehicles", () => {
  afterEach(async () => {
    await truncateTables();
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
