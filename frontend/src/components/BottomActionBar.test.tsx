import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BottomActionBar } from "./BottomActionBar";

describe("BottomActionBar", () => {
  it("focuses the inventory search when Browse inventory is clicked", async () => {
    const user = userEvent.setup();
    const onBrowse = vi.fn();
    const searchRef = { current: document.createElement("input") };
    const focusSpy = vi.spyOn(searchRef.current, "focus");

    render(
      <BottomActionBar
        searchInputRef={searchRef}
        onBrowseInventory={onBrowse}
        onQuickSearch={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Browse inventory" }));
    expect(onBrowse).toHaveBeenCalledOnce();
    expect(focusSpy).toHaveBeenCalledOnce();
  });
});
