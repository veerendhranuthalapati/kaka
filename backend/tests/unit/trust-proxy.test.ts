import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config/env.js";

const TEST_JWT_SECRET =
  "unit-test-jwt-secret-entropy-abcdefghijklmnop-99";
const TEST_ENV = {
  JWT_SECRET: TEST_JWT_SECRET,
  CORS_ORIGIN: "http://localhost:5173",
} as NodeJS.ProcessEnv;

describe("trust proxy parsing", () => {
  it("throws when TRUST_PROXY is 'true'", () => {
    expect(() =>
      loadConfig({ ...TEST_ENV, TRUST_PROXY: "true" }),
    ).toThrow();
  });

  it("throws when TRUST_PROXY is boolean true", () => {
    expect(() =>
      loadConfig({ ...TEST_ENV, TRUST_PROXY: true as unknown as string }),
    ).toThrow();
  });

  it("accepts unset/false/positive integer/IP string", () => {
    expect(
      loadConfig(TEST_ENV).trustProxy,
    ).toBe(false);
    expect(
      loadConfig({ ...TEST_ENV, TRUST_PROXY: "false" }).trustProxy,
    ).toBe(false);
    expect(
      loadConfig({ ...TEST_ENV, TRUST_PROXY: "1" }).trustProxy,
    ).toBe(1);
    expect(
      loadConfig({ ...TEST_ENV, TRUST_PROXY: "loopback" }).trustProxy,
    ).toBe("loopback");
  });
});
