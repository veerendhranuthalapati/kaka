# P1 report — visible bugs + performance baseline

**Date:** 2026-10-24  
**Scope:** Blank details image, hero accessibility/layout, details specs layout, `seed:demo` NULL fill, dev DB hygiene, baseline metrics only (no perf optimizations).

---

## 1. Blank details image

### Symptom
On `/vehicles/:id`, vehicles using Commons manifest photos (e.g. **Honda CR-V** in demo inventory; user-reported **Honda Civic** in dev DB behaves the same) showed an **empty image panel** while **Photo credit** / manifest caption still appeared.

### Evidence
| Check | Result |
| --- | --- |
| `GET http://localhost:5173/cars/honda-cr-v.jpg` | **200** |
| `GET http://localhost:5173/cars/toyota-camry.jpg` | **200** |
| `srcset` / `sizes` on `VehicleImage` | **Not used** |
| Fallback chain | **Not swallowing errors** — `onDisplayChange` reported a valid manifest path |

### Root cause
`VehicleImage` kept the `<img>` at **`opacity: 0`** (`vehicle-img-loading`) until **`onLoad`**. Browser-cached images often have **`HTMLImageElement.complete === true`** before React attaches `onLoad`, so **`onLoad` never runs**, `loaded` stayed `false`, and the image stayed invisible. Credits still rendered because `onDisplayChange` runs from `display.url`, independent of `loaded`.

A secondary bug: a `useEffect` reset of `loaded` ran **after** `useLayoutEffect` on mount, clearing a correct cached-complete state.

### Fix (GREEN)
- `useLayoutEffect` + **ref callback** set `loaded` when `img.complete && img.naturalWidth > 0`.
- Reset of failure/`loaded` state moved to **`useLayoutEffect`** so cached-complete detection runs in the same frame after reset.
- Tests: cached-complete (`HTMLImageElement.prototype`), existing error/fallback chain tests.

### Before / after (visibility)

| Check | Before | After |
| --- | --- | --- |
| Cached manifest JPG on details | Invisible (`opacity-0`) | Visible (`vehicle-img-ready`) |
| Credit line when manifest path shown | Yes | Yes |
| Fallback chain (primary → category JPG → SVG → placeholder) | Works | Works (tests pass) |

---

## 2. Hero carousel

- **Bottom scrim:** Stronger `from-ink` gradient so text sits on a dark base for photos and SVGs.
- **Contrast:** `btn-hero-secondary` → `bg-ink/80` + token tests in `heroContrast.test.ts` (WCAG AA vs ink scrim).
- **Chevrons:** Inline SVG in prev/next controls; **44px** targets (`size-11` / `min-h-11`); focus rings.
- **Pagination:** Dots moved **below** title/price/buttons (no overlap).
- **Keyboard:** Arrow keys unchanged; tests in `HeroCarousel.test.tsx`.

---

## 3. Details layout

- Purchase **aside** aligned to image top: `lg:items-start`, `lg:self-start`, `lg:top-20`, tighter `gap-5`/`gap-6`.
- Specs: only rows with values (`vehicleSpecificationRows`); empty state **“Specifications not provided yet.”** Admins see **Add specifications** → `/admin/vehicles/:id/edit`.
- Tests: `vehicleSpecRows.test.ts`, `VehicleDetails.test.tsx`.

---

## 4. `seed:demo` fill-gaps

- **Behavior:** For existing make+model, **`buildDemoSeedUpdatePatch`** fills **only `NULL`** columns (including `imageUrl` from resolved JPG); never overwrites non-null; idempotent.
- **Guards:** Still refuses `production` and `*_test` databases.
- **Tests:** `seed-demo.fill-gaps.test.ts` (unit + integration on `dealership_test`).

---

## 5. Dev database hygiene

**Listed and deleted from `dealership_dev`** (`npx tsx scripts/cleanup-dev-verification-rows.ts`):

