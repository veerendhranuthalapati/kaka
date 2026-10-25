import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config/env.js";

const CONFIG_KEYS = [
  "JWT_SECRET",
  "JWT_ISSUER",
  "JWT_AUDIENCE",
  "BCRYPT_COST",
  "PORT",
  "CORS_ORIGIN",
  "TRUST_PROXY",
  "AUTH_RATE_LIMIT_MAX",
  "AUTH_RATE_LIMIT_WINDOW_MS",
  "LOGIN_FAIL_MAX_IP_EMAIL",
  "LOGIN_FAIL_WINDOW_MS",
  "LOGIN_FAIL_MAX_EMAIL",
  "LOGIN_LOCKOUT_MS",
  "LOGIN_STORE_MAX_KEYS",
  "GLOBAL_RATE_LIMIT_MAX",
  "GLOBAL_RATE_LIMIT_WINDOW_MS",
  "WRITE_RATE_LIMIT_MAX",
  "WRITE_RATE_LIMIT_WINDOW_MS",
  "RATE_LIMIT_DISABLED",
  "REQUEST_TIMEOUT_MS",
  "HEADERS_TIMEOUT_MS",
  "KEEP_ALIVE_TIMEOUT_MS",
  "DATABASE_SSL_OPTOUT",
] as const;

const example = readFileSync(
  new URL("../../.env.example", import.meta.url),
  "utf8",
);

function parseExample(source: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }
    values[trimmed.slice(0, separator)] = trimmed.slice(separator + 1);
  }
  return values;
}

const exampleValues = parseExample(example);

describe(".env.example", () => {
  it("documents every environment key the app reads", () => {
    const documentedKeys = new Set(Object.keys(exampleValues));
    const missing = CONFIG_KEYS.filter((key) => !documentedKeys.has(key));

    expect(missing).toEqual([]);
  });

  it("rejects the documented JWT_SECRET when copied verbatim from the example", () => {
    expect(() => loadConfig(exampleValues as NodeJS.ProcessEnv)).toThrow(
      /JWT_SECRET/,
    );
  });

  it("contains non-secret values that pass configuration validation", () => {
    const parsed = loadConfig({
      ...exampleValues,
      JWT_SECRET: process.env.JWT_SECRET,
    } as NodeJS.ProcessEnv);

    expect(parsed.jwtSecret.length).toBeGreaterThanOrEqual(32);
    expect(parsed.port).toBeGreaterThan(0);
    expect(parsed.authRateLimitMax).toBeGreaterThan(0);
    expect(parsed.bcryptCost).toBeGreaterThanOrEqual(10);
  });
});
