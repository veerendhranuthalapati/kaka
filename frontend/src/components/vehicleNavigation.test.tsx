import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { VehicleDataProvider } from "../data/VehicleDataProvider";
import { makeVehicle } from "../test/fixtures";
import { HeroCarousel } from "./HeroCarousel";
import { InventoryVehicleCard } from "./InventoryVehicleCard";

describe("clickable vehicle images", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
  });

  function renderCard(overrides: Partial<ReturnType<typeof makeVehicle>> = {}) {
    const vehicle = makeVehicle({
      id: "card-1",
      make: "Toyota",
      model: "Camry",
      imageUrl: null,
      category: "Sedan",
      ...overrides,
    });
    return render(
      <MemoryRouter>
        <VehicleDataProvider>
          <InventoryVehicleCard
            vehicle={vehicle}
            purchasing={false}
            canManage={false}
            onPurchase={vi.fn()}
          />
        </VehicleDataProvider>
      </MemoryRouter>,
    );
  }

  it("wraps grid card images in a details link with tabIndex -1", () => {
    renderCard();
    const imageLink = screen.getByRole("link", {
      name: "View details for Toyota Camry",
    });
    expect(imageLink.getAttribute("href")).toBe("/vehicles/card-1");
    expect(imageLink.tabIndex).toBe(-1);
  });

  it("links fallback images to the details page", () => {
    renderCard({ imageUrl: null });
    expect(
      screen.getByRole("link", { name: "View details for Toyota Camry" }),
    ).toBeTruthy();
  });

  it("does not navigate when Purchase is clicked", async () => {
    const user = userEvent.setup();
    const onPurchase = vi.fn();
    const vehicle = makeVehicle({ id: "p-1", make: "A", model: "B" });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <VehicleDataProvider>
                <InventoryVehicleCard
                  vehicle={vehicle}
                  purchasing={false}
                  canManage={true}
                  onPurchase={onPurchase}
                  onEdit={vi.fn()}
                  onRestock={vi.fn()}
                  onDelete={vi.fn()}
                />
              </VehicleDataProvider>
            }
          />
          <Route path="/vehicles/:id" element={<p>Details page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Purchase" }));
    expect(onPurchase).toHaveBeenCalled();
    expect(screen.queryByText("Details page")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.queryByText("Details page")).toBeNull();
  });

  it("allows default browser handling for ctrl+click on the image link", () => {
    renderCard();
    const imageLink = screen.getByRole("link", {
      name: "View details for Toyota Camry",
    });
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    const prevented = !imageLink.dispatchEvent(event);
    expect(prevented).toBe(false);
  });

  it("hero slide image links to vehicle details", () => {
    const vehicles = [
      makeVehicle({ id: "hero-1", make: "Aurora", model: "One", quantity: 2 }),
    ];
    render(
      <MemoryRouter>
        <VehicleDataProvider>
          <HeroCarousel
            vehicles={vehicles}
            purchasingId={null}
            onPurchase={vi.fn()}
          />
        </VehicleDataProvider>
      </MemoryRouter>,
    );
    const imageLink = screen.getByRole("link", {
      name: "View details for Aurora One",
    });
    expect(imageLink.getAttribute("href")).toBe("/vehicles/hero-1");
    expect(imageLink.tabIndex).toBe(-1);
  });
});
