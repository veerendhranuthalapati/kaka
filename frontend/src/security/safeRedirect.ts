/**
 * Accept only same-origin relative paths for post-login redirects.
 */
export function isSafeRelativeRedirect(path: string): boolean {
  if (!path || path.length > 512) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.startsWith("/\\")) return false;
  if (path.includes("\\")) return false;
  if (/[\u0000-\u001F\u007F]/.test(path)) return false;
  try {
    const url = new URL(path, "http://local.invalid");
    return url.origin === "http://local.invalid";
  } catch {
    return false;
  }
}
