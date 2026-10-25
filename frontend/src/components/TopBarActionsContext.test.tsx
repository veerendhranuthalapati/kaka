import { render, waitFor } from "@testing-library/react";
import { useCallback } from "react";
import { describe, expect, it } from "vitest";
import {
  TopBarActionsProvider,
  useRegisterTopBarActions,
} from "./TopBarActionsContext";

function RegisteringChild() {
  const onCategorySelect = useCallback(() => {}, []);
  const onInventoryClick = useCallback(() => {}, []);
  useRegisterTopBarActions({
    activeCategory: "Sedan",
    onCategorySelect,
    onInventoryClick,
  });
  return null;
}

describe("TopBarActionsContext", () => {
  it("does not re-register actions in an infinite loop", async () => {
    let renders = 0;

    function CountingChild() {
      renders += 1;
      return <RegisteringChild />;
    }

    render(
      <TopBarActionsProvider>
        <CountingChild />
      </TopBarActionsProvider>,
    );

    await waitFor(
      () => {
        expect(renders).toBeLessThan(8);
      },
      { timeout: 500 },
    );
  });
});
