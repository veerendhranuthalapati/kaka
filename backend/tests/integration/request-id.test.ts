import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";

describe("X-Request-Id", () => {
  const app = createApp({ globalMax: 1000 });

  it("generates and echoes a request id", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("accepts a valid inbound request id", async () => {
    const inbound = "abcd1234-efgh-5678";
    const res = await request(app)
      .get("/health")
      .set("X-Request-Id", inbound);
    expect(res.headers["x-request-id"]).toBe(inbound);
  });

  it("rejects malformed inbound ids", async () => {
    const res = await request(app)
      .get("/health")
      .set("X-Request-Id", "short");
    expect(res.headers["x-request-id"]).not.toBe("short");
  });
});
