import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginThrottleStore } from "../../src/security/loginThrottle.js";

describe("LoginThrottleStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("blocks after max failures per ip+email and clears on success", () => {
    const store = new LoginThrottleStore({
      maxFailuresPerIpEmail: 3,
      failureWindowMs: 15 * 60 * 1000,
      maxFailuresPerEmail: 100,
      lockoutMs: 15 * 60 * 1000,
      maxKeys: 10_000,
    });
    const ip = "1.2.3.4";
    const email = "user@example.com";

    expect(store.isBlocked(ip, email)).toBe(false);
    store.recordFailure(ip, email);
    store.recordFailure(ip, email);
    expect(store.isBlocked(ip, email)).toBe(false);
    store.recordFailure(ip, email);
    expect(store.isBlocked(ip, email)).toBe(true);

    store.recordSuccess(ip, email);
    expect(store.isBlocked(ip, email)).toBe(false);
  });

  it("expires ip+email window after TTL", () => {
    const store = new LoginThrottleStore({
      maxFailuresPerIpEmail: 2,
      failureWindowMs: 60_000,
      maxFailuresPerEmail: 100,
      lockoutMs: 60_000,
      maxKeys: 10_000,
    });
    const ip = "9.9.9.9";
    const email = "ttl@example.com";
    store.recordFailure(ip, email);
    store.recordFailure(ip, email);
    expect(store.isBlocked(ip, email)).toBe(true);

    vi.advanceTimersByTime(61_000);
    expect(store.isBlocked(ip, email)).toBe(false);
  });

  it("locks email globally after cross-ip failures", () => {
    const store = new LoginThrottleStore({
      maxFailuresPerIpEmail: 100,
      failureWindowMs: 60_000,
      maxFailuresPerEmail: 3,
      lockoutMs: 120_000,
      maxKeys: 10_000,
    });
    const email = "global@example.com";
    store.recordFailure("1.1.1.1", email);
    store.recordFailure("2.2.2.2", email);
    store.recordFailure("3.3.3.3", email);
    expect(store.isBlocked("9.0.0.1", email)).toBe(true);
  });

  it("evicts LRU keys when over cap", () => {
    const store = new LoginThrottleStore({
      maxFailuresPerIpEmail: 1,
      failureWindowMs: 60_000,
      maxFailuresPerEmail: 100,
      lockoutMs: 60_000,
      maxKeys: 2,
    });
    store.recordFailure("1.0.0.1", "a@example.com");
    vi.advanceTimersByTime(1);
    store.recordFailure("1.0.0.2", "b@example.com");
    vi.advanceTimersByTime(1);
    store.recordFailure("1.0.0.3", "c@example.com");
    expect(store.isBlocked("1.0.0.1", "a@example.com")).toBe(false);
  });
});
