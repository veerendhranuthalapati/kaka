import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContentLoadingGuard } from "./ContentLoadingGuard";

describe("ContentLoadingGuard", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a slow-loading notice when content stays empty", () => {
    vi.useFakeTimers();
    render(
      <ContentLoadingGuard>
        <span />
      </ContentLoadingGuard>,
    );

    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(screen.getByTestId("content-slow-loading")).toBeTruthy();
  });

  it("does not show the notice when children render text", () => {
    vi.useFakeTimers();
    render(
      <ContentLoadingGuard>
        <p>Dashboard ready</p>
      </ContentLoadingGuard>,
    );

    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(screen.queryByTestId("content-slow-loading")).toBeNull();
  });
});
