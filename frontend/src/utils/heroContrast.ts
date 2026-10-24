/** Relative luminance per WCAG 2.x (sRGB). */
export function relativeLuminance(r: number, g: number, b: number): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Design tokens from index.css :root (RGB triplets). */
export const HERO_TOKENS = {
  ink: [9, 9, 11] as const,
  heroText: [245, 246, 250] as const,
  /** btn-hero-secondary uses bg-ink/80 on the bottom scrim */
  heroSecondaryBg: [9, 9, 11] as const,
  heroSecondaryText: [245, 246, 250] as const,
};

export function heroBottomScrimRgb(): [number, number, number] {
  return [9, 9, 11];
}

export function meetsWcagAaNormalText(
  foreground: readonly [number, number, number],
  background: readonly [number, number, number],
): boolean {
  const ratio = contrastRatio(
    relativeLuminance(...foreground),
    relativeLuminance(...background),
  );
  return ratio >= 4.5;
}

export function meetsWcagAaLargeText(
  foreground: readonly [number, number, number],
  background: readonly [number, number, number],
): boolean {
  const ratio = contrastRatio(
    relativeLuminance(...foreground),
    relativeLuminance(...background),
  );
  return ratio >= 3;
}
