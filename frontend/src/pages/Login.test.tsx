import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LoginPage } from "./Login";
import { ApiError } from "../api/client";

const mockLogin = vi.fn();

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    token: null,
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("LoginPage", () => {
  it("shows field-level error when email format is invalid", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByTestId("email-error").textContent).toContain(
      "Enter a valid email address.",
    );
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("shows field-level error when password is under 8 characters", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByTestId("password-error").textContent).toContain(
      "Password must be at least 8 characters.",
    );
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("shows server error on invalid credentials", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(
      new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password"),
    );

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid email or password")).toBeTruthy();
  });
});
