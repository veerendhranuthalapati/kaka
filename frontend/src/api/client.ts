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

export async function apiRequest<T>(
  _path: string,
  _options: RequestOptions = {},
): Promise<T> {
  throw new Error("apiRequest is not implemented yet");
}

export function handleUnauthorized(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  unauthorizedHandler?.();
}
