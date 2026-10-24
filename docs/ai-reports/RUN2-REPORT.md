# RUN2 — Visual redesign report

**Scope:** Visual redesign only. Behavior and API unchanged (plus purchase success toast + stock highlight per motion spec).  
**Date:** 2026-10-24

## Summary

Shipped a dark premium showroom UI: near-black surfaces, electric-blue accent (WCAG AA on primary buttons), glass top bar, hero radial glow, 20px card radius, two shadow levels, Sora + Inter via Fontsource (latin only). Redrew all category SVG silhouettes. Added CSS-only motion (disabled under `prefers-reduced-motion`).

## Bundle size (production `npm run build`)

| Asset | Before | After | Δ |
| --- | --- | --- | --- |
| Display font woff2 | Manrope 24.83 kB | Sora 33.65 kB | +8.82 kB |
| Body font woff2 | Inter 48.25 kB | Inter 48.25 kB | — |
| CSS | 37.30 kB (gzip 6.42 kB) | 45.47 kB (gzip 7.15 kB) | +8.17 kB raw |
| JS | 311.87 kB (gzip 95.37 kB) | 313.55 kB (gzip 95.75 kB) | +1.68 kB raw |
| `index.html` | 0.61 kB | 0.61 kB | — |

## Design tokens

- **CSS variables** in `frontend/src/index.css`: canvas, surface, raised, ink, muted, line, accent, semantic stock colors, radii via Tailwind `rounded-card` (1.25rem / 20px).
- **Tailwind** `frontend/tailwind.config.js`: color aliases, display/body font stacks, type scale (`hero`, `section-title`, `display-price`, etc.), shadows (`resting`, `lift`, `float`, `glass`), motion keyframes.
- **Contrast:** `frontend/src/utils/designTokens.ts` + `designContrast.test.ts` — single `THEME_CONTRAST_PAIRS` set for the showroom palette (AA 4.5:1).

## Key file changes

| Area | Files |
| --- | --- |
| Fonts | `package.json`, `src/fonts/latin-fonts.css`, `CREDITS.md` |
| Theme | `src/index.css`, `tailwind.config.js`, `src/utils/designTokens.ts` |
| Layout / motion | `src/App.tsx`, `src/components/RouteFade.tsx` |
| Shell UI | `TopBar.tsx`, `BottomActionBar.tsx`, `SearchFilters.tsx` (inherits `.surface`/`.input`) |
| Inventory | `Dashboard.tsx`, `InventoryVehicleCard.tsx`, `HeroCarousel.tsx`, `VehicleImage.tsx` |
| Details | `VehicleDetails.tsx` (sticky panel, 409 toast, skeleton load) |
| Dialogs / feedback | `State.tsx`, `RestockDialog.tsx`, `Login.tsx`, `Register.tsx` |
| Art | `frontend/public/cars/*.svg` (10 files) |

## Purchase UX (visual-only behavior addition)

- Success: toast `Purchased 1 x {Make} {Model} - {N} left` + `stock-updated` highlight on the stock pill.
- `409 OUT_OF_STOCK`: unchanged message `Just sold out` (dashboard + details).

## Grid

Inventory and loading skeletons use `inventory-grid` → `repeat(auto-fill, minmax(280px, 1fr))` for full-width cards at 375–1280px.

## Tests changed

| File | Reason |
| --- | --- |
| `src/utils/designContrast.test.ts` | Sora display stack; single `THEME_CONTRAST_PAIRS`; removed duplicate light/dark cases |
| `src/pages/Dashboard.test.tsx` | Skeleton loaders use `.skeleton` instead of `.animate-pulse` |

All other tests pass unchanged (97/97).

## Verification

```bash
cd frontend && npm test && npm run build
```

Manual: run `npm run dev`, sign in, confirm hero glow, glass nav, card hover lift, illustration `object-contain` on tinted panels, details sticky panel on wide viewports.

## Not in RUN2

Spec lookup, README/API doc refresh, Prompt B reports.
