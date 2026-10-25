import { describe, expect, it } from "vitest";
import { assertProductionConfig } from "../../src/config/productionGuards.js";
import { loadConfig } from "../../src/config/env.js";

const BASE_PROD = {
  NODE_ENV: "production",
  JWT_SECRET: "a".repeat(48),
  BCRYPT_COST: "12",
  CORS_ORIGIN: "https://app.example.com",
  TRUST_PROXY: "1",
  DATABASE_URL: "postgresql://u:p@db.example.com:5432/app?sslmode=require",
} as NodeJS.ProcessEnv;

describe("production config guards", () => {
  it("requires https CORS origins", () => {
    expect(() =>
      assertProductionConfig({
        ...BASE_PROD,
        CORS_ORIGIN: "http://insecure.example.com",
      }),
    ).toThrow(/https/i);
  });

  it("requires explicit TRUST_PROXY", () => {
    expect(() =>
      assertProductionConfig({ ...BASE_PROD, TRUST_PROXY: "false" }),
    ).toThrow(/TRUST_PROXY/i);
  });

  it("requires DATABASE_URL sslmode unless opt-out", () => {
    expect(() =>
      assertProductionConfig({
        ...BASE_PROD,
        DATABASE_URL: "postgresql://u:p@db.example.com:5432/app",
      }),
    ).toThrow(/sslmode/i);
    expect(() =>
      assertProductionConfig({
        ...BASE_PROD,
        DATABASE_URL: "postgresql://u:p@db.example.com:5432/app",
        DATABASE_SSL_OPTOUT: "true",
      }),
    ).not.toThrow();
  });

  it("requires JWT_SECRET length 48+ and BCRYPT_COST 12+", () => {
    expect(() =>
      assertProductionConfig({ ...BASE_PROD, JWT_SECRET: "b".repeat(40) }),
    ).toThrow(/JWT_SECRET/i);
    expect(() =>
      assertProductionConfig({ ...BASE_PROD, BCRYPT_COST: "10" }),
    ).toThrow(/BCRYPT_COST/i);
  });

  it("rejects RATE_LIMIT_DISABLED in production", () => {
    expect(() =>
      assertProductionConfig({ ...BASE_PROD, RATE_LIMIT_DISABLED: "true" }),
    ).toThrow(/RATE_LIMIT_DISABLED/i);
  });

  it("never includes secret values in thrown messages", () => {
    const secret = "super-secret-value-123456789012345678901234";
    try {
      assertProductionConfig({ ...BASE_PROD, JWT_SECRET: secret.slice(0, 10) });
    } catch (error) {
      expect(String(error)).not.toContain(secret);
    }
  });
});

describe("loadConfig CORS parsing", () => {
  it("accepts comma-separated origins", () => {
    const cfg = loadConfig({
      JWT_SECRET: "vitest-jwt-secret-entropy-abcdefgh-0123456789-xy",
      CORS_ORIGIN: "http://localhost:5173,http://127.0.0.1:5173",
    } as NodeJS.ProcessEnv);
    expect(cfg.corsOrigins).toEqual([
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ]);
  });
});
