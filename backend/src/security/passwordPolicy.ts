import { COMMON_PASSWORDS } from "./commonPasswords.js";

export type PasswordPolicyOptions = {
  email?: string;
  requireAdminStrength?: boolean;
};

export function isSingleRepeatedCharacter(password: string): boolean {
  if (password.length === 0) return false;
  return password.split("").every((ch) => ch === password[0]);
}

export function passwordContainsEmailLocalPart(
  password: string,
  email: string,
): boolean {
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  if (local.length < 3) return false;
  return password.toLowerCase().includes(local);
}

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

export function meetsAdminPasswordRules(password: string): boolean {
  if (password.length < 14) return false;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  return hasLower && hasUpper && hasDigit && hasSymbol;
}

export function validatePasswordPolicy(
  password: string,
  options: PasswordPolicyOptions = {},
): string | null {
  if (password.length < 8 || password.length > 72) {
    return "Password must be 8–72 characters.";
  }
  if (Buffer.byteLength(password, "utf8") > 72) {
    return "Password must be at most 72 UTF-8 bytes.";
  }
  if (isSingleRepeatedCharacter(password)) {
    return "Password is too weak.";
  }
  if (isCommonPassword(password)) {
    return "Password is too common.";
  }
  if (options.email && passwordContainsEmailLocalPart(password, options.email)) {
    return "Password must not contain your email address.";
  }
  if (options.requireAdminStrength && !meetsAdminPasswordRules(password)) {
    return "Admin password must be at least 14 characters with upper, lower, digit, and symbol.";
  }
  return null;
}
