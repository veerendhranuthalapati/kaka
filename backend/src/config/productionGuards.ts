export function assertProductionConfig(env: NodeJS.ProcessEnv): void {
  if (env.NODE_ENV !== "production") {
    return;
  }

  const cors = env.CORS_ORIGIN ?? "";
  for (const part of cors.split(",").map((p) => p.trim()).filter(Boolean)) {
    if (!part.startsWith("https://")) {
      throw new Error(
        "Production requires every CORS_ORIGIN entry to use https",
      );
    }
  }

  const trust = env.TRUST_PROXY?.trim() ?? "";
  if (trust === "" || trust.toLowerCase() === "false") {
    throw new Error(
      "Production requires TRUST_PROXY to be set explicitly (not false or empty)",
    );
  }
  if (trust.toLowerCase() === "true") {
    throw new Error("Production TRUST_PROXY must not be true");
  }

  const sslOptOut = env.DATABASE_SSL_OPTOUT === "true";
  const databaseUrl = env.DATABASE_URL ?? "";
  if (!sslOptOut && !/sslmode=(require|verify-full)/i.test(databaseUrl)) {
    throw new Error(
      "Production DATABASE_URL must include sslmode=require or verify-full (or set DATABASE_SSL_OPTOUT=true)",
    );
  }

  const jwtSecret = env.JWT_SECRET ?? "";
  if (jwtSecret.length < 48) {
    throw new Error("Production JWT_SECRET must be at least 48 characters");
  }

  const bcryptCost = Number(env.BCRYPT_COST ?? "12");
  if (!Number.isInteger(bcryptCost) || bcryptCost < 12) {
    throw new Error("Production BCRYPT_COST must be at least 12");
  }

  if (env.RATE_LIMIT_DISABLED === "true") {
    throw new Error("Production must not set RATE_LIMIT_DISABLED=true");
  }
}
