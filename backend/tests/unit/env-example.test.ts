import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config/env.js";

const CONFIG_KEYS = [
  "JWT_SECRET",
  "PORT",
  "CORS_ORIGIN",
  "TRUST_PROXY",
  "AUTH_RATE_LIMIT_MAX",
  "AUTH_RATE_LIMIT_WINDOW_MS",
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

  it("contains values that pass configuration validation", () => {
    const parsed = loadConfig(exampleValues as NodeJS.ProcessEnv);

    expect(parsed.jwtSecret.length).toBeGreaterThanOrEqual(32);
    expect(parsed.port).toBeGreaterThan(0);
    expect(parsed.authRateLimitMax).toBeGreaterThan(0);
  });
});
