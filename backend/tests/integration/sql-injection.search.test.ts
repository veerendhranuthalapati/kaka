import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { truncateTables } from "../helpers/db.js";
import { createTestUser } from "../helpers/auth.js";

const PAYLOADS = [
  "' OR 1=1 --",
  "%",
  "_",
  "\\",
  "\u0000",
  "🔥".repeat(200),
  "x".repeat(500),
];

describe("vehicle search SQL injection regression", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("accepts malicious search strings without server error", async () => {
    const app = createApp();
    const user = await createTestUser();

    for (const make of PAYLOADS) {
      const res = await request(app)
        .get("/api/vehicles/search")
        .query({ make })
        .set("Authorization", user.auth);
      expect(res.status).not.toBe(500);
      expect([200, 400]).toContain(res.status);
    }
  });
});
