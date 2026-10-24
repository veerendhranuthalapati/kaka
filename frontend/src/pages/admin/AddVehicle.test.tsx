import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { createVehicle } from "../../api/vehicles";
import { AddVehiclePage } from "./AddVehicle";

const mockNavigate = vi.fn();

vi.mock("../../api/vehicles", () => ({
  createVehicle: vi.fn(),
}));

vi.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "1", email: "admin@test.com", role: "ADMIN" },
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("AddVehiclePage", () => {
  it("rejects invalid vehicle details before calling the API", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AddVehiclePage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Create vehicle" }));
    expect(screen.getByRole("alert").textContent).toContain(
      "Check the vehicle details",
    );
    expect(createVehicle).not.toHaveBeenCalled();
  });

  it("validates imageUrl client-side and creates a vehicle on success", async () => {
    const user = userEvent.setup();
    vi.mocked(createVehicle).mockResolvedValueOnce({
      id: "v1",
      make: "Aurora",
      model: "LX",
      category: "Sedan",
      price: 1000,
      quantity: 1,
      imageUrl: "/cars/aurora-lx.jpg",
      createdAt: "",
      updatedAt: "",
    });

    render(
      <MemoryRouter>
        <AddVehiclePage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Make"), "Aurora");
    await user.type(screen.getByLabelText("Model"), "LX");
    await user.type(screen.getByLabelText("Category"), "Sedan");
    await user.type(screen.getByLabelText("Price"), "1000");
    await user.type(screen.getByLabelText("Quantity"), "1");
    await user.type(screen.getByLabelText("Image URL"), "http://bad.example/x.jpg");
    await user.click(screen.getByRole("button", { name: "Create vehicle" }));

    expect(screen.getByRole("alert").textContent).toMatch(/https/i);

    await user.clear(screen.getByLabelText("Image URL"));
    await user.type(screen.getByLabelText("Image URL"), "/cars/aurora-lx.jpg");
    await user.click(screen.getByRole("button", { name: "Create vehicle" }));

    await waitFor(() => {
      expect(createVehicle).toHaveBeenCalledOnce();
    });
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });
});
