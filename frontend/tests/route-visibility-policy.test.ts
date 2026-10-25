import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");

const WRAPPER_SELECTORS = [
  ".route-fade",
  ".inventory-enter",
  ".page-shell",
  ".content-auto-section",
];

function stripKeyframesBlocks(css: string): string {
  return css.replace(/@keyframes[\s\S]*?\}/g, "");
}

function findForbiddenHidingRules(css: string, label: string): string[] {
  const withoutKeyframes = stripKeyframesBlocks(css);
  const hits: string[] = [];

  for (const selector of WRAPPER_SELECTORS) {
    const blockRe = new RegExp(
      `${selector.replace(".", "\\.")}\\s*\\{[^}]*\\}`,
      "g",
    );
    for (const block of withoutKeyframes.match(blockRe) ?? []) {
      if (/opacity:\s*0\b/.test(block)) {
        hits.push(`${label} ${selector} sets opacity: 0 outside keyframes`);
      }
      if (/visibility:\s*hidden\b/.test(block)) {
        hits.push(`${label} ${selector} sets visibility: hidden outside keyframes`);
      }
      if (/display:\s*none\b/.test(block)) {
        hits.push(`${label} ${selector} sets display: none outside keyframes`);
      }
    }
  }

  return hits;
}

describe("route visibility CSS policy", () => {
  it("keeps route wrappers visible by default in source CSS", () => {
    const indexCss = readFileSync(join(ROOT, "src", "index.css"), "utf8");
    const hits = findForbiddenHidingRules(indexCss, "index.css");
    expect(hits).toEqual([]);
    expect(indexCss).toMatch(/\.route-fade\s*\{[^}]*opacity:\s*1/);
    expect(indexCss).toMatch(
      /\.route-fade[\s\S]*motion-reduce:animate-none/,
    );
  });

  it("uses forwards (not both) for fade reveal animations in Tailwind config", () => {
    const tailwind = readFileSync(join(ROOT, "tailwind.config.js"), "utf8");
    expect(tailwind).toMatch(/"fade-in":\s*"fade-in[^"]*forwards"/);
    expect(tailwind).not.toMatch(/"fade-in":\s*"fade-in[^"]*\bboth"/);
  });

  it("keeps route wrappers visible in the production CSS bundle when built", () => {
    const assetsDir = join(ROOT, "dist", "assets");
    if (!existsSync(assetsDir)) return;

    const cssFiles = readdirSync(assetsDir).filter((name) => name.endsWith(".css"));
    expect(cssFiles.length).toBeGreaterThan(0);

    for (const file of cssFiles) {
      const css = readFileSync(join(assetsDir, file), "utf8");
      const hits = findForbiddenHidingRules(css, file);
      expect(hits).toEqual([]);
    }
  });
});
