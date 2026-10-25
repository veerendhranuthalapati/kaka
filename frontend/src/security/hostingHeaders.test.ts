import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  buildHostingSecurityHeaders,
} from "./hostingHeaders";

describe("hostingHeaders", () => {
  it("builds a strict script policy without unsafe-eval or unsafe-inline", () => {
    const csp = buildContentSecurityPolicy("https://api.example.com");
    expect(csp).not.toMatch(/unsafe-eval/i);
    expect(csp).toMatch(/script-src 'self'/);
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(csp).toMatch(/frame-ancestors 'none'/);
    expect(csp).toMatch(/connect-src 'self' https:\/\/api\.example\.com/);
  });

  it("documents style unsafe-inline and img https allowances", () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toMatch(/style-src 'self' 'unsafe-inline'/);
    expect(csp).toMatch(/img-src 'self' data: https:/);
  });

  it("includes auxiliary security headers", () => {
    const headers = buildHostingSecurityHeaders();
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("no-referrer");
    expect(headers["Cross-Origin-Opener-Policy"]).toBe("same-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
  });
});
