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

  it("produces a user-meaningful error on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(apiRequest("/api/auth/register", { method: "POST" })).rejects.toMatchObject({
      name: "ApiError",
      status: 0,
      code: "NETWORK_ERROR",
      message: "Cannot reach the server. Check your connection.",
    });
  });

  it("handles non-JSON bodies such as HTML by including status without leaking raw body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers({ "content-type": "text/html" }),
        json: async () => {
          throw new SyntaxError("Unexpected token < in JSON at position 0");
        },
        text: async () => "<!DOCTYPE html><html><body>404 Not Found</body></html>",
      } as unknown as Response),
    );

    const error = (await apiRequest("/api/auth/register", {
      method: "POST",
    }).catch((err: unknown) => err)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toContain("404");
    expect(error.message).not.toContain("<!DOCTYPE");
  });

  it("handles 429 responses with rate-limit message and reads Retry-After", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({
          "content-type": "application/json",
          "retry-after": "60",
        }),
        json: async () => ({
          error: { code: "TOO_MANY_REQUESTS", message: "Too many requests" },
        }),
      } as unknown as Response),
    );

    await expect(apiRequest("/api/auth/login", { method: "POST" })).rejects.toMatchObject({
      status: 429,
      code: "TOO_MANY_REQUESTS",
      message: "Too many attempts. Try again in a minute.",
    });
  });

  const gatewayMessage =
    "The server is temporarily unavailable. Please try again in a moment.";
  const serverGenericMessage =
    "Something went wrong on the server. Please try again.";

  it.each([502, 503, 504] as const)(
    "maps %i responses to a temporary unavailable message without leaking the body",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status,
          headers: new Headers({ "content-type": "text/html" }),
          json: async () => {
            throw new SyntaxError("Unexpected token < in JSON");
          },
          text: async () => "<html>Bad Gateway</html>",
        } as unknown as Response),
      );

      const error = (await apiRequest("/api/vehicles").catch(
        (err: unknown) => err,
      )) as ApiError;

      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(status);
      expect(error.message).toBe(gatewayMessage);
      expect(error.message).not.toContain("<html>");
    },
  );

  it.each([502, 503, 504] as const)(
    "maps %i JSON error envelopes to the temporary unavailable message",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          response(status, {
            error: {
              code: "UPSTREAM_ERROR",
              message: "nginx upstream timed out",
            },
          }),
        ),
      );

      await expect(apiRequest("/api/vehicles")).rejects.toMatchObject({
        status,
        message: gatewayMessage,
      });
    },
  );

  it("maps a 500 non-JSON body to a generic server message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ "content-type": "text/plain" }),
        json: async () => {
          throw new SyntaxError("Unexpected end of JSON input");
        },
        text: async () => "Internal Server Error stack trace here",
      } as unknown as Response),
    );

    const error = (await apiRequest("/api/vehicles").catch(
      (err: unknown) => err,
    )) as ApiError;

    expect(error.status).toBe(500);
    expect(error.message).toBe(serverGenericMessage);
    expect(error.message).not.toContain("stack trace");
  });

  it("keeps the server message for a 500 response with a valid error envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response(500, {
          error: {
            code: "INTERNAL_ERROR",
            message: "Database connection failed",
          },
        }),
      ),
    );

    await expect(apiRequest("/api/vehicles")).rejects.toMatchObject({
      status: 500,
      code: "INTERNAL_ERROR",
      message: "Database connection failed",
    });
  });

  it("maps VALIDATION_ERROR details to field-level messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response(400, {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: {
              fieldErrors: {
                email: ["Invalid email address"],
                password: ["Password must be at least 8 characters"],
              },
            },
          },
        }),
      ),
    );

    const error = (await apiRequest("/api/auth/register", {
      method: "POST",
    }).catch((err: unknown) => err)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Invalid request body");
    expect(error.fieldErrors).toEqual({
      email: "Invalid email address",
      password: "Password must be at least 8 characters",
    });
  });
});

