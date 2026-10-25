import { z } from "zod";

export function parseCorsOriginList(raw: string, nodeEnv: string): string[] {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    throw new Error("CORS_ORIGIN must list at least one origin");
  }

  const origins: string[] = [];
  for (const part of parts) {
    if (part.includes("*")) {
      throw new Error("CORS_ORIGIN must not contain wildcards");
    }
    let url: URL;
    try {
      url = new URL(part);
    } catch {
      throw new Error("CORS_ORIGIN entries must be valid URLs");
    }
    if (url.username || url.password) {
      throw new Error("CORS_ORIGIN must not include credentials in the URL");
    }
    if (url.pathname !== "/" && url.pathname !== "") {
      throw new Error("CORS_ORIGIN must not include a path");
    }
    if (url.search || url.hash) {
      throw new Error("CORS_ORIGIN must not include query or hash");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("CORS_ORIGIN must use http or https");
    }
    if (nodeEnv === "production" && url.protocol !== "https:") {
      throw new Error("CORS_ORIGIN must use https in production");
    }
    const origin = `${url.protocol}//${url.host}`;
    if (!origins.includes(origin)) {
      origins.push(origin);
    }
  }

  return origins;
}

export const corsOriginEnvSchema = z.string().min(1);
