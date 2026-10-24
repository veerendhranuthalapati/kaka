import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { truncateTables } from "../helpers/db.js";
import { createTestUser } from "../helpers/auth.js";

const vehicleBody = {
  make: "Toyota",
  model: "Corolla",
  category: "Sedan",
  price: 25000,
  quantity: 2,
};

function expectValidIsoTimestamp(value: unknown): void {
  expect(typeof value).toBe("string");
  const parsed = Date.parse(value as string);
  expect(Number.isNaN(parsed)).toBe(false);
  expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
}

describe("vehicle API timestamps", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("returns valid ISO createdAt and updatedAt on create", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(vehicleBody);

    expect(res.status).toBe(201);
    expectValidIsoTimestamp(res.body.createdAt);
    expectValidIsoTimestamp(res.body.updatedAt);
  });

  it("returns valid ISO timestamps on list", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");

    await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(vehicleBody);

    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", user.auth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expectValidIsoTimestamp(res.body[0].createdAt);
    expectValidIsoTimestamp(res.body[0].updatedAt);
  });

  it("returns valid ISO timestamps on search (category-only raw SQL path)", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");

    await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(vehicleBody);

    const res = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", user.auth)
      .query({ category: "Sedan" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expectValidIsoTimestamp(res.body[0].createdAt);
    expectValidIsoTimestamp(res.body[0].updatedAt);
  });

  it("returns valid ISO timestamps on search with make/model filters", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");

    await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(vehicleBody);

    const res = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", user.auth)
      .query({ make: "Toy", model: "Cor" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expectValidIsoTimestamp(res.body[0].createdAt);
    expectValidIsoTimestamp(res.body[0].updatedAt);
  });

  it("returns valid ISO timestamps on GET one and PUT update", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");

    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(vehicleBody);

    const getOne = await request(app)
      .get(`/api/vehicles/${created.body.id}`)
      .set("Authorization", user.auth);
    expect(getOne.status).toBe(200);
    expectValidIsoTimestamp(getOne.body.createdAt);
    expectValidIsoTimestamp(getOne.body.updatedAt);

    const updated = await request(app)
      .put(`/api/vehicles/${created.body.id}`)
      .set("Authorization", admin.auth)
      .send({ model: "Camry" });
    expect(updated.status).toBe(200);
    expectValidIsoTimestamp(updated.body.createdAt);
    expectValidIsoTimestamp(updated.body.updatedAt);
  });
});
