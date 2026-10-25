import { describe, expect, it } from "vitest";
import { isSafeRelativeRedirect } from "./safeRedirect";

describe("isSafeRelativeRedirect", () => {
  it.each(["/dashboard", "/vehicles/abc", "/login?next=%2F"])(
    "accepts %s",
    (path) => {
      expect(isSafeRelativeRedirect(path)).toBe(true);
    },
  );

  it.each([
    "",
    "dashboard",
    "//evil.com",
    "/\\evil",
    "https://evil.com",
    "/path\u0000",
    "/".repeat(600),
  ])("rejects %s", (path) => {
    expect(isSafeRelativeRedirect(path)).toBe(false);
  });
});
