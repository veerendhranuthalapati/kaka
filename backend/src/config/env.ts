import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
  TRUST_PROXY: z.string().optional(),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
});

export type TrustProxySetting = boolean | number | string;

export type AppConfig = {
  jwtSecret: string;
  port: number;
  corsOrigin: string;
  trustProxy: TrustProxySetting;
  authRateLimitMax: number;
  authRateLimitWindowMs: number;
};

function parseTrustProxy(value: string | undefined): TrustProxySetting {
  if (value === undefined || value === "" || value === "false") {
    return false;
  }
  if (value === "true") {
    return true;
  }
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    const reasons = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${reasons}`);
  }

  return {
    jwtSecret: parsed.data.JWT_SECRET,
    port: parsed.data.PORT,
    corsOrigin: parsed.data.CORS_ORIGIN,
    trustProxy: parseTrustProxy(parsed.data.TRUST_PROXY),
    authRateLimitMax: parsed.data.AUTH_RATE_LIMIT_MAX,
    authRateLimitWindowMs: parsed.data.AUTH_RATE_LIMIT_WINDOW_MS,
  };
}

export const config = loadConfig();
