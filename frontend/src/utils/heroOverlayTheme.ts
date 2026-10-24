/** Fixed hero scrim/control colours — not theme tokens (ink is light text in this app). */

export const HERO_SCRIM_RGB = { r: 8, g: 10, b: 14 } as const;

export const HERO_SCRIM_BOTTOM =
  "linear-gradient(to top, rgba(8, 10, 14, 0.82) 0%, rgba(8, 10, 14, 0.55) 35%, transparent 70%)";

export const HERO_SCRIM_LEFT =
  "linear-gradient(to right, rgba(8, 10, 14, 0.35) 0%, transparent 45%)";

export const HERO_CATEGORY_PILL_BG = "rgba(8, 10, 14, 0.55)";
export const HERO_TITLE_SHADOW = "0 1px 12px rgba(0, 0, 0, 0.45)";

export const HERO_DETAILS_BTN_BG = "rgba(255, 255, 255, 0.14)";
export const HERO_DETAILS_BTN_BORDER = "rgba(255, 255, 255, 0.35)";
export const HERO_DETAILS_BTN_BG_HOVER = "rgba(255, 255, 255, 0.22)";

export const HERO_ARROW_BTN_BG = "rgba(8, 10, 14, 0.55)";
export const HERO_ARROW_BTN_BORDER = "rgba(255, 255, 255, 0.3)";

export const HERO_DOT_INACTIVE = "rgba(255, 255, 255, 0.55)";
export const HERO_DOT_ACTIVE = "rgb(255, 255, 255)";
export const HERO_DOTS_PILL_BG = "rgba(8, 10, 14, 0.55)";

export const HERO_TEXT_WHITE = "rgb(255, 255, 255)";

export function compositeRgb(
  fg: { r: number; g: number; b: number },
  fgAlpha: number,
  bg: { r: number; g: number; b: number },
): { r: number; g: number; b: number } {
  const a = Math.min(1, Math.max(0, fgAlpha));
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(
  foreground: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number },
): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Worst case: bright photo under the top edge of the bottom text band (82% scrim). */
export function worstCaseHeroTitleContrast(): number {
  const photo = { r: 255, g: 255, b: 255 };
  const scrimAtTextTop = compositeRgb(HERO_SCRIM_RGB, 0.82, photo);
  const title = { r: 255, g: 255, b: 255 };
  return contrastRatio(title, scrimAtTextTop);
}

export function heroDetailsButtonContrast(): number {
  const photo = { r: 255, g: 255, b: 255 };
  const scrim = compositeRgb(HERO_SCRIM_RGB, 0.82, photo);
  const btnBg = compositeRgb({ r: 255, g: 255, b: 255 }, 0.14, scrim);
  return contrastRatio({ r: 255, g: 255, b: 255 }, btnBg);
}

export function heroArrowChevronContrast(): number {
  const photo = { r: 255, g: 255, b: 255 };
  const scrim = compositeRgb(HERO_SCRIM_RGB, 0.55, photo);
  const btnBg = compositeRgb(HERO_SCRIM_RGB, 0.55, scrim);
  return contrastRatio({ r: 255, g: 255, b: 255 }, btnBg);
}
