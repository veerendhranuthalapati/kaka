import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  TOKEN_STORAGE_KEY,
  apiRequest,
  setUnauthorizedHandler,
} from "./client";

function response(status: number, body?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("apiRequest", () => {
  beforeEach(() => {
    setUnauthorizedHandler(null);
    sessionStorage.clear();
  });

  it("parses the backend error envelope into a typed ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response(409, {
          error: {
            code: "OUT_OF_STOCK",
            message: "Vehicle is out of stock",
            details: { quantity: 0 },
          },
        }),
      ),
    );

    const request = apiRequest("/api/vehicles/1/purchase", {
      method: "POST",
    });

    await expect(request).rejects.toMatchObject({
      name: "ApiError",
      status: 409,
      code: "OUT_OF_STOCK",
      message: "Vehicle is out of stock",
      details: { quantity: 0 },
    });
    await expect(request).rejects.toBeInstanceOf(ApiError);
  });

  it("attaches the bearer token and serializes the request body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response(200, {
        user: { id: "1", email: "user@example.com", role: "USER" },
        token: "new-token",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "stored-token");

    await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email: "user@example.com", password: "password123" },
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);

    expect(url).toBe("/api/auth/login");
    expect(init.method).toBe("POST");
    expect(headers.get("Authorization")).toBe("Bearer stored-token");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(init.body).toBe(
      JSON.stringify({ email: "user@example.com", password: "password123" }),
    );
  });

  it("clears the session and notifies the app on a 401 response", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "expired-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response(401, {
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        }),
      ),
    );

    await expect(apiRequest("/api/vehicles")).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED",
    });
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("returns without parsing a body for 204 responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(204));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/api/vehicles/1", { method: "DELETE" })).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
