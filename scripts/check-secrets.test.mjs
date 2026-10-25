import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { scanContent } from "./check-secrets.mjs";

const ROOT = resolve(import.meta.dirname, "..");

test("detects deliberate leak content", () => {
  const leak = `API_KEY=abcdefghijklmnopqrstuvwxyz012345
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U`;
  const findings = scanContent(resolve(ROOT, "virtual-leak.txt"), leak, []);
  assert.ok(findings.length >= 1);
});

test("allows placeholder example fixture", () => {
  const safePath = resolve(ROOT, "scripts/fixtures/secretscan-safe.env.example");
  const content = readFileSync(safePath, "utf8");
  const findings = scanContent(safePath, content, []);
  assert.equal(findings.length, 0);
});
