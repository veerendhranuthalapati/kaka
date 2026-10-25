import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import { TopBar } from "./TopBar";
import { RouteErrorBoundary } from "./RouteErrorBoundary";

function Bomb(): never {
  throw new Error("boom");
}

describe("RouteErrorBoundary", () => {
  it("shows fallback while keeping the top bar visible", () => {
    const onLogout = vi.fn();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <TopBar user={{ id: "1", email: "a@b.co", role: "USER" }} onLogout={onLogout} />
          <RouteErrorBoundary>
            <Routes>
              <Route path="/" element={<Bomb />} />
            </Routes>
          </RouteErrorBoundary>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("app-top-bar")).toBeTruthy();
    expect(screen.getByTestId("route-error-fallback")).toBeTruthy();
    expect(screen.getByRole("button", { name: /reload/i })).toBeTruthy();
  });

  it("recovers after navigating to a safe route", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/broken"]}>
        <AuthProvider>
          <RouteErrorBoundary>
            <Routes>
              <Route path="/" element={<p>Recovered page</p>} />
              <Route path="/broken" element={<Bomb />} />
            </Routes>
          </RouteErrorBoundary>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("route-error-fallback")).toBeTruthy();
    await user.click(screen.getByRole("link", { name: /go to home/i }));
    expect(await screen.findByText("Recovered page")).toBeTruthy();
  });
});
