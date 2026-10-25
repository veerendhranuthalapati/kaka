export type LogFields = Record<string, unknown>;

export function logSecurityEvent(event: string, fields: LogFields = {}): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level: "info",
    kind: "security",
    event,
    ...fields,
  });
  console.log(line);
}
