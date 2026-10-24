import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import {
  getVehicle,
  restockVehicle,
  updateVehicle,
} from "../../api/vehicles";
import { ApiError } from "../../api/client";
import { makeVehicle } from "../../test/fixtures";
import { EditVehiclePage } from "./EditVehicle";

const mockNavigate = vi.fn();

vi.mock("../../api/vehicles", () => ({
  getVehicle: vi.fn(),
  updateVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
  restockVehicle: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "1", email: "admin@test.com", role: "ADMIN" },
  }),
}));

describe("EditVehiclePage", () => {
  it("does not expose a quantity field and surfaces server errors", async () => {
    const vehicle = makeVehicle({ id: "edit-1", make: "Aurora", model: "LX" });
    vi.mocked(getVehicle).mockResolvedValueOnce(vehicle);
    vi.mocked(updateVehicle).mockRejectedValueOnce(
      new ApiError(400, "VALIDATION_ERROR", "Invalid price"),
    );

    render(
      <MemoryRouter initialEntries={["/admin/vehicles/edit-1/edit"]}>
        <Routes>
          <Route path="/admin/vehicles/:id/edit" element={<EditVehiclePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Aurora")).toBeTruthy();
    });

    expect(screen.queryByLabelText("Quantity")).toBeNull();
    expect(screen.getByText(/managed via restock/i)).toBeTruthy();

    await userEvent.setup().click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("Invalid price");
    });
  });

  it("validates imageUrl and navigates home after a successful save", async () => {
    const vehicle = makeVehicle({
      id: "edit-2",
      make: "Aurora",
      model: "LX",
      imageUrl: "/cars/aurora-lx.jpg",
    });
    vi.mocked(getVehicle).mockResolvedValueOnce(vehicle);
    vi.mocked(updateVehicle).mockResolvedValueOnce(vehicle);

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/admin/vehicles/edit-2/edit"]}>
        <Routes>
          <Route path="/admin/vehicles/:id/edit" element={<EditVehiclePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Aurora")).toBeTruthy();
    });

    await user.clear(screen.getByLabelText("Image URL"));
    await user.type(screen.getByLabelText("Image URL"), "javascript:alert(1)");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByRole("alert").textContent).toMatch(/https/i);

    await user.clear(screen.getByLabelText("Image URL"));
    await user.type(screen.getByLabelText("Image URL"), "/cars/aurora-lx.jpg");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateVehicle).toHaveBeenCalledOnce();
    });
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("restocks inventory from the admin form", async () => {
    const vehicle = makeVehicle({ id: "edit-3", quantity: 2 });
    const restocked = { ...vehicle, quantity: 12 };
    vi.mocked(getVehicle).mockResolvedValueOnce(vehicle);
    vi.mocked(restockVehicle).mockResolvedValueOnce(restocked);

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/admin/vehicles/edit-3/edit"]}>
        <Routes>
          <Route path="/admin/vehicles/:id/edit" element={<EditVehiclePage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Quantity: 2/)).toBeTruthy();
    });

    await user.clear(screen.getByLabelText("Amount"));
    await user.type(screen.getByLabelText("Amount"), "10");
    await user.click(screen.getByRole("button", { name: "Restock" }));

    await waitFor(() => {
      expect(restockVehicle).toHaveBeenCalledWith("edit-3", 10);
    });
    expect(screen.getByText(/Quantity: 12/)).toBeTruthy();
  });
});
