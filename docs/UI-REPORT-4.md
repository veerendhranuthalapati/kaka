# UI report 4 — Auto Yard design system

## Bundle sizes

| Asset | Before | After |
| --- | --- | --- |
| CSS (gzip) | 26.15 kB → 5.30 kB | 36.63 kB → **6.27 kB** |
| JS (gzip) | 300.57 kB → 92.03 kB | 301.28 kB → **92.34 kB** |
| Fonts | none | **~73 kB** woff2 (Inter + Manrope latin only) |

## Contrast audit

- Added `auditContrastPairs()` with WCAG AA (4.5:1) checks in `designContrast.test.ts`.
- **Failure found:** dark-theme “white on accent” at `#4f7cff` ≈ **3.71:1**.
- **Fix:** dark `--accent` aligned to `#2f5bff` (same as light) so white button text passes; tokens updated in `index.css` and `designTokens.ts`.

## Per area

| Area | Changes |
| --- | --- |
| Tokens | Warm grey palette, accent `#2f5bff`, stock soft colors, `shadow-resting` / `shadow-lift`, radii 20px / 12px |
| Typography | Manrope display + Inter body; scale tokens (`text-hero`, `section-title`, `card-title`, `body`, `label`) |
| Top bar | Scroll blur, `nav-link-active` indicator, `activeCategory` from dashboard |
| Hero | `text-hero`, display prices, `rounded-card` |
| Inventory | `surface-hover`, stock pills, staggered `fade-up`, `min-w-0` grid |
| Forms / auth | Overline + section titles; field errors with icon |
| Toasts | `aria-live` assertive on danger |
| Dark mode | `prefers-color-scheme` token overrides (tested pairs) |
| Overflow | Removed `overflow-x-hidden` band-aid; `min-w-0` on grid/cards |

## Tests

| File | Reason |
| --- | --- |
| `designContrast.test.ts` | **New** — AA contrast pairs + font stack sanity |

**Existing tests changed:** none (assertions unchanged).

## Coverage

| Package | Lines |
| --- | --- |
| Backend | 94.15% (unchanged this session) |
| Frontend | **81.25%** (559/688) |

## Dependencies

- `@fontsource-variable/manrope@5.3.0` — confirmed on npm.
- `@fontsource-variable/inter@5.3.0` — confirmed on npm.
- `npm audit --omit=dev`: **0 vulnerabilities** (3 moderate remain in dev-only tree).

## Commits

1. `1a6bea2` — test(frontend): WCAG contrast audit and font stack checks  
2. `1149976` — feat(frontend): design token contrast utilities  
3. `4aa7e6e` — chore(frontend): add Fontsource Manrope and Inter at 5.3.0  
4. `366f5ac` — feat(ui): Auto Yard showroom typography and design tokens  
5. `da558f7` — docs: design system README and font credits  
6. `c7acf31` — docs: append Prompt 9 to PROMPTS.md  

## Skipped

- `docs/design/reference.png` not present — no composition pass.
- Automated viewport overflow scan at 375/768/1280 not added (manual mitigation via `min-w-0`).

## Assumptions

- Latin subset covers Auto Yard UI copy; `src/fonts/latin-fonts.css` references Fontsource woff2 files directly.
