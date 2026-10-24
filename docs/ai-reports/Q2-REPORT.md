# Q2 report — transitions and perceived smoothness

**Date:** 2026-10-24  
**Status:** **Not implemented** in this run (Q1 catalogue/specs priority). Below: skips from prior work, intended checklist, and baseline numbers for a future pass.

## Skipped (already in P2 / P1)

| Q2 item | Prior work |
| --- | --- |
| Dimmed results while revalidating | `useVehicleSearch` + `opacity-70` on grid (P2) |
| Data cache, in-flight dedupe, scroll restore | P2 |
| Lazy route chunks + prefetch on “View details” | P2 |
| `VehicleImage` cached `complete` / no stuck opacity-0 | P1 |
| Bundle budget script | P2 (`check:bundle-size`) |
| Partial skeleton / stagger on cards | Dashboard `animationDelay` on cards (P2) |

## Planned items (not done)

1. Shared-element View Transitions API (card → details) + tested name helper  
2. LQIP blur placeholders in manifest + `img.decode()` crossfade  
3. Filter/search FLIP / `startViewTransition` (max 24 cards)  
4. Hero carousel scroll-snap + eased arrows  
5. Persistent layout route (top/bottom bar) + route crossfade  
6. Dialog/drawer enter/exit + focus trap  
7. Micro-interaction tokens (150/220/320 ms) + stock slide  
8. `useReducedMotion` + animation performance rules  
9. Lighthouse CLS on `/login`, `/credits`; helper unit tests  

## Bundle baseline (current build)

| Metric | Value | Budget |
| --- | ---: | ---: |
| JS gzip | 110 267 B | ≤ 112 640 B (110 kB) |
| CSS gzip | 7 373 B | ≤ 10 240 B (10 kB) |

*`npm run build` currently fails `tsc` until all test fixtures include new spec fields; `check:bundle-size` uses last successful `dist/` if present — re-run build after fixture fix.*

## Tests touched for cache hygiene (related to loading UX)

- `resetVehicleDataCacheForTests()` + Dashboard skeleton test fix (empty cache ⇒ loading skeletons visible).

## Browser support notes

*Deferred until View Transitions / `prefers-reduced-motion` helpers land.*

## Manual checks (authenticated)

Dashboard, purchase, details transitions — require login; not Lighthouse-audited headlessly (same as P2/P3 README note).

## Recommendation

Implement Q2 as a focused follow-up: (1) `useReducedMotion` + motion tokens in Tailwind/CSS variables, (2) view-transition helper + inventory/details wiring, (3) LQIP in fetch script, then re-measure CLS and bundle.
