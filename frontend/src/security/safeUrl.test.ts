import { describe, expect, it } from "vitest";
import { isSafeHttpUrl, isSafeImagePath, safeHref } from "./safeUrl";

describe("isSafeHttpUrl", () => {
  it.each([
    "https://example.com/path",
    "http://localhost/foo",
  ])("allows %s", (url) => {
    expect(isSafeHttpUrl(url)).toBe(true);
    expect(safeHref(url)).toBe(url);
  });

  it.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html,<script>",
    "vbscript:msgbox",
    "//evil.com",
    "https://evil.com\\@good.com",
    "https://x.com/\u0000",
    "%6Aavascript:alert(1)",
  ])("rejects %s", (url) => {
    expect(isSafeHttpUrl(url)).toBe(false);
    expect(safeHref(url)).toBeNull();
  });
});

describe("isSafeImagePath", () => {
  it.each(["/images/car.jpg", "https://cdn.example/x.png"])(
    "allows %s",
    (path) => {
      expect(isSafeImagePath(path)).toBe(true);
    },
  );

  it.each(["javascript:alert(1)", "data:image/png;base64,xx", "//cdn/x"])(
    "rejects %s",
    (path) => {
      expect(isSafeImagePath(path)).toBe(false);
    },
  );
});
