import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { truncateTables } from "../helpers/db.js";

const EMAIL = "login@example.com";
const PASSWORD = "password1";

async function registerUser(app: ReturnType<typeof createApp>): Promise<void> {
  await request(app)
    .post("/api/auth/register")
    .send({ email: EMAIL, password: PASSWORD });
}

describe("POST /api/auth/login", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("returns the same 401 INVALID_CREDENTIALS for unknown email and wrong password", async () => {
    const app = createApp();
    await registerUser(app);

    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "missing@example.com", password: PASSWORD });
    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: EMAIL, password: "wrong-password" });

    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
    expect(unknownEmail.body.error).toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
    expect(unknownEmail.body.error.message).toEqual(expect.any(String));
  });
});
