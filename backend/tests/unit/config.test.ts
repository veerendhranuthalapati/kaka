import { afterEach, describe, expect, it, vi } from "vitest";

const originalSecret = process.env.JWT_SECRET;

function restoreSecret(): void {
  if (originalSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalSecret;
  }
}

describe("config", () => {
  afterEach(() => {
    restoreSecret();
    vi.resetModules();
  });

  it("throws when JWT_SECRET is missing or shorter than 32 characters", async () => {
    delete process.env.JWT_SECRET;
    process.env.CORS_ORIGIN = "http://localhost:5173";
    vi.resetModules();
    await expect(import("../../src/config/env.js")).rejects.toThrow(
      /JWT_SECRET/,
    );

    process.env.JWT_SECRET = "too-short";
    vi.resetModules();
    await expect(import("../../src/config/env.js")).rejects.toThrow(
      /JWT_SECRET/,
    );
  });
});
