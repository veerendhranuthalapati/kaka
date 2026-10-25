import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { TEST_USER_PASSWORD } from "../helpers/passwords.js";

describe("input hardening", () => {
  const app = createApp({ authRateLimitMax: 1000 });

  it("returns 415 for non-JSON content types on bodies", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "text/plain")
      .send("email=a@b.com&password=x");
    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("returns 413 for oversized JSON bodies", async () => {
    const huge = JSON.stringify({
      email: "a@example.com",
      password: TEST_USER_PASSWORD,
      pad: "x".repeat(20_000),
    });
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send(huge);
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("rejects duplicate query keys and nested query strings", async () => {
    const dup = await request(app).get("/api/vehicles?make=a&make=b");
    expect(dup.status).toBe(400);

    const nested = await request(app).get("/api/vehicles/search?a[b]=c");
    expect(nested.status).toBe(400);
  });

  it("rejects prototype pollution keys in JSON bodies", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send(
        `{"email":"pollute@example.com","password":"${TEST_USER_PASSWORD}","constructor":"evil"}`,
      );
    expect(res.status).toBe(400);
  });
});
