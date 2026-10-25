import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildVercelJson,
  formatNetlifyHeaders,
} from "../src/security/hostingHeaders";

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const api = "https://api.example.com";

describe("generated hosting artifacts", () => {
  it("keeps public/_headers and vercel.json in sync with the module", () => {
    const headersPath = resolve(frontendRoot, "public", "_headers");
    const vercelPath = resolve(frontendRoot, "vercel.json");
    expect(existsSync(headersPath)).toBe(true);
    expect(existsSync(vercelPath)).toBe(true);
    expect(readFileSync(headersPath, "utf8")).toBe(formatNetlifyHeaders(api));
    expect(JSON.parse(readFileSync(vercelPath, "utf8"))).toEqual(
      buildVercelJson(api),
    );
  });
});
