import { execSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, beforeAll } from "vitest";
import { scanFiles } from "../../scripts/check-secrets.mjs";

const frontendRoot = resolve(import.meta.dirname, "..");
const distDir = resolve(frontendRoot, "dist");

describe("production build output", () => {
  beforeAll(() => {
    execSync("npm run build", {
      cwd: frontendRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        VITE_API_URL: "http://localhost:3000",
      },
    });
  }, 120_000);

  it("index.html has no inline scripts or inline event handlers", () => {
    const html = readFileSync(resolve(distDir, "index.html"), "utf8");
    expect(html).not.toMatch(/<script(?![^>]*\ssrc=)[^>]*>/i);
    expect(html).not.toMatch(/\son\w+\s*=/i);
  });

  it("bundles expose only VITE_API_URL via import.meta.env", () => {
    const assets = resolve(distDir, "assets");
    const jsFiles = readdirSync(assets).filter((name) => name.endsWith(".js"));
    const combined = jsFiles
      .map((name) => readFileSync(resolve(assets, name), "utf8"))
      .join("\n");
    expect(combined).not.toMatch(/process\.env/);
    expect(combined).not.toMatch(/JWT_SECRET/);
    expect(combined).not.toMatch(/DATABASE_URL/);
    expect(combined).toMatch(/localhost:3000/);
  });

  it("passes check:secrets against dist assets", () => {
    const assets = resolve(distDir, "assets");
    const files = readdirSync(assets)
      .filter((name) => name.endsWith(".js") || name.endsWith(".css"))
      .map((name) => resolve(assets, name));
    const findings = scanFiles(files);
    expect(findings).toEqual([]);
  });
});
