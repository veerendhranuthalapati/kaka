const CONTROL_OR_NUL = /[\u0000-\u001F\u007F]/;

function decodeForInspection(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeSchemeCheck(value: string): string {
  const trimmed = value.trim();
  const decoded = decodeForInspection(trimmed);
  return decoded.replace(/\s+/g, "").toLowerCase();
}

export function isSafeHttpUrl(value: string): boolean {
  if (!value || CONTROL_OR_NUL.test(value)) return false;
  const trimmed = value.trim();
  if (trimmed.startsWith("//") || trimmed.includes("\\")) return false;
  const scheme = normalizeSchemeCheck(trimmed);
  if (
    scheme.startsWith("javascript:") ||
    scheme.startsWith("data:") ||
    scheme.startsWith("vbscript:")
  ) {
    return false;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isSafeImagePath(value: string): boolean {
  if (!value || CONTROL_OR_NUL.test(value)) return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return false;
  }
  const scheme = normalizeSchemeCheck(trimmed);
  if (
    scheme.startsWith("javascript:") ||
    scheme.startsWith("data:") ||
    scheme.startsWith("vbscript:")
  ) {
    return false;
  }
  if (scheme.startsWith("https://")) return true;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  return false;
}

export function safeHref(value: string): string | null {
  return isSafeHttpUrl(value) ? value.trim() : null;
}
