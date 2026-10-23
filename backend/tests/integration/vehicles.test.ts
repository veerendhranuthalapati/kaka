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
});
