import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/client";
import { getVehicleById } from "../api/vehicles";
import { makeToken, makeVehicle } from "../test/fixtures";
import { VehicleDetailsPage } from "./VehicleDetails";

vi.mock("../api/vehicles", () => ({
  getVehicleById: vi.fn(),
  purchaseVehicle: vi.fn(),
}));

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "1", email: "u@test.com", role: "USER" },
    token: makeToken("USER"),
  }),
}));

function renderAt(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/vehicles/${id}`]}>
      <Routes>
        <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
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
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
    expect(screen.getByText("Petrol")).toBeTruthy();
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
