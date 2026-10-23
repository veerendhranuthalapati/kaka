import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { signToken } from "../src/lib/jwt.js";
import { truncateTables } from "./helpers/db.js";
import { createUser } from "./helpers/auth.js";

describe("authorization matrix", () => {
  const app = createApp({ authRateLimitMax: 1000, authRateLimitWindowMs: 60000 });

  async function getSeededVehicleId(): Promise<string> {
    const vehicle = await prisma.vehicle.findFirst({ where: { isActive: true } });
    if (vehicle) return vehicle.id;
    const created = await prisma.vehicle.create({
      data: {
        make: "Test",
        model: "Auth",
        year: 2020,
        category: "Sedan",
        priceCents: 100000,
        quantity: 1,
        isActive: true,
      },
    });
    return created.id;
  }

  it("enforces route permissions for all vehicle/auth routes", async () => {
    await truncateTables();
    await prisma.user.deleteMany();
    await prisma.vehicle.deleteMany();

    const admin = await createUser({ role: "ADMIN" });
    const user = await createUser({ role: "USER" });
    const adminToken = signToken({ sub: admin.id, role: admin.role, email: admin.email });
    const userToken = signToken({ sub: user.id, role: user.role, email: user.email });

    const vId = await getSeededVehicleId();

    // register/login public
    const regNo = await request(app).post("/api/auth/register").send({
      email: `u${Date.now()}@test.com`,
      password: "password123",
    });
    expect([200, 201]).toContain(regNo.status);

    const loginNo = await request(app).post("/api/auth/login").send({
      email: admin.email,
      password: "password123",
    });
    expect([200]).toContain(loginNo.status);

    // vehicles list/search/purchase any authenticated
    const listNo = await request(app).get("/api/vehicles");
    expect([401]).toContain(listNo.status);
    const listU = await request(app).get("/api/vehicles").set("Authorization", `Bearer ${userToken}`);
    expect(listU.status).toBe(200);
    const listA = await request(app).get("/api/vehicles").set("Authorization", `Bearer ${adminToken}`);
    expect(listA.status).toBe(200);

    const searchNo = await request(app).get("/api/vehicles/search").query({ make: "test" });
    expect([401]).toContain(searchNo.status);
    const searchU = await request(app).get("/api/vehicles/search").query({ make: "Test" }).set("Authorization", `Bearer ${userToken}`);
    expect(searchU.status).toBe(200);

    const purchNo = await request(app).post(`/api/vehicles/${vId}/purchase`);
    expect([401]).toContain(purchNo.status);
    // reset stock
    await prisma.vehicle.update({ where: { id: vId }, data: { quantity: 5 } });
    const purchU = await request(app).post(`/api/vehicles/${vId}/purchase`).set("Authorization", `Bearer ${userToken}`);
    expect([200, 409]).toContain(purchU.status);
    const purchA = await request(app).post(`/api/vehicles/${vId}/purchase`).set("Authorization", `Bearer ${adminToken}`);
    expect([200, 409]).toContain(purchA.status);

    // write/admin routes
    const createNo = await request(app).post("/api/vehicles").send({});
    expect([401]).toContain(createNo.status);
    const createU = await request(app).post("/api/vehicles").send({}).set("Authorization", `Bearer ${userToken}`);
    expect([403]).toContain(createU.status);
    const createA = await request(app).post("/api/vehicles").set("Authorization", `Bearer ${adminToken}`).send({
      make: "New",
      model: "Car",
      year: 2024,
      category: "SUV",
      priceCents: 50000,
      quantity: 2,
    });
    expect([201]).toContain(createA.status);
    const created = createA.body;

    const updateNo = await request(app).put(`/api/vehicles/${created.id}`).send({ model: "X" });
    expect([401]).toContain(updateNo.status);
    const updateU = await request(app).put(`/api/vehicles/${created.id}`).send({ model: "X" }).set("Authorization", `Bearer ${userToken}`);
    expect([403]).toContain(updateU.status);
    const updateA = await request(app).put(`/api/vehicles/${created.id}`).send({ model: "Y" }).set("Authorization", `Bearer ${adminToken}`);
    expect([200]).toContain(updateA.status);

    const restockNo = await request(app).post(`/api/vehicles/${created.id}/restock`).send({ amount: 1 });
    expect([401]).toContain(restockNo.status);
    const restockU = await request(app).post(`/api/vehicles/${created.id}/restock`).send({ amount: 1 }).set("Authorization", `Bearer ${userToken}`);
    expect([403]).toContain(restockU.status);
    const restockA = await request(app).post(`/api/vehicles/${created.id}/restock`).send({ amount: 3 }).set("Authorization", `Bearer ${adminToken}`);
    expect([200]).toContain(restockA.status);

    const delNo = await request(app).delete(`/api/vehicles/${created.id}`);
    expect([401]).toContain(delNo.status);
    const delU = await request(app).delete(`/api/vehicles/${created.id}`).set("Authorization", `Bearer ${userToken}`);
    expect([403]).toContain(delU.status);
    const delA = await request(app).delete(`/api/vehicles/${created.id}`).set("Authorization", `Bearer ${adminToken}`);
    expect([204]).toContain(delA.status);
  });
});
