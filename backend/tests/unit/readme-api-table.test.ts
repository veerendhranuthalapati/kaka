import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const README = resolve(import.meta.dirname, "../../../README.md");

const DOCUMENTED_ROUTES: { method: string; path: string }[] = [
  { method: "POST", path: "/api/auth/register" },
  { method: "POST", path: "/api/auth/login" },
  { method: "POST", path: "/api/auth/logout" },
  { method: "GET", path: "/api/vehicles" },
  { method: "GET", path: "/api/vehicles/search" },
  { method: "GET", path: "/api/vehicles/:id" },
  { method: "POST", path: "/api/vehicles" },
  { method: "PUT", path: "/api/vehicles/:id" },
  { method: "DELETE", path: "/api/vehicles/:id" },
  { method: "POST", path: "/api/vehicles/:id/purchase" },
  { method: "POST", path: "/api/vehicles/:id/restock" },
  { method: "GET", path: "/health" },
];

describe("README API table", () => {
  it("documents every registered HTTP route", () => {
    const readme = readFileSync(README, "utf8");
    for (const route of DOCUMENTED_ROUTES) {
      expect(readme).toContain(`| ${route.method} | \`${route.path}\``);
    }
  });
});
