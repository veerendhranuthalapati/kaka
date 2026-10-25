import { TOKEN_STORAGE_KEY } from "../api/client";
import type { AuthUser, Role } from "../types";

export const USER_STORAGE_KEY = "dealership_user";

type JwtPayload = {
  sub?: unknown;
  tv?: unknown;
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

export function isTokenStructurallyValid(token: string): boolean {
  try {
    const segments = token.split(".");
    if (segments.length !== 3 || !segments[1]) return false;
    const payload = JSON.parse(decodeBase64Url(segments[1])) as JwtPayload;
    const nowInSeconds = Date.now() / 1000;
    if (typeof payload.sub !== "string") return false;
    if (typeof payload.tv !== "number" || !Number.isInteger(payload.tv)) {
      return false;
    }
    if (typeof payload.exp !== "number" || payload.exp <= nowInSeconds) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** @deprecated use isTokenStructurallyValid; kept for tests that build legacy tokens */
export function decodeToken(token: string): AuthUser | null {
  if (!isTokenStructurallyValid(token)) return null;
  const raw = sessionStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as AuthUser;
    if (
      typeof user.id === "string" &&
      typeof user.email === "string" &&
      isRole(user.role)
    ) {
      return user;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AuthUser): void {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
}

export function readSession(): Session | null {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return null;
  const user = decodeToken(token);
  if (!user) {
    clearSession();
    return null;
  }
  return { token, user };
}
