import type { AuthResponse } from "../types";
import { apiRequest } from "./client";

export type Credentials = {
  email: string;
  password: string;
};

export function loginRequest(credentials: Credentials): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function registerRequest(credentials: Credentials): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: credentials,
  });
}

export function logoutRequest(): Promise<void> {
  return apiRequest<void>("/api/auth/logout", { method: "POST" });
}
