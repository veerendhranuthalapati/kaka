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
});
