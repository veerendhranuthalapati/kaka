import { beforeEach, describe, expect, it } from "vitest";
import { TOKEN_STORAGE_KEY } from "../api/client";
import { AUTH_IDLE_TIMEOUT_MS } from "./constants";
import {
  USER_STORAGE_KEY,
  clearSession,
  readSession,
  saveSession,
} from "./session";

describe("session security", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("stores the token only in sessionStorage, never localStorage", () => {
    saveSession("token-value", {
      id: "1",
      email: "u@example.com",
      role: "USER",
    });
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe("token-value");
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
  });

  it("drops expired tokens on read", () => {
    const encode = (value: object) =>
      btoa(JSON.stringify(value))
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replace(/=+$/, "");
    const token = `${encode({ alg: "HS256" })}.${encode({
      sub: "user-1",
      tv: 0,
      exp: Math.floor(Date.now() / 1000) - 10,
    })}.sig`;
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({ id: "user-1", email: "u@x.com", role: "USER" }),
    );
    expect(readSession()).toBeNull();
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it("uses a 30 minute idle timeout constant", () => {
    expect(AUTH_IDLE_TIMEOUT_MS).toBe(30 * 60 * 1000);
  });

  it("clearSession removes both keys", () => {
    saveSession("t", { id: "1", email: "a@b.com", role: "USER" });
    clearSession();
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(USER_STORAGE_KEY)).toBeNull();
  });
});
