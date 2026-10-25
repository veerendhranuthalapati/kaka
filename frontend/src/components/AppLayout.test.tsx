import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MemoryRouter,
  Route,
  Routes,
  createMemoryRouter,
  RouterProvider,
} from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../auth/AuthContext";
import { seedAuthSession } from "../test/fixtures";
import { AppLayout, isMinimalTopBarPath } from "./AppLayout";

describe("AppLayout top bar", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal("scrollTo", vi.fn());
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("reduce"),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  it("marks auth and unknown routes as minimal top bar paths", () => {
    expect(isMinimalTopBarPath("/login")).toBe(true);
    expect(isMinimalTopBarPath("/credits")).toBe(true);
    expect(isMinimalTopBarPath("/nope")).toBe(true);
    expect(isMinimalTopBarPath("/")).toBe(false);
    expect(isMinimalTopBarPath("/vehicles/abc")).toBe(false);
  });

  it("renders the brand on login with home href", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/login" element={<p>Login body</p>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );
    const brand = screen.getByRole("link", { name: "Auto Yard, go to home" });
    expect(brand.getAttribute("href")).toBe("/");
    expect(screen.getByTestId("app-top-bar").className).toMatch(/sticky/);
    expect(screen.getByTestId("app-top-bar").className).toMatch(/z-40/);
    expect(brand.className).toMatch(/whitespace-nowrap/);
    expect(brand.className).toMatch(/shrink-0/);
  });

  it("keeps the same top bar element across outlet changes", async () => {
    const router = createMemoryRouter(
      [
        {
          element: (
            <AuthProvider>
              <AppLayout />
            </AuthProvider>
          ),
          children: [
            { path: "/login", element: <p>Login body</p> },
            { path: "/register", element: <p>Register body</p> },
          ],
        },
      ],
      { initialEntries: ["/login"] },
    );
    const { container } = render(<RouterProvider router={router} />);
    const barBefore = screen.getByTestId("app-top-bar");
    await router.navigate("/register");
    await waitFor(() => {
      expect(screen.getByText("Register body")).toBeTruthy();
    });
    const barAfter = screen.getByTestId("app-top-bar");
    expect(barBefore).toBe(barAfter);
    expect(container.contains(barAfter)).toBe(true);
  });

  it("scrolls to top on brand click when already on dashboard", async () => {
    seedAuthSession("USER");
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<p>Dashboard body</p>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("link", { name: "Auto Yard, go to home" }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
  });
});
