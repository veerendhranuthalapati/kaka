import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";

const badLogin = {
  email: "nobody@example.com",
  password: "wrong-password",
};

describe("POST /api/auth/login rate limiting", () => {
  it("returns 429 with the error envelope after too many failed logins", async () => {
    const app = createApp({
      authRateLimitMax: 3,
      authRateLimitWindowMs: 60_000,
    });

    const attempts = [];
    for (let index = 0; index < 3; index += 1) {
      attempts.push(
        await request(app).post("/api/auth/login").send(badLogin),
      );
    }
    const limited = await request(app)
      .post("/api/auth/login")
      .send(badLogin);

    expect(attempts.map((res) => res.status)).toEqual([401, 401, 401]);
    expect(limited.status).toBe(429);
    expect(limited.body.error).toMatchObject({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests",
    });
  });

  it("keys the limiter on the trusted client IP", async () => {
    const app = createApp({
      authRateLimitMax: 3,
      authRateLimitWindowMs: 60_000,
      trustProxy: 1,
    });

    for (let index = 0; index < 3; index += 1) {
      const res = await request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", "203.0.113.10")
        .send(badLogin);
      expect(res.status).toBe(401);
    }

    const limited = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "203.0.113.10")
      .send(badLogin);
    const otherClient = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "203.0.113.11")
      .send(badLogin);

    expect(limited.status).toBe(429);
    expect(otherClient.status).toBe(401);
  });

  it("ignores spoofed X-Forwarded-For when trust proxy is disabled", async () => {
    const app = createApp({
      authRateLimitMax: 3,
      authRateLimitWindowMs: 60_000,
    });

    for (let index = 0; index < 3; index += 1) {
      const res = await request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", `198.51.100.${index + 1}`)
        .send(badLogin);
      expect(res.status).toBe(401);
    }

    const spoofed = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "198.51.100.99")
      .send(badLogin);

    expect(spoofed.status).toBe(429);
  });
});
