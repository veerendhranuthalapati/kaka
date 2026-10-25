import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { truncateTables } from "../helpers/db.js";
import { createTestUser } from "../helpers/auth.js";

describe("POST /api/auth/logout", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("returns 204 and revokes existing tokens", async () => {
    const app = createApp();
    const user = await createTestUser();

    const logout = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", user.auth);
    expect(logout.status).toBe(204);

    const list = await request(app)
      .get("/api/vehicles")
      .set("Authorization", user.auth);
    expect(list.status).toBe(401);
  });
});
