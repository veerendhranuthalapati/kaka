import { describe, expect, it } from "vitest";
import {
  validateCredentials,
  validateEmail,
  validateImageUrl,
  validatePassword,
} from "./validation";

describe("validateEmail", () => {
  it("rejects invalid addresses", () => {
    expect(validateEmail("not-an-email")).toMatch(/valid email/i);
    expect(validateEmail("a@b")).toMatch(/valid email/i);
  });
});

describe("validatePassword", () => {
  it("enforces length and UTF-8 byte limits", () => {
    expect(validatePassword("short")).toMatch(/8 characters/i);
    expect(validatePassword("a".repeat(73))).toMatch(/72 characters/i);
    expect(validatePassword("😀".repeat(20))).toMatch(/UTF-8 bytes/i);
    expect(validatePassword("goodPassword1")).toBeNull();
  });

  it("falls back when TextEncoder is unavailable", () => {
    const encoder = globalThis.TextEncoder;
    // @ts-expect-error test shim
    globalThis.TextEncoder = undefined;
    expect(validatePassword("abcdefgh")).toBeNull();
    globalThis.TextEncoder = encoder;
  });
});

describe("validateCredentials", () => {
  it("returns the first validation error", () => {
    expect(validateCredentials("bad", "x")).toMatch(/email/i);
    expect(validateCredentials("a@b.com", "short")).toMatch(/8 characters/i);
    expect(validateCredentials("a@b.com", "goodPassword1")).toBeNull();
  });
});

describe("validateImageUrl", () => {
  it("accepts https URLs and site-relative paths", () => {
    expect(validateImageUrl("/cars/aurora-lx.jpg")).toBeNull();
    expect(validateImageUrl("https://cdn.example.com/car.jpg")).toBeNull();
  });

  it("rejects dangerous schemes and invalid paths", () => {
    expect(validateImageUrl("http://example.com/x.jpg")).toMatch(/https/i);
    expect(validateImageUrl("//cdn.example.com/x.jpg")).toMatch(/https/i);
    expect(validateImageUrl("javascript:alert(1)")).toMatch(/https/i);
    expect(validateImageUrl("data:image/png;base64,abc")).toMatch(/https/i);
    expect(validateImageUrl("not-a-url")).toMatch(/https/i);
    expect(validateImageUrl("a".repeat(2049))).toMatch(/2048/i);
    expect(validateImageUrl("/cars/\nx.jpg")).toMatch(/whitespace/i);
  });
});
