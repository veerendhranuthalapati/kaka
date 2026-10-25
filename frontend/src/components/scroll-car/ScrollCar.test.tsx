import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyHasScrollCarClass,
  isScrollCarEnvironmentVisible,
} from "./useScrollCar";
import { ScrollCar } from "./ScrollCar";
import { yToProgress, scrollYFromProgress } from "./scrollCarMath";

describe("isScrollCarEnvironmentVisible", () => {
  it("requires scroll range, width and no scroll lock", () => {
    expect(isScrollCarEnvironmentVisible(2000, 800, true, false)).toBe(true);
    expect(isScrollCarEnvironmentVisible(800, 800, true, false)).toBe(false);
    expect(isScrollCarEnvironmentVisible(2000, 800, false, false)).toBe(false);
    expect(isScrollCarEnvironmentVisible(2000, 800, true, true)).toBe(false);
  });
});

describe("ScrollCar", () => {
  let rafSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    class ResizeObserverMock {
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);

    applyHasScrollCarClass(false);
    document.documentElement.removeAttribute("data-scroll-locked");
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 3000,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("min-width: 640px"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as typeof window.matchMedia;

    rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 0);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    HTMLElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 64,
      height: 600,
      width: 44,
      left: 0,
      right: 44,
      bottom: 664,
      x: 0,
      y: 64,
      toJSON: () => ({}),
    });
  });

  afterEach(() => {
    rafSpy.mockRestore();
    applyHasScrollCarClass(false);
    vi.restoreAllMocks();
  });

  it("renders aria-hidden and is not focusable", async () => {
    const { container } = render(
      <MemoryRouter>
        <ScrollCar />
      </MemoryRouter>,
    );
    const root = container.querySelector("[data-testid=scroll-car]");
    expect(root?.getAttribute("aria-hidden")).toBe("true");
    expect(root?.getAttribute("tabindex")).toBeNull();
  });

  it("adds has-scroll-car when scrollable and removes on unmount", async () => {
    const view = render(
      <MemoryRouter>
        <ScrollCar />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(document.documentElement.classList.contains("has-scroll-car")).toBe(
        true,
      );
    });
    view.unmount();
    expect(document.documentElement.classList.contains("has-scroll-car")).toBe(
      false,
    );
  });

  it("hides when data-scroll-locked is set", async () => {
    render(
      <MemoryRouter>
        <ScrollCar />
      </MemoryRouter>,
    );
    document.documentElement.setAttribute("data-scroll-locked", "");
    await waitFor(() => {
      expect(document.documentElement.classList.contains("has-scroll-car")).toBe(
        false,
      );
    });
  });

  it("maps drag position to scroll target", () => {
    const progress = yToProgress(64 + 300, 64, 600, 26);
    expect(scrollYFromProgress(progress, 2200)).toBeCloseTo(progress * 2200, 0);
  });

  it("does not start rAF when reduced motion is preferred", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as typeof window.matchMedia;

    render(
      <MemoryRouter>
        <ScrollCar />
      </MemoryRouter>,
    );
    window.dispatchEvent(new Event("scroll"));
    expect(rafSpy).not.toHaveBeenCalled();
  });
});
