import express from "express";
import helmet from "helmet";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildHelmetOptions } from "../../src/config/helmetOptions.js";
import { createApp } from "../../src/app.js";
import { errorHandler } from "../../src/middleware/errorHandler.js";
import { createTestUser } from "../helpers/auth.js";

const HEADER_CHECKS = [
  "content-security-policy",
  "x-content-type-options",
  "referrer-policy",
  "cross-origin-opener-policy",
  "cross-origin-resource-policy",
  "permissions-policy", // Helmet + explicit Permissions-Policy middleware
  "vary",
];

function expectSecurityHeaders(res: request.Response): void {
  for (const name of HEADER_CHECKS) {
    expect(res.headers[name]).toBeDefined();
  }
  expect(res.headers["x-powered-by"]).toBeUndefined();
  expect(res.headers["content-security-policy"]).toMatch(/default-src 'none'/);
}

describe("security headers", () => {
  it("applies headers on 200, 401, 404, 429, and 500", async () => {
    const app = createApp({ globalMax: 2, globalWindowMs: 60_000 });
    const health = await request(app).get("/health");
    expectSecurityHeaders(health);
    expect(health.status).toBe(200);

    const unauthorized = await request(app).get("/api/vehicles");
    expectSecurityHeaders(unauthorized);
    expect(unauthorized.status).toBe(401);

    const notFound = await request(app).get("/api/missing-route");
    expectSecurityHeaders(notFound);
    expect(notFound.status).toBe(404);

    await request(app).get("/api/vehicles");
    await request(app).get("/api/vehicles");
    const limited = await request(app).get("/api/vehicles");
    expectSecurityHeaders(limited);
    expect(limited.status).toBe(429);
    expect(limited.headers["retry-after"]).toBeDefined();

    const boomApp = express();
    boomApp.use(helmet(buildHelmetOptions("test")));
    boomApp.use((_req, res, next) => {
      res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()",
      );
      res.setHeader("Vary", "Origin");
      next();
    });
    boomApp.get("/boom", () => {
      throw new Error("boom");
    });
    boomApp.use(errorHandler);
    const serverError = await request(boomApp).get("/boom");
    expectSecurityHeaders(serverError);
    expect(serverError.status).toBe(500);
  });

  it("sets Cache-Control no-store on /api/auth responses", async () => {
    const app = createApp({ authMax: 1000 });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nope@example.com", password: "wrong-pass-9!" });
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("sets private no-cache on authenticated vehicle responses", async () => {
    const app = createApp();
    const user = await createTestUser();
    const res = await request(app)
      .get("/api/vehicles")
      .set("Authorization", user.auth);
    expect(res.headers["cache-control"]).toBe("private, no-cache");
  });
});
