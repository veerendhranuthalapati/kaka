import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import {
  assertAuditedRoutes,
  assertExpressRoutesGuarded,
} from "../src/security/routeAudit.js";

describe("route authorization safety net", () => {
  it("requires auth or public allow-list on every /api route", () => {
    const app = createApp({ authRateLimitMax: 1000 });
    expect(() => assertExpressRoutesGuarded(app)).not.toThrow();
  });

  it("fails when a temporary unguarded /api route is added", () => {
    expect(() =>
      assertAuditedRoutes([
        {
          method: "GET",
          path: "/api/unguarded-evil",
          handlers: [(_req, _res, next) => next()],
        },
      ]),
    ).toThrow(/Unguarded API route/);
  });
});
