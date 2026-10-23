/** HS256 access token settings; the secret is validated by config/env.ts. */
export const JWT_EXPIRES_IN = "15m" as const;
export const JWT_ALGORITHM = "HS256" as const;