| id | make | model | createdAt |
| --- | --- | --- | --- |
| `744325b8-ff01-4c85-823d-66a4ad6b49a3` | RUN3 | SpecTest | 2026-10-24T11:15:57.716Z |

**Removed:** 1 row.

**README:** Testing section updated — use `_test` or delete verification rows; cleanup script documented.

---

## 6. Performance baseline (measure only — no optimizations)

Principle: **no perf code changes** this run; “After optimization” column deferred.

### Production frontend bundle (`npm run build` in `frontend/`)

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| `index.html` | 0.61 kB | 0.36 kB |
| `assets/index-*.css` | 47.95 kB | 7.37 kB |
| `assets/index-*.js` | 331.55 kB | 100.12 kB |
| `inter-latin-wght-normal-*.woff2` | 48.25 kB | (font) |
| `sora-latin-wght-normal-*.woff2` | 33.65 kB | (font) |

### Dashboard image bytes (demo catalog, resolved JPG paths)

| Metric | Value |
| --- | ---: |
| Demo vehicles | 11 |
| Unique image paths referenced | 11 |
| **Total bytes** (sum of files once each) | **2,201,184** (~2.1 MiB) |

*Featured carousel + grid may request the same URL more than once in the network panel; this sum is unique files for the demo set.*

### API requests (from code)

| View | Calls |
| --- | ---: |
| Dashboard initial load | **1** — `GET /api/vehicles/search` (empty filters, after 300ms debounce) |
| Vehicle details | **1** — `GET /api/vehicles/:id` |
| Authenticated dashboard/details in Lighthouse | **Not audited** (requires JWT / session; headless public crawl only) |

### API latency (200 sequential requests each, `localhost:3000`, dev server, authenticated)

Measured with `backend/scripts/measure-api-latency.ts` (sequential HTTP to local backend; same path as `curl.exe` to `http://localhost:3000`).

| Endpoint | p50 (ms) | p95 (ms) |
| --- | ---: | ---: |
| `GET /api/vehicles` (list) | 29.6 | 39.5 |
| `GET /api/vehicles/search` | 22.5 | 28.2 |
| `GET /api/vehicles/:id` | 21.9 | 28.6 |
| `POST /api/vehicles/:id/purchase` | 21.2 | 27.3 |

*Purchase benchmark hit the same vehicle repeatedly; many responses may be `409 OUT_OF_STOCK` after stock depletion — latency still reflects round-trip cost.*

### Lighthouse (headless Chrome, `npx lighthouse`, `vite preview` on `127.0.0.1:4173`)

| Page | LCP | CLS | TBT | Transfer size (audit sum) |
| --- | --- | --- | --- | ---: |
| `/login` | 2.1 s | ~0 | 6 ms | 190,825 B |
| `/credits` | 4.6 s | 0.011 | 5.5 ms | 1,974,141 B |

Raw JSON: `docs/ai-reports/lh-login.json`, `docs/ai-reports/lh-credits.json` (local only, not wired into `package.json`).

**Not audited:** `/` (dashboard), `/vehicles/:id` — require login; Lighthouse was run on **public** routes only.

---

## Tests run

| Suite | Result |
| --- | --- |
| `frontend` `npm test` | **116** tests, **33** files — pass |
| `backend` `npm test` | **105** tests, **22** files — pass |

---

## Files touched (summary)

- `frontend/src/components/VehicleImage.tsx` + tests  
- `frontend/src/components/HeroCarousel.tsx` + tests, `index.css`  
- `frontend/src/utils/vehicleSpecRows.ts`, `heroContrast.ts` + tests  
- `frontend/src/pages/VehicleDetails.tsx` + tests  
- `backend/scripts/seed-demo.lib.ts`, `seed-demo.ts` + fill-gaps tests  
- `backend/scripts/cleanup-dev-verification-rows.ts`  
- `backend/scripts/measure-*.ts` (baseline helpers)  
- `README.md` (test DB hygiene)  
