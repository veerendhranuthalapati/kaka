import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginRequest, registerRequest } from "../api/auth";
import { ApiError, handleUnauthorized, TOKEN_STORAGE_KEY } from "../api/client";
import type { AuthResponse, Role } from "../types";
import { AuthProvider, useAuth } from "./AuthContext";

vi.mock("../api/auth", () => ({
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
}));

const mockedLogin = vi.mocked(loginRequest);
const mockedRegister = vi.mocked(registerRequest);

function tokenFor(payload: {
  sub: string;
  email: string;
  role: Role;
  exp: number;
}): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/, "");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

function Probe() {
  const { user, token, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="email">{user?.email ?? "anonymous"}</p>
      <p data-testid="role">{user?.role ?? "none"}</p>
      <p data-testid="token">{token ?? "no-token"}</p>
      <button onClick={() => void login("user@example.com", "password123")}>
        Log in
      </button>
      <button onClick={logout}>Log out</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <AuthProvider>
        <Routes>
          <Route path="/dashboard" element={<Probe />} />
          <Route path="/login" element={<p>Login screen</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    mockedLogin.mockReset();
    mockedRegister.mockReset();
  });

  it("logs in from the JWT claims and stores only the token", async () => {
    const user = userEvent.setup();
    const token = tokenFor({
      sub: "user-1",
      email: "token@example.com",
      role: "USER",
      exp: Math.floor(Date.now() / 1000) + 3_600,
    });
    const response: AuthResponse = {
      user: { id: "user-1", email: "server@example.com", role: "USER" },
      token,
    };
    mockedLogin.mockResolvedValue(response);

    renderAuth();
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(screen.getByTestId("email").textContent).toBe("token@example.com");
    });
    expect(screen.getByTestId("role").textContent).toBe("USER");
    expect(screen.getByTestId("token").textContent).toBe(token);
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe(token);
  });

  it("logs out and clears the stored token", async () => {
    const user = userEvent.setup();
    const token = tokenFor({
      sub: "user-1",
      email: "user@example.com",
      role: "USER",
      exp: Math.floor(Date.now() / 1000) + 3_600,
    });
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);

    renderAuth();
    expect(screen.getByTestId("email").textContent).toBe("user@example.com");

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(screen.getByTestId("email").textContent).toBe("anonymous");
    expect(screen.getByTestId("token").textContent).toBe("no-token");
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it("discards an expired token when the app loads", () => {
    sessionStorage.setItem(
      TOKEN_STORAGE_KEY,
      tokenFor({
        sub: "user-1",
        email: "expired@example.com",
        role: "USER",
        exp: Math.floor(Date.now() / 1000) - 60,
      }),
    );

    renderAuth();

    expect(screen.getByTestId("email").textContent).toBe("anonymous");
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it("clears the session and redirects when the API reports unauthorized", async () => {
    sessionStorage.setItem(
      TOKEN_STORAGE_KEY,
      tokenFor({
        sub: "user-1",
        email: "user@example.com",
        role: "USER",
        exp: Math.floor(Date.now() / 1000) + 3_600,
      }),
    );

    renderAuth();
    handleUnauthorized();

    expect(await screen.findByText("Login screen")).toBeTruthy();
    expect(screen.queryByTestId("email")).toBeNull();
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it("rethrows API failures without creating a session", async () => {
    const user = userEvent.setup();
    mockedLogin.mockRejectedValue(
      new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password"),
    );

    function FailingProbe() {
      const { user: currentUser, login } = useAuth();
      const [error, setError] = useState("no error");

      return (
        <>
          <button
            onClick={() =>
              void login("user@example.com", "wrong-password").catch(
                (caught: unknown) =>
                  setError(caught instanceof Error ? caught.message : "unknown"),
              )
            }
          >
            {currentUser ? currentUser.email : "anonymous"}
          </button>
          <p>{error}</p>
        </>
      );
    }

    render(
      <MemoryRouter>
        <AuthProvider>
          <FailingProbe />
        </AuthProvider>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "anonymous" }));

    expect(await screen.findByText("Invalid email or password")).toBeTruthy();
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });
});
