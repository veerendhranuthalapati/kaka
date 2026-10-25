import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TopBar } from "./TopBar";
import {
  TopBarActionsProvider,
  useRegisterTopBarActions,
} from "./TopBarActionsContext";

function TopBarWithActions({
  user,
  onLogout,
  actions,
}: {
  user: { id: string; email: string; role: "USER" };
  onLogout: () => void;
  actions: { onCategorySelect?: (category: string) => void };
}) {
  useRegisterTopBarActions(actions);
  return <TopBar user={user} onLogout={onLogout} variant="full" />;
}

describe("TopBar", () => {
  const user = { id: "1", email: "user@test.com", role: "USER" as const };

  it("opens and closes the mobile menu with keyboard Escape", async () => {
    const ui = userEvent.setup();
    render(
      <MemoryRouter>
        <TopBar user={user} onLogout={vi.fn()} variant="full" />
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
      <MemoryRouter initialEntries={["/"]}>
        <TopBarActionsProvider>
          <TopBarWithActions
            user={user}
            onLogout={vi.fn()}
            actions={{ onCategorySelect }}
          />
        </TopBarActionsProvider>
      </MemoryRouter>,
    );

    await ui.click(screen.getByRole("button", { name: "SUV" }));
    expect(onCategorySelect).toHaveBeenCalledWith("SUV");
  });
});
