import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";
import { createTestUser } from "../helpers/auth.js";
import { truncateTables } from "../helpers/db.js";

describe("vehicle GET cache headers and ETag", () => {
  const app = createApp();

  it("sets private no-cache and returns 304 on matching If-None-Match", async () => {
    await truncateTables();
    const user = await createTestUser("USER");
    const vehicle = await prisma.vehicle.create({
      data: {
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 1000,
        quantity: 1,
      },
    });

    const first = await request(app)
      .get("/api/vehicles")
      .set("Authorization", user.auth);
    expect(first.status).toBe(200);
    expect(first.headers["cache-control"]).toBe("private, no-cache");
    const etag = first.headers.etag;
    expect(etag).toBeTruthy();

    const second = await request(app)
      .get("/api/vehicles")
      .set("Authorization", user.auth)
      .set("If-None-Match", etag);
    expect(second.status).toBe(304);

    const one = await request(app)
      .get(`/api/vehicles/${vehicle.id}`)
      .set("Authorization", user.auth);
    expect(one.headers["cache-control"]).toBe("private, no-cache");
  });
});
