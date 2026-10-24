import { describe, expect, it } from "vitest";
import {
  HERO_TOKENS,
  heroBottomScrimRgb,
  meetsWcagAaLargeText,
  meetsWcagAaNormalText,
} from "./heroContrast";

describe("hero contrast tokens", () => {
  const scrim = heroBottomScrimRgb();
  const text = HERO_TOKENS.heroText;

  it("meets WCAG AA for hero body text on the bottom scrim", () => {
    expect(meetsWcagAaNormalText(text, scrim)).toBe(true);
  });

  it("meets WCAG AA for hero title and price on the bottom scrim", () => {
    expect(meetsWcagAaLargeText(text, scrim)).toBe(true);
  });

  it("meets WCAG AA for the secondary Details button on the scrim", () => {
    expect(
      meetsWcagAaNormalText(HERO_TOKENS.heroSecondaryText, HERO_TOKENS.heroSecondaryBg),
    ).toBe(true);
  });
});
