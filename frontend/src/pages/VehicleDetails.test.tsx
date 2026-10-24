import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/client";
import { getVehicleById } from "../api/vehicles";
import type { Role } from "../types";
import { makeToken, makeVehicle } from "../test/fixtures";
import { VehicleDataProvider } from "../data/VehicleDataProvider";
import { VehicleDetailsPage } from "./VehicleDetails";

vi.mock("../api/vehicles", () => ({
  getVehicleById: vi.fn(),
  purchaseVehicle: vi.fn(),
}));

const authState: { user: { id: string; email: string; role: Role } } = {
  user: { id: "1", email: "u@test.com", role: "USER" },
};

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    user: authState.user,
    token: makeToken(authState.user.role),
  }),
}));

function renderAt(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/vehicles/${id}`]}>
      <Routes>
        <Route
          path="/vehicles/:id"
          element={
            <VehicleDataProvider>
              <VehicleDetailsPage />
            </VehicleDataProvider>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("VehicleDetailsPage", () => {
  it("renders specs and shows dash for missing values", async () => {
    vi.mocked(getVehicleById).mockResolvedValueOnce(
      makeVehicle({
        id: "v1",
        make: "Toyota",
        model: "Camry",
        year: 2022,
        odometerKm: 12400,
        engineCc: null,
        fuelType: "PETROL",
      }),
    );

    renderAt("v1");

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/Toyota/);
    });
    expect(screen.getByText("12,400 km")).toBeTruthy();
    expect(screen.getByText("Petrol")).toBeTruthy();
    expect(screen.queryByText("Engine (cc)")).toBeNull();
  });

  it("shows empty specs copy and admin edit link", async () => {
    authState.user = { id: "1", email: "a@test.com", role: "ADMIN" };
    vi.mocked(getVehicleById).mockResolvedValueOnce(
      makeVehicle({
        id: "v-empty",
        year: null,
        odometerKm: null,
        engineCc: null,
        powerBhp: null,
        torqueNm: null,
        fuelType: null,
        transmission: null,
        drivetrain: null,
        fuelEconomyKmpl: null,
        color: null,
        owners: null,
        vin: null,
      }),
    );

    renderAt("v-empty");

    await waitFor(() => {
      expect(screen.getByText(/Specifications not provided yet/i)).toBeTruthy();
    });
    expect(screen.getByRole("link", { name: "Add specifications" }).getAttribute("href")).toBe(
      "/admin/vehicles/v-empty/edit",
    );
    authState.user = { id: "1", email: "u@test.com", role: "USER" };
  });

  it("shows 404 state when vehicle is missing", async () => {
    vi.mocked(getVehicleById).mockRejectedValueOnce(
      new ApiError(404, "NOT_FOUND", "Vehicle not found"),
    );

    renderAt("missing");

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeTruthy();
    });
  });

  it("disables purchase when quantity is zero", async () => {
    vi.mocked(getVehicleById).mockResolvedValueOnce(
      makeVehicle({ id: "v0", quantity: 0 }),
    );

    renderAt("v0");

    await waitFor(() => {
      const button = screen.getByRole("button", { name: /out of stock/i });
      expect(button.hasAttribute("disabled")).toBe(true);
    });
  });
});
