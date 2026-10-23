import { TOKEN_STORAGE_KEY } from "../api/client";
import type { AuthUser, Role } from "../types";

type JwtPayload = {
  sub?: unknown;
  email?: unknown;
  role?: unknown;
  exp?: unknown;
};

export type Session = {
  token: string;
  user: AuthUser;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function isRole(value: unknown): value is Role {
  return value === "USER" || value === "ADMIN";
}

export function decodeToken(token: string): AuthUser | null {
  try {
    const segments = token.split(".");

    if (segments.length !== 3 || !segments[1]) {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(segments[1])) as JwtPayload;
    const nowInSeconds = Date.now() / 1000;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      !isRole(payload.role) ||
      typeof payload.exp !== "number" ||
      payload.exp <= nowInSeconds
    ) {
      return null;
    }

    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function saveSession(token: string): void {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function readSession(): Session | null {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);

  if (!token) {
    return null;
  }

  const user = decodeToken(token);

  if (!user) {
    clearSession();
    return null;
  }

  return { token, user };
}
