import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { listAuditedRoutes } from "../../src/security/routeAudit.js";

describe("listAuditedRoutes paths", () => {
  it("includes full path for nested admin routers", () => {
    const app = createApp({ demoDataEndpointEnabled: true, authRateLimitMax: 1000 });
    const paths = listAuditedRoutes(app).map((r) => `${r.method} ${r.path}`);
    expect(paths).toContain("POST /api/admin/demo-vehicles");
  });
});
