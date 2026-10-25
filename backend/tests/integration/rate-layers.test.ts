import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { truncateTables } from "../helpers/db.js";
import { createTestUser } from "../helpers/auth.js";
import { TEST_USER_PASSWORD } from "../helpers/passwords.js";

describe("rate limit layers", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("returns 429 with Retry-After on global limit (health excluded)", async () => {
    const app = createApp({ globalMax: 2, globalWindowMs: 60_000, authMax: 1000 });
    await request(app).get("/api/vehicles");
    await request(app).get("/api/vehicles");
    const limited = await request(app).get("/api/vehicles");
    expect(limited.status).toBe(429);
    expect(limited.headers["retry-after"]).toBeDefined();
    expect(limited.body.error.code).toBe("TOO_MANY_REQUESTS");

    const health = await request(app).get("/health");
    expect(health.status).toBe(200);
  });

  it("limits write mutations per authenticated user", async () => {
    const app = createApp({
      writeMax: 1,
      writeWindowMs: 60_000,
      globalMax: 10_000,
      authMax: 10_000,
    });
    const admin = await createTestUser("ADMIN");
    const vehicle = {
      make: "Rate",
      model: "Limit",
      category: "Sedan",
      price: 1000,
      quantity: 1,
    };
    const first = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send(vehicle);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({ ...vehicle, model: "Limit2" });
    expect(second.status).toBe(429);
  });
});
