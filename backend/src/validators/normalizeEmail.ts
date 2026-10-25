export function normalizeEmail(raw: string): string {
  return raw.trim().normalize("NFKC").toLowerCase();
}
