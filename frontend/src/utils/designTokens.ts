export type Rgb = readonly [number, number, number];

export const FONT_DISPLAY_STACK = [
  "Manrope Variable",
  "Manrope",
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

/** Light-theme pairs used in the Auto Yard UI (sync with index.css). */
export const LIGHT_CONTRAST_PAIRS: ContrastPair[] = [
  { name: "ink on canvas", foreground: [17, 18, 20], background: [246, 246, 244], minRatio: 4.5 },
  { name: "ink on surface", foreground: [17, 18, 20], background: [255, 255, 255], minRatio: 4.5 },
  { name: "muted on surface", foreground: [82, 85, 94], background: [255, 255, 255], minRatio: 4.5 },
  { name: "white on accent", foreground: [255, 255, 255], background: [47, 91, 255], minRatio: 4.5 },
  { name: "stock ok on soft", foreground: [21, 94, 52], background: [220, 245, 232], minRatio: 4.5 },
  { name: "stock low on soft", foreground: [146, 88, 12], background: [255, 243, 214], minRatio: 4.5 },
  { name: "stock out on soft", foreground: [153, 27, 27], background: [254, 226, 226], minRatio: 4.5 },
];

export const DARK_CONTRAST_PAIRS: ContrastPair[] = [
  { name: "ink on canvas (dark)", foreground: [245, 245, 243], background: [22, 22, 24], minRatio: 4.5 },
  { name: "ink on surface (dark)", foreground: [245, 245, 243], background: [30, 30, 33], minRatio: 4.5 },
  { name: "muted on surface (dark)", foreground: [168, 170, 176], background: [30, 30, 33], minRatio: 4.5 },
  { name: "white on accent (dark)", foreground: [255, 255, 255], background: [47, 91, 255], minRatio: 4.5 },
];
