import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app.js";
import { loginThrottleStore } from "../../src/middleware/loginThrottle.js";
import { truncateTables } from "../helpers/db.js";
import { TEST_USER_PASSWORD } from "../helpers/passwords.js";

describe("login throttling", () => {
  beforeEach(() => {
    loginThrottleStore.reset();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(async () => {
    vi.useRealTimers();
    loginThrottleStore.reset();
    await truncateTables();
  });

  it("returns identical 429 bodies for unknown and known emails when blocked", async () => {
    const app = createApp({ authRateLimitMax: 10_000 });
    await request(app)
      .post("/api/auth/register")
      .send({ email: "known@example.com", password: TEST_USER_PASSWORD });

    async function blockLogin(email: string) {
      for (let i = 0; i < 5; i += 1) {
        await request(app)
          .post("/api/auth/login")
          .send({ email, password: "wrong-pass-9!" });
      }
      return request(app)
        .post("/api/auth/login")
        .send({ email, password: TEST_USER_PASSWORD });
    }

    const knownBlocked = await blockLogin("known@example.com");
    loginThrottleStore.reset();
    const unknownBlocked = await blockLogin("unknown@example.com");

    expect(knownBlocked.status).toBe(429);
    expect(unknownBlocked.status).toBe(429);
    expect(knownBlocked.body).toEqual(unknownBlocked.body);
    expect(knownBlocked.headers["retry-after"]).toBeDefined();
  });
});
