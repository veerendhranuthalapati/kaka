import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";
import { truncateTables } from "../helpers/db.js";
import { TEST_USER_PASSWORD } from "../helpers/passwords.js";

describe("email normalization", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("treats differing case as one account and allows login with any casing", async () => {
    const app = createApp({ authRateLimitMax: 1000 });
    const register = await request(app)
      .post("/api/auth/register")
      .send({ email: "A@x.com", password: TEST_USER_PASSWORD });
    expect(register.status).toBe(201);
    expect(register.body.user.email).toBe("a@x.com");

    const duplicate = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@x.com", password: TEST_USER_PASSWORD });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("EMAIL_TAKEN");

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "A@x.com", password: TEST_USER_PASSWORD });
    expect(login.status).toBe(200);

    const stored = await prisma.user.findUnique({ where: { email: "a@x.com" } });
    expect(stored).not.toBeNull();
  });
});
