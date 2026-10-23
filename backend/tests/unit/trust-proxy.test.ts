import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config/env.js";

describe("trust proxy parsing", () => {
  it("throws when TRUST_PROXY is 'true'", () => {
    expect(() =>
      loadConfig({ JWT_SECRET: "x".repeat(32), TRUST_PROXY: "true" } as NodeJS.ProcessEnv),
    ).toThrow();
  });

  it("throws when TRUST_PROXY is boolean true", () => {
    expect(() =>
      loadConfig({ JWT_SECRET: "x".repeat(32), TRUST_PROXY: true as unknown as string }),
    ).toThrow();
  });

  it("accepts unset/false/positive integer/IP string", () => {
    expect(loadConfig({ JWT_SECRET: "x".repeat(32) } as NodeJS.ProcessEnv).trustProxy).toBe(false);
    expect(loadConfig({ JWT_SECRET: "x".repeat(32), TRUST_PROXY: "false" } as NodeJS.ProcessEnv).trustProxy).toBe(false);
    expect(loadConfig({ JWT_SECRET: "x".repeat(32), TRUST_PROXY: "1" } as NodeJS.ProcessEnv).trustProxy).toBe(1);
    expect(loadConfig({ JWT_SECRET: "x".repeat(32), TRUST_PROXY: "loopback" } as NodeJS.ProcessEnv).trustProxy).toBe("loopback");
  });
});
