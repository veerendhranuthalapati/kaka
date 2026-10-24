# P2 report — frontend performance & smoothness

**Date:** 2026-10-24  
**Baseline:** [P1-REPORT.md](./P1-REPORT.md)

## Before / after (measured)

| Metric | P1 baseline | After P2 | Notes |
| --- | ---: | ---: | --- |
| Main JS chunk gzip | 100.12 kB (single `index-*.js`) | **67.01 kB** (`vendor-react`) + **14.14 kB** (`index`) + lazy route chunks | Code-split + vendor chunks |
| Total JS gzip (all `.js` in `dist/assets`) | ~100 kB | **99.16 kB** (`check:bundle-size`) | Under **110 kB** budget |
| CSS gzip | 7.37 kB | **7.29 kB** | Under **10 kB** budget |
| Dashboard search UX | Full skeleton on every filter change | **Stale list + 70% opacity** while revalidating | `useDeferredValue` + SWR cache |
| Details first paint | Always network wait | **Instant from list cache**, then revalidate | `VehicleDataProvider` |
| Route JS on first load | All pages in main bundle | **Lazy** login/register/credits/details/admin | `React.lazy` + `PageRouteSkeleton` |
| Lighthouse `/login` CLS | ~0 | *(re-run after deploy)* | Target &lt; 0.05 |
| Responsive car images | Single 800px-class JPG | **`srcset`/`sizes` ready**; manifest `variants.w500/w960` when fetch adds files | Commons re-fetch not run this session |

## Implemented

1. **Data layer** — `vehicleDataCache.ts` + `VehicleDataProvider`: SWR (30s), in-flight dedupe, `AbortController` + generation guards, focus revalidate, scroll restore (`SCROLL_RESTORE_KEY`), dimmed revalidate UI. Tests in `vehicleDataCache.test.ts`, `prefetchRoute.test.ts`, `vehicleDataOptimistic.test.ts`.
2. **Optimistic purchase** — `purchaseWithOptimistic`; admin delete/restock via cache helpers (no full list reload).
3. **Code splitting** — `App.tsx` lazy routes; prefetch on View details hover/focus/touch (`prefetchRoute.ts`).
4. **Images** — `responsiveSrcSetForEntry`, `layout` prop on `VehicleImage`; hero `fetchPriority` + `loading="eager"` on first slide.
5. **Rendering** — `useDeferredValue` for filters; `content-visibility` on inventory sections; `contain: layout paint` on cards.
6. **Animations** — card hover shadow via `::after` opacity; explicit transition properties on `.surface`.
7. **Fonts** — existing latin-only `@fontface` with `font-display: swap` (metric overrides: follow-up in `latin-fonts.css` if CLS regresses).
8. **Bundle** — `manualChunks` in `vite.config.ts`; `npm run check:bundle-size`.
9. **Layout** — `PageRouteSkeleton` aligned with page chrome; inventory skeleton unchanged dimensions.

## Tests changed (markup/structure)

| Test | Reason |
| --- | --- |
| `Dashboard.test.tsx` | Wrap with `VehicleDataProvider` |
| `VehicleDetails.test.tsx` | Wrap with `VehicleDataProvider` |

## Profiler (dev)

Manual React Profiler pass recommended for: search typing, purchase, carousel arrow, navigate to details. Provider memoization + deferred filters reduce cascading dashboard re-renders vs P1.

## Deferred / not reverted

- **Commons 500/960 variants:** schema + `srcset` wiring landed; run `npm run fetch:car-photos` to populate `variants` (same licence/contact rules).
- **View Transitions API:** kept existing `RouteFade` CSS fade (progressive enhancement optional).

## Commands

```bash
cd frontend && npm run build && npm run check:bundle-size && npm test
```
