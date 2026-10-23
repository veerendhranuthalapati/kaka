import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
});

export type AppConfig = {
  jwtSecret: string;
  port: number;
  corsOrigin: string;
};

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
  };
}

export const config = loadConfig();
