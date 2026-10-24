import type { ContrastPair, Rgb } from "./designTokens";

export function relativeLuminance([r, g, b]: Rgb): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  );
}

export function contrastRatio(foreground: Rgb, background: Rgb): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastAuditResult = {
  name: string;
  ratio: number;
  minRatio: number;
  pass: boolean;
};

export function auditContrastPairs(pairs: ContrastPair[]): ContrastAuditResult[] {
  return pairs.map((pair) => {
    const ratio = contrastRatio(pair.foreground, pair.background);
    return {
      name: pair.name,
      ratio,
      minRatio: pair.minRatio,
      pass: ratio >= pair.minRatio,
    };
  });
}
