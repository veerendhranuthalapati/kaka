import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import {
  applyEnvTemplate,
  generateSecret,
  isValidGeneratedSecret,
  planSetupEnv,
} from "../../scripts/setup-env.lib.mjs";

describe("generateSecret", () => {
  it("returns base64 of the requested byte length with valid charset", () => {
    const secret = generateSecret(48);
    expect(secret.length).toBeGreaterThanOrEqual(64);
    expect(isValidGeneratedSecret(secret, 48)).toBe(true);
  });

  it("returns different values on successive calls", () => {
    const a = generateSecret(32);
    const b = generateSecret(32);
    expect(a).not.toBe(b);
  });
});

describe("planSetupEnv", () => {
  const roots: string[] = [];

  afterEach(() => {
    for (const root of roots) {
      rmSync(root, { recursive: true, force: true });
    }
    roots.length = 0;
  });

  it("refuses to overwrite an existing .env file", () => {
    const root = join(tmpdir(), `setup-env-${Date.now()}`);
    mkdirSync(root, { recursive: true });
    roots.push(root);
    writeFileSync(join(root, ".env"), "JWT_SECRET=existing\n", "utf8");

    expect(() =>
      planSetupEnv({
        envPath: join(root, ".env"),
        examplePath: join(root, ".env.example"),
        exampleContent: "JWT_SECRET=placeholder\nADMIN_EMAIL=a@b.com\nADMIN_PASSWORD=x\n",
      }),
    ).toThrow(/already exists/i);
  });

  it("builds env content from the example template without printing secrets", () => {
    const root = join(tmpdir(), `setup-env-${Date.now()}-2`);
    mkdirSync(root, { recursive: true });
    roots.push(root);
    const examplePath = join(root, ".env.example");
    const envPath = join(root, ".env");
    const exampleContent =
      "JWT_SECRET=replace\nADMIN_EMAIL=old@example.com\nADMIN_PASSWORD=replace\nPORT=3000\n";
    writeFileSync(examplePath, exampleContent, "utf8");

    const result = planSetupEnv({
      envPath,
      examplePath,
      exampleContent,
      adminEmail: "admin@autoyard.local",
    });

    expect(result.created).toBe(true);
    expect(existsSync(envPath)).toBe(true);
    const written = readFileSync(envPath, "utf8");
    expect(written).toContain("ADMIN_EMAIL=admin@autoyard.local");
    expect(written).not.toContain("replace-this");
    expect(written).toMatch(/^JWT_SECRET=.{32,}/m);
    expect(applyEnvTemplate(exampleContent, {
      jwtSecret: "x",
      adminPassword: "y",
      adminEmail: "admin@autoyard.local",
    })).toContain("ADMIN_EMAIL=admin@autoyard.local");
  });
});
