import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";

describe("Backend Error Envelope Standards", () => {
  it("returns 404 with standard error envelope for unknown routes", async () => {
    const app = createApp();
    const res = await request(app).get("/api/unknown-endpoint");

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    });
  });

  it("returns 400 with standard error envelope for malformed JSON", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send('{"email": "broken-json');

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body.error).toMatchObject({
      code: "INVALID_JSON",
    });
  });
});
