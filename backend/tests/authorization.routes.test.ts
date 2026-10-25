import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import {
  assertAuditedRoutes,
  assertExpressRoutesGuarded,
  listAuditedRoutes,
} from "../src/security/routeAudit.js";

describe("route authorization safety net", () => {
  it("requires auth or public allow-list on every /api route", () => {
    const app = createApp({
      authRateLimitMax: 1000,
      demoDataEndpointEnabled: true,
    });
    expect(() => assertExpressRoutesGuarded(app)).not.toThrow();
  });

  it("fails when a temporary unguarded /api route is added", () => {
    const app = createApp({ authRateLimitMax: 1000 });
    app.get("/api/unguarded-evil", (_req, res) => {
      res.status(200).json({ ok: true });
    });
    expect(() => assertExpressRoutesGuarded(app)).toThrow(/Unguarded API route/);
  });

  it("includes POST /api/admin/demo-vehicles when demo endpoint is enabled", () => {
    const app = createApp({
      authRateLimitMax: 1000,
      demoDataEndpointEnabled: true,
    });
    const routes = listAuditedRoutes(app);
    const demoRoute = routes.find(
      (route) =>
        route.method === "POST" && route.path === "/api/admin/demo-vehicles",
    );
    expect(demoRoute).toBeDefined();
    expect(() => assertAuditedRoutes(routes)).not.toThrow();
  });
});
