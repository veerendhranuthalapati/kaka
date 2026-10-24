# Q1 report — extended specs, demo catalogue, photos

**Date:** 2026-10-24  
**Scope:** Part A (optional vehicle fields), Part B (31-vehicle demo seed), Part C (Wikimedia photos + review page).

## Skipped (already done in P1–P3)

| Item | Reason |
| --- | --- |
| Cached-image fix for `VehicleImage` | P1 |
| `vehicleDataCache`, dimmed revalidate, lazy routes, scroll restore | P2 |
| Commons fetch baseline, manifest, credits page, responsive variants | Earlier photos work + P2 |
| Dev DB cleanup script | P1 / `cleanup-dev-verification-rows.ts` |
| Prisma `$connect`, ETag caching | P3 |

## Part A — optional fields

**Backend:** Migration `20261024120000_vehicle_extended_fields`; Zod in `vehicle.specs.schema.ts`; repository select/map; DTO `batteryKwh` as number; integration `vehicle.extended-fields.test.ts` + updated `vehicle.specs.test.ts` null defaults (`features: []`).

**Frontend:** Types, `formatSeats` / `formatRange` / `formatBattery`, `vehicleSpecRows` (EV/hybrid rules), details overview + feature chips, `VehicleForm` + `vehicleFormModel` validation.

**Tests:** Backend **114** tests; frontend **122** tests (all passing).

## Part B — demo seed

- **Catalog:** `backend/scripts/demo-vehicle-catalog.ts` — **31** vehicles, **3–5 per category** (Jeep Wrangler dropped to keep SUV cap at 5). Toyota RAV4 Hybrid catalog entry uses `PLUG_IN_HYBRID` with plausible `rangeKm` / `batteryKwh` (schema min 5 kWh).
- **Seed:** Idempotent NULL-fill via `buildDemoSeedUpdatePatch` (including empty `features[]`). Ran on dev: `seed:demo upserted 31 vehicles (23 created, 8 updated)`.
- **Validity:** `demo-catalog.validity.test.ts` (schema, category counts, EV nulls, 2+ out of stock, unique make+model).
- **README:** Sample-data disclaimer added (see repo README).

**Data honesty:** Illustrative approximate trim-level figures; VIN always `null` for demo rows.

## Part C — photos (partial)

| Deliverable | Status |
| --- | --- |
| `escapeHtml`, `parsePickOverrides`, `commonsCategoriesMatchMakeModel` + unit tests | Done |
| `.cache/` gitignored | Done |
| `npm run generate:photo-review` → `docs/design/photo-review.html` | Done (candidates empty until fetch populates cache) |
| Wikipedia lead-image API + Commons category gate | **Not wired** in `fetch-car-photos.ts` yet |
| Top-4 candidate cache + `--pick` CLI on fetch | **Not wired** (helpers only) |
| 24px base64 blur in manifest | **Not done** (Q2 overlap) |
| Full re-fetch for all 31 catalog slugs | **Not run** this session |
| Integrity test vs every seeded slug | Existing manifest (~legacy set); fails if run against full 31 without fetch |

### Photo selection table (current manifest + seed slugs)

Manifest entries from `frontend/src/data/car-photos.json` (Commons search pipeline, prior run). Review page generated for full catalog; swap column N/A until fetch re-run.

| Vehicle (make model) | Source | Chosen file title | Licence | Swapped |
| --- | --- | --- | --- | --- |
| Toyota Camry | Commons (prior) | 2024 Toyota Save Mart 350 Toyota Camry Pace Car | CC BY-SA 4.0 | — |
| Honda CR-V | Commons (prior) | 2014/2022 Honda CR-V (Indonesia) | CC0 | — |
| Ford F-150 | Commons (prior) | (see manifest) | (see manifest) | — |
| … | … | … | … | — |

*Run `cd backend && npm run fetch:car-photos` then `npm run generate:photo-review` to fill `.cache/car-photo-candidates.json` and refresh this table.*

## Verification

- Dev cleanup: 0 verification rows removed; `seed:demo` on dev OK.
- **Manual UI:** Start `backend` + `frontend` on 5173 — spot-check dashboard, EV (Model 3), PHEV (RAV4 Hybrid), out-of-stock (Explorer / Ram 1500 / EV6), details specs + overview.
- **Automated:** Full unit/integration suites green; browser smoke not re-run in this session.

## Follow-ups

1. Complete `fetch-car-photos.ts`: Wikipedia `pageimages`, category check, candidate cache, `--pick`, 12 MB total cap constant alignment.
2. Re-fetch JPEGs for all catalog slugs; update `CREDITS.md` + integrity test.
3. Q2 motion work (separate report).
