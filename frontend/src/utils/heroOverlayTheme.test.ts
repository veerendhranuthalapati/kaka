import { describe, expect, it } from "vitest";
import {
  HERO_ARROW_BTN_BG,
  HERO_SCRIM_BOTTOM,
  HERO_SCRIM_LEFT,
  heroArrowChevronContrast,
  heroDetailsButtonContrast,
  worstCaseHeroTitleContrast,
} from "./heroOverlayTheme";

describe("heroOverlayTheme", () => {
  it("uses fixed scrim gradients without theme ink tokens", () => {
    expect(HERO_SCRIM_BOTTOM).toContain("rgba(8, 10, 14");
    expect(HERO_SCRIM_BOTTOM).not.toMatch(/ink|var\(--/);
    expect(HERO_SCRIM_LEFT).toContain("rgba(8, 10, 14");
    expect(HERO_ARROW_BTN_BG).toBe("rgba(8, 10, 14, 0.55)");
  });

  it("meets WCAG contrast in worst-case white photo scenarios", () => {
    expect(worstCaseHeroTitleContrast()).toBeGreaterThanOrEqual(4.5);
    expect(heroDetailsButtonContrast()).toBeGreaterThanOrEqual(3);
    expect(heroArrowChevronContrast()).toBeGreaterThanOrEqual(3);
  });
});
