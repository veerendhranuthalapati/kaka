export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function byteLength(value: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).length;
  }

  return value.length;
}

export function passwordValid(value: string): boolean {
  if (value.length < 8 || value.length > 72) {
    return false;
  }

  return byteLength(value) <= 72;
}

export function validateEmail(email: string): string | null {
  if (!isValidEmail(email)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (password.length > 72) {
    return "Password must be at most 72 characters.";
  }

  if (byteLength(password) > 72) {
    return "Password must be at most 72 UTF-8 bytes.";
  }

  return null;
}

export function validateCredentials(
  email: string,
  password: string,
): string | null {
  return validateEmail(email) ?? validatePassword(password);
}
