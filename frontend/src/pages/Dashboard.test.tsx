import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, TOKEN_STORAGE_KEY } from "../api/client";
import * as vehiclesApi from "../api/vehicles";
import { AuthProvider } from "../auth/AuthContext";
import { makeToken, makeVehicle } from "../test/fixtures";
import { DashboardPage } from "./Dashboard";

vi.mock("../api/vehicles", () => ({
  searchVehicles: vi.fn(),
  purchaseVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
  restockVehicle: vi.fn(),
}));

const mockedSearch = vi.mocked(vehiclesApi.searchVehicles);
const mockedPurchase = vi.mocked(vehiclesApi.purchaseVehicle);

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("DashboardPage purchase flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem(TOKEN_STORAGE_KEY, makeToken("USER"));
    mockedSearch.mockResolvedValue([
      makeVehicle({
        id: "vehicle-a",
        make: "Ford",
        model: "F-150",
        quantity: 1,
      }),
      makeVehicle({
        id: "vehicle-b",
        make: "Honda",
        model: "Civic",
        quantity: 2,
      }),
    ]);
  });

  it("on OUT_OF_STOCK shows Just sold out, updates only that card, and keeps the grid visible", async () => {
    const user = userEvent.setup();
    mockedPurchase.mockRejectedValue(
      new ApiError(409, "OUT_OF_STOCK", "Vehicle is out of stock"),
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Ford F-150" })).toBeTruthy();
    });

    const purchaseButtons = screen.getAllByRole("button", { name: "Purchase" });
    await user.click(purchaseButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Just sold out")).toBeTruthy();
    });

    expect(screen.getByRole("heading", { name: "Honda Civic" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Purchase" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Out of stock" })).toBeTruthy();
    expect(screen.queryByText("Loading")).toBeNull();
    expect(mockedSearch).toHaveBeenCalledTimes(1);
  });
});
