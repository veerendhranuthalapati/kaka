import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TopBar } from "./TopBar";

describe("TopBar", () => {
  const user = { id: "1", email: "user@test.com", role: "USER" as const };

  it("opens and closes the mobile menu with keyboard Escape", async () => {
    const ui = userEvent.setup();
    render(
      <MemoryRouter>
        <TopBar
          user={user}
          onLogout={vi.fn()}
          onCategorySelect={vi.fn()}
          onInventoryClick={vi.fn()}
        />
      </MemoryRouter>,
    );

    await ui.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("dialog", { name: "Navigation menu" })).toBeTruthy();

    await ui.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Navigation menu" })).toBeNull();
  });

  it("calls onCategorySelect from the desktop navigation", async () => {
    const onCategorySelect = vi.fn();
    const ui = userEvent.setup();
    render(
      <MemoryRouter>
        <TopBar
          user={user}
          onLogout={vi.fn()}
          onCategorySelect={onCategorySelect}
          onInventoryClick={vi.fn()}
        />
      </MemoryRouter>,
    );

    await ui.click(screen.getByRole("button", { name: "SUV" }));
    expect(onCategorySelect).toHaveBeenCalledWith("SUV");
  });
});
