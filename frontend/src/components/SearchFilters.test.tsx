import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchFilters } from "./SearchFilters";

describe("SearchFilters", () => {
  it("rejects a minimum price above the maximum without searching", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();

    render(<SearchFilters onApply={onApply} onClear={vi.fn()} />);

    await user.type(screen.getByLabelText("Minimum price"), "100");
    await user.type(screen.getByLabelText("Maximum price"), "50");

    expect(
      screen.getByText("Minimum price cannot exceed maximum price."),
    ).toBeTruthy();
    await waitFor(() => {
      expect(onApply).not.toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it("applies trimmed filters after the debounce", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();

    render(<SearchFilters onApply={onApply} onClear={vi.fn()} />);

    await user.type(screen.getByLabelText("Make"), "  Toyota  ");
    await user.type(screen.getByLabelText("Model"), "Corolla");
    await user.type(screen.getByLabelText("Category"), "Sedan");
    await user.type(screen.getByLabelText("Minimum price"), "10000");
    await user.type(screen.getByLabelText("Maximum price"), "30000");

    expect(onApply).not.toHaveBeenCalled();
    await waitFor(
      () => {
        expect(onApply).toHaveBeenCalledWith({
          make: "Toyota",
          model: "Corolla",
          category: "Sedan",
          minPrice: 10_000,
          maxPrice: 30_000,
        });
      },
      { timeout: 1_500 },
    );
  });

  it("clears the form and notifies the dashboard", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    render(<SearchFilters onApply={vi.fn()} onClear={onClear} />);
    const make = screen.getByLabelText("Make");
    await user.type(make, "Honda");

    await user.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(onClear).toHaveBeenCalledOnce();
    expect((make as HTMLInputElement).value).toBe("");
  });
});
