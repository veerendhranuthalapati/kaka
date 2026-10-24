import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { VehicleDataProvider } from "../data/VehicleDataProvider";
import { makeVehicle } from "../test/fixtures";
import { InventoryVehicleCard } from "./InventoryVehicleCard";

describe("InventoryVehicleCard", () => {
  it("shows title, year subtitle, spec chips, and view details link", () => {
    render(
      <MemoryRouter>
        <VehicleDataProvider>
        <InventoryVehicleCard
          vehicle={makeVehicle({
            id: "card-1",
            make: "Toyota",
            model: "Camry",
            year: 2022,
            odometerKm: 12000,
            fuelType: "PETROL",
            transmission: "AUTOMATIC",
            category: "Sedan",
          })}
          purchasing={false}
          canManage={false}
          onPurchase={vi.fn()}
        />
        </VehicleDataProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Toyota Camry" })).toBeTruthy();
    expect(screen.getByText("2022")).toBeTruthy();
    expect(screen.getByText("12,000 km")).toBeTruthy();
    expect(screen.getByText("Petrol")).toBeTruthy();
    const link = screen.getByRole("link", { name: /view details/i });
    expect(link.getAttribute("href")).toBe("/vehicles/card-1");
  });
});
