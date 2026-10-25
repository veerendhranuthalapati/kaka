import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

vi.stubEnv("VITE_API_URL", "");

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});
