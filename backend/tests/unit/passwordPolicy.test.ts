import { describe, expect, it } from "vitest";
import { validatePasswordPolicy } from "../../src/security/passwordPolicy.js";

describe("validatePasswordPolicy", () => {
  it("rejects passwords containing the email local part", () => {
    expect(
      validatePasswordPolicy("alice-secret-9!", { email: "alice@example.com" }),
    ).toBeTruthy();
  });

  it("rejects a single repeated character", () => {
    expect(validatePasswordPolicy("aaaaaaaa")).toBeTruthy();
  });

  it("accepts a strong unrelated password", () => {
    expect(
      validatePasswordPolicy("Str0ng!User9x", { email: "other@example.com" }),
    ).toBeNull();
  });

  it("rejects common passwords", () => {
    expect(validatePasswordPolicy("password")).toBeTruthy();
  });

  it("rejects passwords outside length bounds", () => {
    expect(validatePasswordPolicy("short")).toBeTruthy();
    expect(validatePasswordPolicy("a".repeat(73))).toBeTruthy();
  });

  it("requires admin strength when flagged", () => {
    expect(
      validatePasswordPolicy("shortadmin1!", { requireAdminStrength: true }),
    ).toBeTruthy();
    expect(
      validatePasswordPolicy("AdminStr0ng!Pass14", {
        requireAdminStrength: true,
      }),
    ).toBeNull();
  });
});
