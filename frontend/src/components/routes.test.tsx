import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import { seedAuthSession } from "../test/fixtures";
import { AdminRoute } from "./AdminRoute";
import { ProtectedRoute } from "./ProtectedRoute";

function renderRoutes(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<p>Login screen</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>Dashboard screen</p>} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<p>Admin screen</p>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("route guards", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("redirects anonymous visitors from a protected route to login", () => {
    renderRoutes("/");

    expect(screen.getByText("Login screen")).toBeTruthy();
    expect(screen.queryByText("Dashboard screen")).toBeNull();
  });

  it("allows an authenticated user through ProtectedRoute", () => {
    seedAuthSession("USER");
    renderRoutes("/");

    expect(screen.getByText("Dashboard screen")).toBeTruthy();
  });

  it("redirects a non-admin away from an admin route", () => {
    seedAuthSession("USER");
    renderRoutes("/admin");

    expect(screen.getByText("Dashboard screen")).toBeTruthy();
    expect(screen.queryByText("Admin screen")).toBeNull();
  });

  it("allows an admin through AdminRoute", () => {
    seedAuthSession("ADMIN");
    renderRoutes("/admin");

    expect(screen.getByText("Admin screen")).toBeTruthy();
  });

  it("redirects anonymous visitors from admin routes to login", () => {
    renderRoutes("/admin");

    expect(screen.getByText("Login screen")).toBeTruthy();
    expect(screen.queryByText("Admin screen")).toBeNull();
  });
});
