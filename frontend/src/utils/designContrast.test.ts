import { describe, expect, it } from "vitest";
import { auditContrastPairs, contrastRatio } from "./designContrast";
import {
  FONT_DISPLAY_STACK,
  FONT_SANS_STACK,
  THEME_CONTRAST_PAIRS,
} from "./designTokens";

describe("designContrast", () => {
  it("meets WCAG AA for every showroom token pair", () => {
    const results = auditContrastPairs(THEME_CONTRAST_PAIRS);
    const failures = results.filter((result) => !result.pass);
    expect(failures).toEqual([]);
  });

  it("reports a higher ratio for black on white than mid-grey on white", () => {
    const blackOnWhite = contrastRatio([0, 0, 0], [255, 255, 255]);
    const greyOnWhite = contrastRatio([180, 180, 180], [255, 255, 255]);
    expect(blackOnWhite).toBeGreaterThan(greyOnWhite);
  });
});

describe("font stacks", () => {
  it("prefers self-hosted Sora for display and Inter for body", () => {
    expect(FONT_DISPLAY_STACK[0]).toBe("Sora Variable");
    expect(FONT_SANS_STACK[0]).toBe("Inter Variable");
    expect(FONT_DISPLAY_STACK.length).toBeGreaterThan(2);
    expect(FONT_SANS_STACK.length).toBeGreaterThan(2);
  });
});
