import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";

describe("CORS", () => {
  const app = createApp({ authMax: 1000, globalMax: 1000 });

  it("reflects allowed origins and supports preflight", async () => {
    const preflight = await request(app)
      .options("/api/vehicles")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "GET")
      .set("Access-Control-Request-Headers", "Authorization, Content-Type");

    expect(preflight.status).toBe(204);
    expect(preflight.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(preflight.headers["access-control-allow-methods"]).toMatch(/GET/);
    expect(preflight.headers["access-control-max-age"]).toBe("600");
    expect(preflight.headers["access-control-allow-credentials"]).toBeUndefined();
  });

  it("omits CORS headers for disallowed origins", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "https://evil.example.com");
    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
