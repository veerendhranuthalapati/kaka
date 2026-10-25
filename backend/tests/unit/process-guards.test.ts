import { describe, expect, it, vi } from "vitest";
import { gracefulShutdown } from "../../src/server/processGuards.js";

describe("gracefulShutdown", () => {
  it("disconnects and exits after server close", async () => {
    const close = vi.fn((cb: () => void) => cb());
    const disconnect = vi.fn().mockResolvedValue(undefined);
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {}) as never);

    gracefulShutdown({ close }, disconnect, "SIGTERM", 60_000);
    expect(close).toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(disconnect).toHaveBeenCalled();
    });
    expect(exit).toHaveBeenCalledWith(0);
    exit.mockRestore();
  });
});
