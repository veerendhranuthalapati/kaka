import type { ApiErrorBody } from "../types";

export const TOKEN_STORAGE_KEY = "dealership_token";

export class ApiError extends Error {
  readonly fieldErrors?: Record<string, string>;

  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";

    if (
      code === "VALIDATION_ERROR" &&
      details &&
      typeof details === "object" &&
      "fieldErrors" in details &&
      details.fieldErrors &&
      typeof details.fieldErrors === "object"
    ) {
      const mapped: Record<string, string> = {};
      for (const [key, val] of Object.entries(
        details.fieldErrors as Record<string, unknown>,
      )) {
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
          mapped[key] = val[0];
        }
      }
      this.fieldErrors = mapped;
    }
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

  let code =
    typeof envelope?.code === "string" ? envelope.code : "REQUEST_FAILED";
  let message =
    typeof envelope?.message === "string"
      ? envelope.message
      : `Request failed with status ${status}`;

  if (status === 429) {
    code = "TOO_MANY_REQUESTS";
    message = "Too many attempts. Try again in a minute.";
  }

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
      "Cannot reach the server. Check your connection.",
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
    if (response.status === 429) {
      throw new ApiError(
        429,
        "TOO_MANY_REQUESTS",
        "Too many attempts. Try again in a minute.",
      );
    }

    throw new ApiError(
      response.status,
      "INVALID_RESPONSE",
      response.status > 0
        ? `The server returned an unreadable response (status ${response.status}).`
        : "The server returned an unreadable response.",
    );
  }

  if (!response.ok) {
    throw toApiError(response.status, payload);
  }

  return payload as T;
}
