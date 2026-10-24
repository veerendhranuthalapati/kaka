import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { createVehicle } from "../../api/vehicles";
import { makeVehicle } from "../../test/fixtures";
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
    const alerts = screen.getAllByRole("alert");
    expect(
      alerts.some((node) => node.textContent?.includes("Check the vehicle details")),
    ).toBe(true);
    expect(createVehicle).not.toHaveBeenCalled();
  });

  it("validates imageUrl client-side and creates a vehicle on success", async () => {
    const user = userEvent.setup();
    vi.mocked(createVehicle).mockResolvedValueOnce(
      makeVehicle({
        id: "v1",
        make: "Aurora",
        model: "LX",
        price: 1000,
        quantity: 1,
        imageUrl: "/cars/aurora-lx.jpg",
        createdAt: "",
        updatedAt: "",
      }),
    );

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
    await user.type(screen.getByLabelText(/image url/i), "http://bad.example/x.jpg");
    await user.click(screen.getByRole("button", { name: "Create vehicle" }));

    expect(
      screen.getAllByRole("alert").some((node) => /https/i.test(node.textContent ?? "")),
    ).toBe(true);

    await user.clear(screen.getByLabelText(/image url/i));
    await user.type(screen.getByLabelText(/image url/i), "/cars/aurora-lx.jpg");
    await user.click(screen.getByRole("button", { name: "Create vehicle" }));

    await waitFor(() => {
      expect(createVehicle).toHaveBeenCalledOnce();
    });
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("submits without imageUrl and previews the category illustration", async () => {
    const user = userEvent.setup();
    vi.mocked(createVehicle).mockResolvedValueOnce(
      makeVehicle({
        id: "v2",
        make: "Aurora",
        model: "LX",
        price: 1000,
        quantity: 1,
        imageUrl: null,
        createdAt: "",
        updatedAt: "",
      }),
    );

    render(
      <MemoryRouter>
        <AddVehiclePage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Category"), "SUV");
    const preview = screen.getByTestId("vehicle-image-preview").querySelector("img");
    expect(preview?.getAttribute("src")).toContain("/cars/suv-01.svg");

    await user.type(screen.getByLabelText("Make"), "Aurora");
    await user.type(screen.getByLabelText("Model"), "LX");
    await user.type(screen.getByLabelText("Price"), "1000");
    await user.type(screen.getByLabelText("Quantity"), "1");
    await user.click(screen.getByRole("button", { name: "Create vehicle" }));

    await waitFor(() => {
      expect(createVehicle).toHaveBeenCalledWith({
        make: "Aurora",
        model: "LX",
        category: "SUV",
        price: 1000,
        quantity: 1,
        imageUrl: null,
      });
    });
  });

  it("clears the image URL and switches the preview to the category illustration", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AddVehiclePage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Category"), "Sedan");
    await user.type(screen.getByLabelText(/image url/i), "/cars/suv-01.svg");
    const preview = screen.getByTestId("vehicle-image-preview").querySelector("img");
    expect(preview?.getAttribute("src")).toContain("/cars/suv-01.svg");

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(preview?.getAttribute("src")).toContain("/cars/sedan-01.svg");
  });
});
