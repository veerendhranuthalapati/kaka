import type { ApiErrorBody } from "../types";

export const TOKEN_STORAGE_KEY = "dealership_token";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

export type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

function getBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? "";
}

function toApiError(status: number, payload: unknown): ApiError {
  const envelope =
    typeof payload === "object" && payload !== null
      ? (payload as ApiErrorBody).error
      : undefined;
  const code =
    typeof envelope?.code === "string" ? envelope.code : "REQUEST_FAILED";
  const message =
    typeof envelope?.message === "string"
      ? envelope.message
      : `Request failed with status ${status}`;

  return new ApiError(status, code, message, envelope?.details);
}

export function handleUnauthorized(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);

  if (unauthorizedHandler) {
    unauthorizedHandler();
    return;
  }

  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;

  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      method: options.method ?? "GET",
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Unable to reach the server. Check your connection and try again.",
    );
  }

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new ApiError(
      response.status,
      "INVALID_RESPONSE",
      "The server returned an unreadable response.",
    );
  }

  if (!response.ok) {
    throw toApiError(response.status, payload);
  }

  return payload as T;
}
