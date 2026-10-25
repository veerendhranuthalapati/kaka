import { createHash } from "node:crypto";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogFields = Record<string, unknown>;

const REDACT_KEYS = new Set([
  "authorization",
  "password",
  "token",
  "cookie",
  "secret",
  "passwordhash",
]);

const POSTGRES_URL_RE =
  /postgres(?:ql)?:\/\/[^@\s]+@[^\s"'`]+/gi;

function scrubString(value: string): string {
  return value.replace(POSTGRES_URL_RE, "postgres://[REDACTED]");
}

function redactValue(key: string, value: unknown): unknown {
  if (REDACT_KEYS.has(key.toLowerCase())) {
    return "[REDACTED]";
  }
  if (typeof value === "string") {
    return scrubString(value);
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: scrubString(value.message),
    };
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "object" && item !== null
        ? redactObject(item as LogFields)
        : typeof item === "string"
          ? scrubString(item)
          : item,
    );
  }
  if (value && typeof value === "object") {
    return redactObject(value as LogFields);
  }
  return value;
}

export function redactObject(fields: LogFields): LogFields {
  const out: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = redactValue(key, value);
  }
  return out;
}

export function scrubMessage(message: string): string {
  return scrubString(message);
}

export function hashEmailForLog(email: string): string {
  return createHash("sha256").update(email).digest("hex").slice(0, 8);
}

export function log(
  level: LogLevel,
  msg: string,
  fields: LogFields = {},
): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg: scrubMessage(msg),
    ...redactObject(fields),
  });
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function logSecurityEvent(
  event: string,
  fields: LogFields = {},
): void {
  log("info", event, { kind: "security", event, ...fields });
}
