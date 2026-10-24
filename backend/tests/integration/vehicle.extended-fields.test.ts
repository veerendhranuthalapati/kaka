import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { truncateTables } from "../helpers/db.js";
import { createTestUser } from "../helpers/auth.js";

const baseVehicle = {
  make: "Tesla",
  model: "Model 3",
  category: "EV",
  price: 42000,
  quantity: 2,
};

describe("vehicle extended optional fields", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("creates with seats, range, battery, description and features", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({
        ...baseVehicle,
        seats: 5,
        rangeKm: 420,
        batteryKwh: 75,
        description: "Comfortable electric sedan with strong range.",
        features: ["Heated seats", "Adaptive cruise", "Heated seats"],
        fuelType: "ELECTRIC",
      });

    expect(res.status).toBe(201);
    expect(res.body.seats).toBe(5);
    expect(res.body.rangeKm).toBe(420);
    expect(res.body.batteryKwh).toBe(75);
    expect(res.body.features).toEqual(["Heated seats", "Adaptive cruise"]);
    expect(res.body.description).toContain("electric");
  });

  it("rejects angle brackets in description", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({
        ...baseVehicle,
        description: "bad <script>",
      });

    expect(res.status).toBe(400);
  });

  it("returns extended fields in list and search raw SQL paths", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");

    await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({
        ...baseVehicle,
        make: "Hyundai",
        model: "Ioniq 5",
        seats: 5,
        rangeKm: 480,
        batteryKwh: 77.4,
        description: "Spacious EV crossover.",
        features: ["Vehicle-to-load"],
      });

    const list = await request(app)
      .get("/api/vehicles")
      .set("Authorization", user.auth);
    expect(list.body[0].batteryKwh).toBe(77.4);
    expect(list.body[0].features).toEqual(["Vehicle-to-load"]);

    const search = await request(app)
      .get("/api/vehicles/search?make=Hyundai")
      .set("Authorization", user.auth);
    expect(search.body[0].rangeKm).toBe(480);
  });

  it("clears extended fields on PUT with null and still rejects quantity", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({
        ...baseVehicle,
        seats: 5,
        description: "Keep me",
      });

    const updated = await request(app)
      .put(`/api/vehicles/${created.body.id}`)
      .set("Authorization", admin.auth)
      .send({ seats: null, description: null, features: [] });

    expect(updated.status).toBe(200);
    expect(updated.body.seats).toBeNull();
    expect(updated.body.description).toBeNull();
    expect(updated.body.features).toEqual([]);

    const qty = await request(app)
      .put(`/api/vehicles/${created.body.id}`)
      .set("Authorization", admin.auth)
      .send({ quantity: 5 });
    expect(qty.status).toBe(400);
  });
});
