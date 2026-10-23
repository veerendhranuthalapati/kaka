/** HS256 access tokens; secret must be set before signing (production boot checks later). */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return secret;
}

export const JWT_EXPIRES_IN = "15m" as const;
export const JWT_ALGORITHM = "HS256" as const;
