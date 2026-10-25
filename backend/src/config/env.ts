import { z } from "zod";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseCorsOriginList } from "./corsOrigins.js";
import { assertProductionConfig } from "./productionGuards.js";

const PLACEHOLDER_SECRETS = new Set(
  [
    "replace-this-with-at-least-32-characters",
    "test-jwt-secret-for-vitest-0123456789",
    "changeme",
    "your-secret-here",
  ].map((s) => s.toLowerCase()),
);

function distinctCharCount(value: string): number {
  return new Set(value).size;
}

function isLowEntropySecret(value: string): boolean {
  if (distinctCharCount(value) < 12) return true;
  if (/^(.)\1+$/.test(value)) return true;
  return false;
}

function loadExampleJwtPlaceholder(): string | null {
  try {
    const example = readFileSync(
      resolve(process.cwd(), ".env.example"),
      "utf8",
    );
    const match = example.match(/^JWT_SECRET=(.+)$/m);
    return match?.[1]?.trim().toLowerCase() ?? null;
  } catch {
    return null;
  }
}

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long")
    .superRefine((value, ctx) => {
      const lower = value.toLowerCase();
      if (PLACEHOLDER_SECRETS.has(lower)) {
        ctx.addIssue({ code: "custom", message: "JWT_SECRET must not be a placeholder" });
      }
      const examplePlaceholder = loadExampleJwtPlaceholder();
      if (examplePlaceholder && lower === examplePlaceholder) {
        ctx.addIssue({ code: "custom", message: "JWT_SECRET must not match .env.example" });
      }
      if (isLowEntropySecret(value)) {
        ctx.addIssue({ code: "custom", message: "JWT_SECRET is too low entropy" });
      }
    }),
  JWT_ISSUER: z.string().min(1).default("autoyard-api"),
  JWT_AUDIENCE: z.string().min(1).default("autoyard-client"),
  BCRYPT_COST: z.coerce
    .number()
    .int()
    .superRefine((value, ctx) => {
      const isTest =
        process.env.NODE_ENV === "test" || process.env.VITEST === "true";
      if (isTest) {
        if (value < 4 || value > 14) {
          ctx.addIssue({
            code: "custom",
            message: "BCRYPT_COST must be between 4 and 14 in test",
          });
        }
        return;
      }
      if (value < 10 || value > 14) {
        ctx.addIssue({
          code: "custom",
          message: "BCRYPT_COST must be between 10 and 14",
        });
      }
    })
    .default(12),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().min(1),
  TRUST_PROXY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  DATABASE_SSL_OPTOUT: z.string().optional(),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  GLOBAL_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  GLOBAL_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 1000),
  WRITE_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  WRITE_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 1000),
  RATE_LIMIT_DISABLED: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  LOGIN_FAIL_MAX_IP_EMAIL: z.coerce.number().int().positive().default(5),
  LOGIN_FAIL_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  LOGIN_FAIL_MAX_EMAIL: z.coerce.number().int().positive().default(20),
  LOGIN_LOCKOUT_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  LOGIN_STORE_MAX_KEYS: z.coerce.number().int().positive().default(10_000),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  HEADERS_TIMEOUT_MS: z.coerce.number().int().positive().default(35_000),
  KEEP_ALIVE_TIMEOUT_MS: z.coerce.number().int().positive().default(5_000),
});

export type TrustProxySetting = boolean | number | string;

export type AppConfig = {
  nodeEnv: string;
  jwtSecret: string;
  jwtIssuer: string;
  jwtAudience: string;
  bcryptCost: number;
  port: number;
  corsOrigins: string[];
  trustProxy: TrustProxySetting;
  authRateLimitMax: number;
  authRateLimitWindowMs: number;
  globalRateLimitMax: number;
  globalRateLimitWindowMs: number;
  writeRateLimitMax: number;
  writeRateLimitWindowMs: number;
  rateLimitDisabled: boolean;
  loginFailMaxIpEmail: number;
  loginFailWindowMs: number;
  loginFailMaxEmail: number;
  loginLockoutMs: number;
  loginStoreMaxKeys: number;
  requestTimeoutMs: number;
  headersTimeoutMs: number;
  keepAliveTimeoutMs: number;
};

function parseTrustProxy(value: string | undefined): TrustProxySetting {
  if (typeof value === "boolean") {
    throw new Error("TRUST_PROXY must not be true; use false or a positive integer/hop count");
  }
  if (value === undefined || value === "" || value === "false") {
    return false;
  }
  if (typeof value === "string" && value.trim().toLowerCase() === "true") {
    throw new Error("TRUST_PROXY must not be true; use false or a positive integer/hop count");
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const n = Number(value);
    if (n >= 1) {
      return n;
    }
    throw new Error("TRUST_PROXY must be a positive integer");
  }
  if (typeof value === "string") {
    const v = value.trim();
    if (v === "" || v.toLowerCase() === "false") {
      return false;
    }
    if (v.toLowerCase() === "true") {
      throw new Error("TRUST_PROXY must not be true; use false or a positive integer/hop count");
    }
    return v;
  }
  throw new Error("TRUST_PROXY must not be true; use false or a positive integer/hop count");
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  assertProductionConfig(env);

  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    const reasons = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${reasons}`);
  }

  const nodeEnv = parsed.data.NODE_ENV ?? "development";
  let corsOrigins: string[];
  try {
    corsOrigins = parseCorsOriginList(parsed.data.CORS_ORIGIN, nodeEnv);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Invalid CORS_ORIGIN",
    );
  }

  return {
    nodeEnv,
    jwtSecret: parsed.data.JWT_SECRET,
    jwtIssuer: parsed.data.JWT_ISSUER,
    jwtAudience: parsed.data.JWT_AUDIENCE,
    bcryptCost: parsed.data.BCRYPT_COST,
    port: parsed.data.PORT,
    corsOrigins,
    trustProxy: parseTrustProxy(parsed.data.TRUST_PROXY),
    authRateLimitMax: parsed.data.AUTH_RATE_LIMIT_MAX,
    authRateLimitWindowMs: parsed.data.AUTH_RATE_LIMIT_WINDOW_MS,
    globalRateLimitMax: parsed.data.GLOBAL_RATE_LIMIT_MAX,
    globalRateLimitWindowMs: parsed.data.GLOBAL_RATE_LIMIT_WINDOW_MS,
    writeRateLimitMax: parsed.data.WRITE_RATE_LIMIT_MAX,
    writeRateLimitWindowMs: parsed.data.WRITE_RATE_LIMIT_WINDOW_MS,
    rateLimitDisabled: parsed.data.RATE_LIMIT_DISABLED ?? false,
    loginFailMaxIpEmail: parsed.data.LOGIN_FAIL_MAX_IP_EMAIL,
    loginFailWindowMs: parsed.data.LOGIN_FAIL_WINDOW_MS,
    loginFailMaxEmail: parsed.data.LOGIN_FAIL_MAX_EMAIL,
    loginLockoutMs: parsed.data.LOGIN_LOCKOUT_MS,
    loginStoreMaxKeys: parsed.data.LOGIN_STORE_MAX_KEYS,
    requestTimeoutMs: parsed.data.REQUEST_TIMEOUT_MS,
    headersTimeoutMs: parsed.data.HEADERS_TIMEOUT_MS,
    keepAliveTimeoutMs: parsed.data.KEEP_ALIVE_TIMEOUT_MS,
  };
}

export const config = loadConfig();
