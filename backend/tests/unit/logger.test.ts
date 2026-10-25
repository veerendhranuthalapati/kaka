import { describe, expect, it, vi } from "vitest";
import {
  hashEmailForLog,
  logSecurityEvent,
  redactObject,
  scrubMessage,
} from "../../src/lib/logger.js";

describe("logger", () => {
  it("redacts sensitive keys and postgres URLs in objects", () => {
    const redacted = redactObject({
      authorization: "Bearer secret",
      password: "x",
      note: "see postgres://user:pass@host:5432/db",
    });
    expect(redacted.authorization).toBe("[REDACTED]");
    expect(redacted.password).toBe("[REDACTED]");
    expect(redacted.note).toBe("see postgres://[REDACTED]");
  });

  it("scrubs postgres URLs inside error messages", () => {
    expect(
      scrubMessage("failed postgres://admin:secret@db.example.com:5432/app"),
    ).not.toMatch(/secret/);
  });

  it("hashes emails for security logs without logging the email", () => {
    const hash = hashEmailForLog("user@example.com");
    expect(hash).toHaveLength(8);
    expect(hash).not.toContain("@");
  });

  it("emits structured security events", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logSecurityEvent("login_success", { userId: "u1" });
    expect(spy).toHaveBeenCalled();
    const line = String(spy.mock.calls[0]?.[0]);
    expect(line).toContain('"event":"login_success"');
    spy.mockRestore();
  });
});
