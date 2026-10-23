import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";

describe("POST /api/auth/register", () => {
  it("rejects invalid email with 400", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email", password: "password1" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
    });
    expect(res.body.error.message).toEqual(expect.any(String));
  });

  it("rejects password shorter than 8 characters with 400", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "user@example.com", password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("rejects password over 72 UTF-8 bytes with 400", async () => {
    const app = createApp();
    const password = "😀".repeat(20);
    expect(Buffer.byteLength(password, "utf8")).toBeGreaterThan(72);
    expect(password.length).toBeLessThan(72);

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "user@example.com", password });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("rejects unknown fields such as role with 400", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "user@example.com",
        password: "password1",
        role: "ADMIN",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("creates a USER and returns token without passwordHash", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "newuser@example.com", password: "password1" });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      email: "newuser@example.com",
      role: "USER",
    });
    expect(res.body.user.id).toEqual(expect.any(String));
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.token).toEqual(expect.any(String));
  });
});
