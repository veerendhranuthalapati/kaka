# RUN1 final report — bug fixes, dashboard wiring, shared form

Date: 2026-10-24 (uncommitted)

## Root cause: Invalid Date

Search/list vehicles were mapped through `toVehicleDto`, which **dropped** `createdAt` and `updatedAt`. The dashboard dialog called `new Date(undefined)`, producing **Invalid Date**. Raw SQL search was affected the same way as Prisma list because both use the same DTO mapper.

**Fix:** Add ISO `createdAt`/`updatedAt` in `toVehicleDto`. **Frontend:** `formatDateTime()` for safe display.

## curl verification (port 5173, admin session — no credentials printed)

| Endpoint | `createdAt` valid | `updatedAt` valid |
| --- | --- | --- |
| `GET /api/vehicles` | Yes | Yes |
| `GET /api/vehicles/search?category=Sedan` | Yes | Yes |

## seed:demo (dev database)

- Script output: **11 vehicles** created.
- Legacy `demo-seed` rows are deleted before catalog insert (`cleanupLegacyDemoSeedVehicles`).

## Tests and coverage (after RUN1)

| Package | Tests | Line coverage |
| --- | --- | --- |
| Backend | 92 | 94.39% (337/357) |
| Frontend | 98 | 81.27% (716/881) |

## Commits (this run)

| Hash | Message |
| --- | --- |
| `741f858` | docs: update PROMPTS.md |
| `a2313f5` | test: vehicle API responses include valid ISO timestamps |
| `416313f` | fix(backend): include ISO createdAt and updatedAt on vehicle DTOs |
| `47ef26e` | test: formatDateTime shows dash for invalid or missing dates |
| `4b90f92` | feat(frontend): add formatDateTime helper for safe date display |
| `b0e83ef` | test: lock in legacy demo-seed vehicle cleanup (already satisfied) |
| `dcdf0d0` | feat(backend): purge legacy demo-seed rows during seed:demo |
| `721129c` | test: inventory card chips and hero details deep link |
| `7f01c61` | feat(frontend): wire dashboard cards to spec chips and vehicle details route |
| `a44916e` | test: vehicle form validation and submit payload builders |
| `735ee72` | feat(frontend): shared VehicleForm for admin add and edit pages |
| `720fddf` | fix(frontend): prevent top bar wrap with account menu under lg |

## Changed / removed tests (reasons)

| Test file | Change |
| --- | --- |
| `vehicle.timestamps.test.ts` | **Added** — ISO timestamps on all vehicle API paths. |
| `format.test.ts` | **Added** — `formatDateTime` dash behavior. |
| `seed-demo.cleanup.test.ts` | **Added** — legacy row deletion. |
| `InventoryVehicleCard.test.tsx` | **Added** — chips + View details link. |
| `HeroCarousel.test.tsx` | **Updated** — Details is a route link, not dialog callback. |
| `VehicleDetailsDialog.test.tsx` | **Removed** — component deleted (only used by dashboard). |
| `vehicleFormModel.test.ts`, `VehicleForm.test.tsx` | **Added** — validation and payloads. |
| `AddVehicle.test.tsx`, `EditVehicle.test.tsx` | **Updated** — multiple `role="alert"` nodes under shared form. |

## Removed production code

| Item | Evidence |
| --- | --- |
| `VehicleDetailsDialog.tsx` | `grep`: only `Dashboard.tsx` + its test; replaced by `/vehicles/:id`. |
| `VehicleDetailsDialog.test.tsx` | Tests removed component only. |

## BLOCKED

- None.

## Out of scope (not attempted)

- Visual redesign, fonts, illustrations, spec lookup, README API table refresh for all new form fields.
