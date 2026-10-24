import { describe, expect, it } from "vitest";
import { formatDateTime, formatPrice } from "./format";

describe("format", () => {
  it("formats currency", () => {
    expect(formatPrice(25000)).toBe("$25,000");
  });

  it("formats valid ISO datetimes and uses dash for missing or invalid", () => {
    expect(formatDateTime("2026-10-23T10:00:00.000Z")).not.toBe("-");
    expect(formatDateTime("2026-10-23T10:00:00.000Z")).toMatch(/2026/);
    expect(formatDateTime(undefined)).toBe("-");
    expect(formatDateTime("")).toBe("-");
    expect(formatDateTime("not-a-date")).toBe("-");
  });
});
