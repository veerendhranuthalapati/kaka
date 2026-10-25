import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { setDocumentScrollLocked, useScrollLock } from "./useScrollLock";

describe("useScrollLock", () => {
  it("sets data-scroll-locked on html while locked", () => {
    setDocumentScrollLocked(false);
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.documentElement.hasAttribute("data-scroll-locked")).toBe(
      true,
    );
    unmount();
    expect(document.documentElement.hasAttribute("data-scroll-locked")).toBe(
      false,
    );
  });
});
