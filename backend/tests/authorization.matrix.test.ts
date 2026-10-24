import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { truncateTables } from "./helpers/db.js";
import { createTestUser } from "./helpers/auth.js";

describe("authorization matrix", () => {
  const app = createApp({ authRateLimitMax: 1000, authRateLimitWindowMs: 60000 });

  it("enforces route permissions for all vehicle/auth routes", async () => {
    await truncateTables();
    await prisma.user.deleteMany();
    await prisma.vehicle.deleteMany();

    const admin = await createTestUser("ADMIN");
    const user = await createTestUser("USER");
    const adminToken = admin.auth.replace("Bearer ", "");
    const userToken = user.auth.replace("Bearer ", "");

    const seeded = await prisma.vehicle.create({
      data: {
        make: "Test",
        model: "Auth",
        category: "Sedan",
        price: 1000,
        quantity: 2,
      },
    });
    const vId = seeded.id;

    const regNo = await request(app).post("/api/auth/register").send({
      email: `u${Date.now()}@test.com`,
      password: "password123456",
    });
    expect(regNo.status).toBe(201);

    const loginBad = await request(app).post("/api/auth/login").send({
      email: "nope@example.com",
      password: "wrongpassword123",
    });
    expect(loginBad.status).toBe(401);

    const listNo = await request(app).get("/api/vehicles");
    expect(listNo.status).toBe(401);
    const listU = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`);
    expect(listU.status).toBe(200);
    const listA = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(listA.status).toBe(200);

    const searchNo = await request(app)
      .get("/api/vehicles/search")
      .query({ make: "test" });
    expect(searchNo.status).toBe(401);
    const searchU = await request(app)
      .get("/api/vehicles/search")
      .query({ make: "Test" })
      .set("Authorization", `Bearer ${userToken}`);
    expect(searchU.status).toBe(200);

    const getOneNo = await request(app).get(`/api/vehicles/${vId}`);
    expect(getOneNo.status).toBe(401);
    const getOneU = await request(app)
      .get(`/api/vehicles/${vId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(getOneU.status).toBe(200);
    const getOneA = await request(app)
      .get(`/api/vehicles/${vId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(getOneA.status).toBe(200);

    const purchNo = await request(app).post(`/api/vehicles/${vId}/purchase`);
    expect(purchNo.status).toBe(401);

    await prisma.vehicle.update({ where: { id: vId }, data: { quantity: 2 } });
    const purchU = await request(app)
      .post(`/api/vehicles/${vId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(purchU.status).toBe(200);
    const purchA = await request(app)
      .post(`/api/vehicles/${vId}/purchase`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(purchA.status).toBe(200);
    const purchOut = await request(app)
      .post(`/api/vehicles/${vId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(purchOut.status).toBe(409);

    const createNo = await request(app).post("/api/vehicles").send({});
    expect(createNo.status).toBe(401);
    const createU = await request(app)
      .post("/api/vehicles")
      .send({})
      .set("Authorization", `Bearer ${userToken}`);
    expect(createU.status).toBe(403);
    const createA = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "New",
        model: "Car",
        category: "SUV",
        price: 50000,
        quantity: 2,
      });
    expect(createA.status).toBe(201);
    const created = createA.body;

    const updateNo = await request(app)
      .put(`/api/vehicles/${created.id}`)
      .send({ model: "X" });
    expect(updateNo.status).toBe(401);
    const updateU = await request(app)
      .put(`/api/vehicles/${created.id}`)
      .send({ model: "X" })
      .set("Authorization", `Bearer ${userToken}`);
    expect(updateU.status).toBe(403);
    const updateA = await request(app)
      .put(`/api/vehicles/${created.id}`)
      .send({ model: "Y" })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(updateA.status).toBe(200);

    const restockNo = await request(app)
      .post(`/api/vehicles/${created.id}/restock`)
      .send({ amount: 1 });
    expect(restockNo.status).toBe(401);
    const restockU = await request(app)
      .post(`/api/vehicles/${created.id}/restock`)
      .send({ amount: 1 })
      .set("Authorization", `Bearer ${userToken}`);
    expect(restockU.status).toBe(403);
    const restockA = await request(app)
      .post(`/api/vehicles/${created.id}/restock`)
      .send({ amount: 3 })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(restockA.status).toBe(200);

    const delNo = await request(app).delete(`/api/vehicles/${created.id}`);
    expect(delNo.status).toBe(401);
    const delU = await request(app)
      .delete(`/api/vehicles/${created.id}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(delU.status).toBe(403);
    const delA = await request(app)
      .delete(`/api/vehicles/${created.id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(delA.status).toBe(204);
  });
});
