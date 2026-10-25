import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authApi from "../api/auth";
import * as vehiclesApi from "../api/vehicles";
import { AuthProvider } from "../auth/AuthContext";
import { AppLayout } from "../components/AppLayout";
import { AppShell } from "../components/AppShell";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { VehicleDataProvider } from "../data/VehicleDataProvider";
import { resetVehicleDataCacheForTests } from "../data/vehicleDataCache";
import { makeToken, makeVehicle, seedAuthSession } from "../test/fixtures";
import { DashboardPage } from "./Dashboard";
import { LoginPage } from "./Login";

vi.mock("../api/auth", () => ({
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
  logoutRequest: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../api/vehicles", () => ({
  searchVehicles: vi.fn(),
  getVehicleById: vi.fn(),
  purchaseVehicle: vi.fn(),
  createVehicle: vi.fn(),
  updateVehicle: vi.fn(),
  restockVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
}));

vi.mock("../components/HeroCarousel", () => ({
  HeroCarousel: () => null,
}));

const mockedLogin = vi.mocked(authApi.loginRequest);
const mockedSearch = vi.mocked(vehiclesApi.searchVehicles);

function mockMatchMedia(reduced: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("reduce") ? reduced : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function renderPostLoginRoutes(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <VehicleDataProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<DashboardPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </VehicleDataProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("post-login dashboard smoke", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    resetVehicleDataCacheForTests();
    vi.stubGlobal("scrollTo", vi.fn());
    mockedSearch.mockResolvedValue([
      makeVehicle({ id: "v1", make: "Ford", model: "F-150" }),
    ]);
    mockedLogin.mockResolvedValue({
      token: makeToken("USER", { tv: 1 }),
      user: { id: "user-1", email: "driver@example.com", role: "USER" },
    });
  });

  async function loginThroughUi(reducedMotion: boolean) {
    mockMatchMedia(reducedMotion);
    const user = userEvent.setup();
    renderPostLoginRoutes("/login");

    await screen.findByLabelText("Email");
    await user.type(screen.getByLabelText("Email"), "driver@example.com");
    await user.type(screen.getByLabelText("Password"), "validPassword123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /find your next drive/i })).toBeTruthy();
    });
    expect(screen.getByTestId("app-top-bar")).toBeTruthy();
    expect(screen.getByRole("region", { name: "Inventory" })).toBeTruthy();
  }

  it("lands on a visible dashboard when prefers-reduced-motion is reduce", async () => {
    await loginThroughUi(true);
  });

  it("lands on a visible dashboard when prefers-reduced-motion is no-preference", async () => {
    await loginThroughUi(false);
  });

  it("shows inventory cards when search returns 200", async () => {
    await loginThroughUi(true);
    expect(await screen.findByText(/F-150/i)).toBeTruthy();
  });

  it("shows error UI for 500 responses", async () => {
    mockMatchMedia(true);
    const { ApiError } = await import("../api/client");
    mockedSearch.mockRejectedValue(
      new ApiError(500, "INTERNAL_ERROR", "Server blew up"),
    );
    seedAuthSession("USER");
    renderPostLoginRoutes("/");

    await waitFor(() => {
      expect(screen.getByText(/could not load inventory/i)).toBeTruthy();
    });
    expect(screen.getByRole("heading", { name: /find your next drive/i })).toBeTruthy();
  });

  it("shows error UI for 401 responses", async () => {
    mockMatchMedia(true);
    const { ApiError } = await import("../api/client");
    mockedSearch.mockRejectedValue(new ApiError(401, "UNAUTHORIZED", "Session expired"));
    seedAuthSession("USER");
    renderPostLoginRoutes("/");

    await waitFor(() => {
      expect(screen.getByText(/session expired/i)).toBeTruthy();
    });
    expect(screen.getByRole("heading", { name: /find your next drive/i })).toBeTruthy();
  });

  it("shows error UI for network failures", async () => {
    mockMatchMedia(true);
    const { ApiError } = await import("../api/client");
    mockedSearch.mockRejectedValue(
      new ApiError(0, "NETWORK_ERROR", "Cannot reach the server. Check your connection."),
    );
    seedAuthSession("USER");
    renderPostLoginRoutes("/");

    await waitFor(() => {
      expect(screen.getByText(/cannot reach the server/i)).toBeTruthy();
    });
    expect(screen.getByRole("heading", { name: /find your next drive/i })).toBeTruthy();
  });
});
