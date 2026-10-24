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

export function validateImageUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2048) {
    return "Image URL must be at most 2048 characters.";
  }
  if (/[\s\x00-\x1F\x7F]/.test(trimmed)) {
    return "Image URL must not contain whitespace or control characters.";
  }
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("http:") ||
    trimmed.startsWith("//")
  ) {
    return "Use an https:// URL or a path starting with /.";
  }
  if (lower.startsWith("https://")) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return null;
  return "Use an https:// URL or a path starting with /.";
}
