import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RegisterPage } from "./Register";
import { ApiError } from "../api/client";

const mockRegister = vi.fn();

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    register: mockRegister,
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("RegisterPage", () => {
  it("shows field-level error when email format is invalid", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "invalid-email");
    await user.type(screen.getByLabelText("Password"), "validPassword123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByTestId("email-error").textContent).toContain(
      "Enter a valid email address.",
    );
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("shows field-level error when password exceeds 72 UTF-8 bytes", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    // 20 emojis is 80 bytes in UTF-8
    await user.type(screen.getByLabelText("Password"), "😀".repeat(20));
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByTestId("password-error").textContent).toContain(
      "Password must be at most 72 UTF-8 bytes.",
    );
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("shows field-level server error under the right inputs from ApiError", async () => {
    const user = userEvent.setup();
    const apiError = new ApiError(
      400,
      "VALIDATION_ERROR",
      "Invalid request body",
      {
        fieldErrors: {
          email: ["Email already in use"],
          password: ["Password is too weak"],
        },
      },
    );
    mockRegister.mockRejectedValueOnce(apiError);

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "validPassword123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    const emailErr = await screen.findByTestId("email-error");
    expect(emailErr.textContent).toContain("Email already in use");
    expect(screen.getByTestId("password-error").textContent).toContain(
      "Password is too weak",
    );
  });
});
