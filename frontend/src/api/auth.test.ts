import { describe, expect, it, vi } from "vitest";
import { loginRequest, registerRequest } from "./auth";
import { apiRequest } from "./client";

vi.mock("./client", () => ({
  apiRequest: vi.fn(),
}));

describe("auth api", () => {
  it("posts credentials to login and register endpoints", async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      token: "t",
      user: { id: "1", email: "a@b.com", role: "USER" },
    });

    const credentials = { email: "a@b.com", password: "secret1234" };
    await loginRequest(credentials);
    expect(apiRequest).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      body: credentials,
    });

    await registerRequest(credentials);
    expect(apiRequest).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      body: credentials,
    });
  });
});
