import { act, render, screen, waitFor, within } from "@testing-library/react";
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

    const inventory = await screen.findByRole("region", { name: "Inventory" });

    await waitFor(() => {
      expect(
        within(inventory).getAllByRole("button", { name: "Purchase" }).length,
      ).toBeGreaterThan(0);
    });

    const purchaseButtons = within(inventory).getAllByRole("button", {
      name: "Purchase",
    });
    const firstPurchase = purchaseButtons[0];
    expect(firstPurchase).toBeDefined();
    await user.click(firstPurchase!);

    await waitFor(() => {
      expect(screen.getByText("Just sold out")).toBeTruthy();
    });

    expect(within(inventory).getByRole("heading", { name: "Honda Civic" })).toBeTruthy();
    expect(within(inventory).getByRole("button", { name: "Purchase" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Out of stock" })).toBeTruthy();
    expect(screen.queryByText("Loading")).toBeNull();
    expect(mockedSearch).toHaveBeenCalledTimes(1);
  });

  it("shows skeleton placeholders while inventory is loading", async () => {
    vi.useFakeTimers();
    mockedSearch.mockImplementation(
      () => new Promise(() => {
        /* pending until test ends */
      }),
    );

    renderDashboard();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    const inventory = screen.getByRole("region", { name: "Inventory" });
    expect(inventory.querySelectorAll(".skeleton").length).toBeGreaterThanOrEqual(6);

    vi.useRealTimers();
  });
});
