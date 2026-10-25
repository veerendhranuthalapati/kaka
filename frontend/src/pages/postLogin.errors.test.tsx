import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vehiclesApi from "../api/vehicles";
import { AuthProvider } from "../auth/AuthContext";
import { AppLayout } from "../components/AppLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { VehicleDataProvider } from "../data/VehicleDataProvider";
import { resetVehicleDataCacheForTests } from "../data/vehicleDataCache";
import { seedAuthSession } from "../test/fixtures";
import { DashboardPage } from "./Dashboard";

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

const mockedSearch = vi.mocked(vehiclesApi.searchVehicles);

function renderDashboardRoute() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider>
        <VehicleDataProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardPage />} />
              </Route>
            </Route>
          </Routes>
        </VehicleDataProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("post-login dashboard errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    resetVehicleDataCacheForTests();
    vi.stubGlobal("scrollTo", vi.fn());
    seedAuthSession("USER");
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  it("shows error UI for 500 responses", async () => {
    const { ApiError } = await import("../api/client");
    mockedSearch.mockRejectedValue(
      new ApiError(500, "INTERNAL_ERROR", "Server blew up"),
    );
    renderDashboardRoute();

    await waitFor(() => {
      expect(screen.getByText(/could not load inventory/i)).toBeTruthy();
    });
    expect(screen.getByRole("heading", { name: /find your next drive/i })).toBeTruthy();
    expect(screen.getByTestId("app-top-bar")).toBeTruthy();
  });

  it("shows error UI for 401 responses", async () => {
    const { ApiError } = await import("../api/client");
    mockedSearch.mockRejectedValue(new ApiError(401, "UNAUTHORIZED", "Session expired"));
    renderDashboardRoute();

    await waitFor(() => {
      expect(screen.getByText(/session expired/i)).toBeTruthy();
    });
    expect(screen.getByRole("heading", { name: /find your next drive/i })).toBeTruthy();
  });

  it("shows error UI for network failures", async () => {
    const { ApiError } = await import("../api/client");
    mockedSearch.mockRejectedValue(
      new ApiError(0, "NETWORK_ERROR", "Cannot reach the server. Check your connection."),
    );
    renderDashboardRoute();

    await waitFor(() => {
      expect(screen.getByText(/cannot reach the server/i)).toBeTruthy();
    });
    expect(screen.getByRole("heading", { name: /find your next drive/i })).toBeTruthy();
  });
});
