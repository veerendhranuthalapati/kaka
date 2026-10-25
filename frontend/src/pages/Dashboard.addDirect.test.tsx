import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as adminApi from "../api/admin";
import { ApiError, TOKEN_STORAGE_KEY } from "../api/client";
import * as vehiclesApi from "../api/vehicles";
import { AuthProvider } from "../auth/AuthContext";
import { VehicleDataProvider } from "../data/VehicleDataProvider";
import { resetVehicleDataCacheForTests } from "../data/vehicleDataCache";
import { makeToken, makeVehicle } from "../test/fixtures";
import { DashboardPage } from "./Dashboard";

vi.mock("../api/vehicles", () => ({
  searchVehicles: vi.fn(),
  purchaseVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
  restockVehicle: vi.fn(),
  createVehicle: vi.fn(),
}));

vi.mock("../api/admin", () => ({
  loadDemoVehicles: vi.fn(),
  DEMO_VEHICLES_DISABLED_MESSAGE:
    "Sample data loading is disabled on this server. Set DEMO_DATA_ENDPOINT_ENABLED=true to allow it.",
}));

const mockedSearch = vi.mocked(vehiclesApi.searchVehicles);
const mockedCreate = vi.mocked(vehiclesApi.createVehicle);
const mockedLoadDemo = vi.mocked(adminApi.loadDemoVehicles);

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <VehicleDataProvider>
          <DashboardPage />
        </VehicleDataProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("Dashboard admin add-direct flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetVehicleDataCacheForTests();
    mockedSearch.mockResolvedValue([]);
  });

  it("shows Add vehicle only for ADMIN", async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, makeToken("USER"));
    renderDashboard();
    await screen.findByRole("region", { name: "Inventory" });
    expect(screen.queryByRole("button", { name: "Add vehicle" })).toBeNull();
  });

  it("opens drawer, submits valid payload, closes and inserts card", async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, makeToken("ADMIN"));
    const user = userEvent.setup();
    const created = makeVehicle({
      id: "new-1",
      make: "Apex",
      model: "Trail",
      category: "SUV",
      price: 42000,
      quantity: 2,
    });
    mockedCreate.mockResolvedValue(created);

    renderDashboard();
    await user.click(await screen.findByRole("button", { name: "Add vehicle" }));
    expect(
      await screen.findByRole("dialog", { name: "Add vehicle" }),
    ).toBeTruthy();

    await user.type(screen.getByLabelText(/^Make$/i), "Apex");
    await user.type(screen.getByLabelText(/^Model$/i), "Trail");
    await user.type(screen.getByLabelText(/^Category$/i), "SUV");
    await user.type(screen.getByLabelText(/^Price$/i), "42000");
    await user.type(screen.getByLabelText(/^Quantity$/i), "2");
    await user.click(screen.getByRole("button", { name: "Create vehicle" }));

    await waitFor(() => {
      expect(mockedCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          make: "Apex",
          model: "Trail",
          category: "SUV",
          price: 42000,
          quantity: 2,
        }),
      );
    });
    expect(screen.queryByRole("dialog", { name: "Add vehicle" })).toBeNull();
    const inventory = screen.getByRole("region", { name: "Inventory" });
    expect(
      await within(inventory).findByRole("heading", { level: 3, name: "Apex Trail" }),
    ).toBeTruthy();
    expect(screen.getByText("Added Apex Trail")).toBeTruthy();
    expect(mockedSearch).toHaveBeenCalledTimes(1);
  });

  it("keeps drawer open on server field errors", async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, makeToken("ADMIN"));
    const user = userEvent.setup();
    mockedCreate.mockRejectedValue(
      new ApiError(400, "VALIDATION_ERROR", "Invalid", {
        fieldErrors: { make: ["Make is required"] },
      }),
    );

    renderDashboard();
    await user.click(await screen.findByRole("button", { name: "Add vehicle" }));
    await user.click(screen.getByRole("button", { name: "Create vehicle" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Add vehicle" })).toBeTruthy();
    });
  });

  it("asks before closing a dirty drawer with Escape", async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, makeToken("ADMIN"));
    const user = userEvent.setup();
    renderDashboard();
    await user.click(await screen.findByRole("button", { name: "Add vehicle" }));
    await user.type(screen.getByLabelText(/^Make$/i), "Dirty");
    await user.keyboard("{Escape}");
    expect(screen.getByText("Discard changes?")).toBeTruthy();
    expect(screen.getByRole("dialog", { name: "Add vehicle" })).toBeTruthy();
  });

  it("prefills duplicate without submitting until save", async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, makeToken("ADMIN"));
    const user = userEvent.setup();
    const source = makeVehicle({
      id: "src-1",
      make: "Nissan",
      model: "Leaf",
      vin: "1HGCM82633A004352",
      imageUrl: "/cars/leaf.svg",
      quantity: 4,
    });
    mockedSearch.mockResolvedValue([source]);

    renderDashboard();
    const inventory = await screen.findByRole("region", { name: "Inventory" });
    await user.click(
      within(inventory).getByRole("button", { name: "Duplicate" }),
    );
    expect(screen.getByRole("dialog", { name: "Add similar vehicle" })).toBeTruthy();
    expect((screen.getByLabelText(/^Make$/i) as HTMLInputElement).value).toBe(
      "Nissan",
    );
    expect((screen.getByLabelText(/^Model$/i) as HTMLInputElement).value).toBe(
      "Leaf",
    );
    expect((screen.getByLabelText(/^Quantity$/i) as HTMLInputElement).value).toBe(
      "1",
    );
    expect((screen.getByLabelText(/^VIN$/i) as HTMLInputElement).value).toBe("");
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("shows admin empty inventory state", async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, makeToken("ADMIN"));
    renderDashboard();
    expect(await screen.findByText("No vehicles yet")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Load sample vehicles" })).toBeTruthy();
  });

  it("shows user empty inventory state", async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, makeToken("USER"));
    renderDashboard();
    expect(
      await screen.findByText("No vehicles available right now"),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Load sample vehicles" })).toBeNull();
  });

  it("handles load sample success", async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, makeToken("ADMIN"));
    const user = userEvent.setup();
    mockedLoadDemo.mockResolvedValue({ created: 3, updated: 1, skipped: 0 });
    renderDashboard();
    await user.click(await screen.findByRole("button", { name: "Load sample vehicles" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => {
      expect(screen.getByText("Added 3, updated 1")).toBeTruthy();
    });
  });

  it("handles load sample 404", async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, makeToken("ADMIN"));
    const user = userEvent.setup();
    mockedLoadDemo.mockRejectedValue(new ApiError(404, "NOT_FOUND", "missing"));
    renderDashboard();
    await user.click(await screen.findByRole("button", { name: "Load sample vehicles" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => {
      expect(
        screen.getByText(adminApi.DEMO_VEHICLES_DISABLED_MESSAGE),
      ).toBeTruthy();
    });
  });

  it("drawer panel avoids horizontal overflow classes at mobile width", async () => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, makeToken("ADMIN"));
    const user = userEvent.setup();
    renderDashboard();
    await user.click(await screen.findByRole("button", { name: "Add vehicle" }));
    const drawer = document.querySelector(".vehicle-create-drawer");
    expect(drawer?.className).toContain("overflow-x-hidden");
    expect(drawer?.className).toContain("max-w-md");
  });
});
