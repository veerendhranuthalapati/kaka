export type Rgb = readonly [number, number, number];

export const FONT_DISPLAY_STACK = [
  "Sora Variable",
  "Sora",
  "Segoe UI",
  "system-ui",
  "sans-serif",
] as const;

export const FONT_SANS_STACK = [
  "Inter Variable",
  "Inter",
  "Segoe UI",
  "system-ui",
  "sans-serif",
] as const;

export type ContrastPair = {
  name: string;
  foreground: Rgb;
  background: Rgb;
  minRatio: number;
};

/** Showroom dark theme pairs (sync with index.css :root). */
export const THEME_CONTRAST_PAIRS: ContrastPair[] = [
  { name: "ink on canvas", foreground: [245, 246, 250], background: [9, 9, 11], minRatio: 4.5 },
  { name: "ink on surface", foreground: [245, 246, 250], background: [16, 16, 20], minRatio: 4.5 },
  { name: "muted on surface", foreground: [156, 160, 170], background: [16, 16, 20], minRatio: 4.5 },
  { name: "muted on raised", foreground: [156, 160, 170], background: [26, 26, 32], minRatio: 4.5 },
  { name: "white on accent", foreground: [255, 255, 255], background: [37, 99, 235], minRatio: 4.5 },
  { name: "success on success-soft", foreground: [110, 231, 168], background: [22, 48, 36], minRatio: 4.5 },
  { name: "warning on warning-soft", foreground: [251, 191, 36], background: [48, 36, 18], minRatio: 4.5 },
  { name: "danger on danger-soft", foreground: [248, 113, 113], background: [48, 22, 22], minRatio: 4.5 },
  { name: "ink on accent/10 chip", foreground: [245, 246, 250], background: [22, 28, 42], minRatio: 4.5 },
];

/** @deprecated use THEME_CONTRAST_PAIRS */
export const LIGHT_CONTRAST_PAIRS = THEME_CONTRAST_PAIRS;

/** @deprecated use THEME_CONTRAST_PAIRS */
export const DARK_CONTRAST_PAIRS = THEME_CONTRAST_PAIRS;
