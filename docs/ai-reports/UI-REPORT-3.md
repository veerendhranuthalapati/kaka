# UI report 3 — category illustrations and optional images

## Summary

Vehicles without a photo now show **category-matched SVG illustrations** with a tinted `object-contain` frame; explicit URLs use `object-cover` for non-SVG assets. Admin forms treat Image URL as optional with live preview. `seed:demo` defaults most rows to `imageUrl: null` and refuses `_test` databases.

## Reference (`docs/design/reference.png`)

**Skipped:** file not present (`Test-Path` → false). No composition changes this session.

## Assets on disk (`frontend/public/cars`)

10 SVG illustrations only: `coupe-01.svg`, `ev-01.svg`, `hatch-01.svg`, `placeholder.svg`, `sedan-01.svg`, `sedan-02.svg`, `suv-01.svg`, `suv-02.svg`, `truck-01.svg`, `wagon-01.svg`.

## Seed `imageUrl` behavior

| Vehicle | `imageUrl` |
| --- | --- |
| Aurora LX | `/cars/sedan-01.svg` (explicit) |
| Summit Tour | `/cars/suv-01.svg` (explicit) |
| All other demo rows | `null` → UI category fallback |

Optional photo slug matching remains in `resolveOptionalDemoImageUrl` (returns `null` when no file).

## Tests added

| File | Purpose |
| --- | --- |
| `fallbackImageForCategory.test.ts` | Category → SVG mapping, unknown/empty |
| `VehicleImage.test.tsx` | Primary, category, placeholder failure chain; cover vs contain |
| `AddVehicle.test.tsx` | Empty `imageUrl`, Clear + preview, existing validation |
| `EditVehicle.test.tsx` | Label updates for optional field |
| `seed-demo.test.ts` | `_test` DB guard, optional photo resolve returns null |

## Coverage (after)

| Package | Lines |
| --- | --- |
| Backend | 94.15% (274/291) |
| Frontend | 80.87% (537/664) |

Backend tests: **73**. Frontend tests: **68** (21 files).

## Commits

1. `671b547` — test(backend): seed demo optional images and _test guard  
2. `9a0ab38` — feat(backend): default demo seed vehicles to null imageUrl  
3. `0dd0055` — test(frontend): category fallback and VehicleImage tiers  
4. `cd14eee` — feat(frontend): category illustrations in VehicleImage  
5. `135b03a` — test(frontend): optional admin image URL and preview  
6. `3476af4` — feat(frontend): optional image URL field with live preview  
7. `124b357` — docs: vehicle images README and SVG credits  
8. `8425c26` — docs: append Prompt 8 to PROMPTS.md  

## BLOCKED / skipped

- Reference composition pass (no `reference.png`).
- Manual viewport checks at 375/768/1280 (not automated).

## Assumptions

- Category strings in inventory align with seed categories (`SUV`, `Sedan`, `Electric`, etc.).
- Hero gradient overlay remains sufficient for text on both illustrations and photos.
