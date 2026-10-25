/** Dev-only client error logging without tokens or personal data. */
export function logClientError(scope: string, error: unknown): void {
  if (!import.meta.env.DEV) return;

  const raw =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === "string"
        ? error
        : "Unknown error";

  const redacted = raw
    .replaceAll(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replaceAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email]")
    .replaceAll(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[jwt]");

  console.error(`[client:${scope}]`, redacted);
}
