import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { truncateTables } from "../helpers/db.js";
import { createTestUser } from "../helpers/auth.js";

describe("vehicle imageUrl", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("stores imageUrl on create and returns it in list and search with numeric price", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");
    const imageUrl = "/cars/demo-sedan.svg";

    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({
        make: "Aurora",
        model: "LX",
        category: "Sedan",
        price: 28999.5,
        quantity: 2,
        imageUrl,
      });

    expect(created.status).toBe(201);
    expect(created.body.imageUrl).toBe(imageUrl);
    expect(typeof created.body.price).toBe("number");

    const list = await request(app)
      .get("/api/vehicles")
      .set("Authorization", user.auth);
    expect(list.status).toBe(200);
    const listed = list.body.find(
      (vehicle: { id: string }) => vehicle.id === created.body.id,
    );
    expect(listed?.imageUrl).toBe(imageUrl);

    const search = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", user.auth)
      .query({ category: "Sedan" });
    expect(search.status).toBe(200);
    const found = search.body.find(
      (vehicle: { id: string }) => vehicle.id === created.body.id,
    );
    expect(found?.imageUrl).toBe(imageUrl);
    expect(typeof found?.price).toBe("number");
  });

  it("allows partial update of imageUrl and rejects invalid values", async () => {
    const app = createApp();
    const admin = await createTestUser("ADMIN");

    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", admin.auth)
      .send({
        make: "Trail",
        model: "X",
        category: "SUV",
        price: 10000,
        quantity: 1,
      });

    const updated = await request(app)
      .put(`/api/vehicles/${created.body.id}`)
      .set("Authorization", admin.auth)
      .send({ imageUrl: "https://images.example.dev/trail.jpg" });

    expect(updated.status).toBe(200);
    expect(updated.body.imageUrl).toBe("https://images.example.dev/trail.jpg");

    const bad = await request(app)
      .put(`/api/vehicles/${created.body.id}`)
      .set("Authorization", admin.auth)
      .send({ imageUrl: "http://bad.example/x.jpg" });

    expect(bad.status).toBe(400);
  });
});
