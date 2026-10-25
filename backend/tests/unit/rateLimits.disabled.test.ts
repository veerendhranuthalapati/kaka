import { describe, expect, it, vi } from "vitest";
import {
  createAuthRateLimiter,
  createGlobalRateLimiter,
  createWriteRateLimiter,
} from "../../src/middleware/rateLimits.js";

describe("rate limiters when disabled", () => {
  it("passes through without limiting", async () => {
    const global = createGlobalRateLimiter({ disabled: true });
    const auth = createAuthRateLimiter({ disabled: true });
    const write = createWriteRateLimiter({ disabled: true });

    const next = vi.fn();
    const req = { path: "/api/x", ip: "1.2.3.4" } as never;
    const res = {} as never;

    global(req, res, next);
    auth(req, res, next);
    write(req, res, next);
    expect(next).toHaveBeenCalledTimes(3);
  });
});
