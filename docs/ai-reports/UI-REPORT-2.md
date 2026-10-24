# UI report 2 (Prompt 7)

## Reference pass (`docs/design/reference.png`)

**BLOCKED:** `docs/design/reference.png` was not present on disk in this workspace (`docs/design/` contained no image). Visual comparison against the reference could not be performed.

**Composition adjustments (automotive storefront patterns, original Auto Yard branding):**

| Intended reference cue | Prior state | Change |
| --- | --- | --- |
| Taller top bar, centered nav | Single-row flex bar | `4.25rem` grid header with centered primary nav |
| Hero arrows on image | Arrows below card | Overlay circular prev/next on hero |
| Dots above hero copy | Dots below card | Dots inside gradient, above title |
| Stronger text-on-photo contrast | Lighter gradient | `from-ink/90 via-ink/45` overlay |
| White secondary CTA on hero | `btn-secondary` bordered | `btn-hero-secondary` solid white |
| Larger hero radius | `rounded-3xl` | `rounded-[2rem]` |
| Pill floating bottom bar | `rounded-2xl` | `rounded-full`, wider max width |
| No horizontal bleed | — | `overflow-x-hidden` on `html`/`body` |

## Photos (`frontend/public/cars`)

**Files on disk (10):** `coupe-01.svg`, `ev-01.svg`, `hatch-01.svg`, `placeholder.svg`, `sedan-01.svg`, `sedan-02.svg`, `suv-01.svg`, `suv-02.svg`, `truck-01.svg`, `wagon-01.svg` — no `.jpg`/`.png`/`.webp` photos in this workspace.

**Seed:** `resolveDemoVehicleImageUrl` tries `{make-model}.{jpg,jpeg,png,webp}`, then `{slug}.svg`, then rotates fallback SVGs. Unit test uses a temp dir with `aurora-lx.jpg`.

**CREDITS.md:** SVGs listed as original work; photograph section documents slug matching and `[TODO: author and licence]` lines to fill when photos are added.

**Images:** `VehicleImage` uses `object-cover`, `aspect-[16/9]`, `loading="lazy"` by default; hero slide 0 uses `loading="eager"` / `fetchPriority="high"`.

## Coverage

| Check | Result |
| --- | --- |
| `frontend/vitest.config.ts` | **Does not exist**; Vitest is configured in `frontend/vite.config.ts`. No diff vs `d8c1bb0` for that file. |
| Frontend lines (before) | **71.15%** (370/520) per prior README |
| Frontend lines (after) | **80%** (508/635) |
| Backend lines (after) | **94.38%** (269/285) |

**Lowest frontend line coverage (after):** `State.tsx` (~50%), `InventoryVehicleCard.tsx` (~58%), `Dashboard.tsx` (~60%), `EditVehicle.tsx` (~66%), `VehicleCard.tsx` (~71%).

## Tests added or extended

| File | Reason |
| --- | --- |
| `backend/tests/unit/seed-demo.test.ts` | Photo slug resolution and asset listing |
| `RestockDialog.test.tsx` | 1–10000, reject invalid amounts, Escape, API failure |
| `TopBar.test.tsx` | Mobile menu + Escape; desktop category filter |
| `AddVehicle.test.tsx` | Client validation, imageUrl, success navigation |
| `EditVehicle.test.tsx` | No quantity field, server errors, imageUrl, restock |
| `validation.test.ts` | Email, password UTF-8, credentials, imageUrl edges |
| `auth.test.ts` | Login/register API wrappers |
| `HeroCarousel.test.tsx` | Arrow keys, purchase/details callbacks |
| `Dashboard.test.tsx` | Inventory skeleton grid while loading |
| `VehicleImage.test.tsx` | Eager loading prop |
| `RestockDialog.tsx` `noValidate` | Allow JS validation for out-of-range amounts (lock-in with tests) |
| `AddVehicle.tsx` `noValidate` | Same for admin create form |

## Verify (previous report gaps)

| Item | Status |
| --- | --- |
| Skeleton loaders on inventory grid | **Present**; lock-in test in `Dashboard.test.tsx` |
| Keyboard-accessible mobile menu | **Present** (`role="dialog"`, Escape); `TopBar.test.tsx` |
| No horizontal scroll at 375/768/1280 | **Mitigation:** `overflow-x-hidden` on root; not browser-automated in CI |
| Carousel arrow keys | **Present**; `HeroCarousel.test.tsx` |

## Commits

1. `c71e7dc` — test(backend): lock in demo seed image slug resolution  
2. `94be988` — feat(backend): resolve demo vehicle images from public car assets  
3. `bcb5762` — test(frontend): cover admin flows, dialogs, and validation  
4. `65ced57` — feat(ui): refine hero, header, and floating bar composition  
5. `3783737` — feat(frontend): eager hero images and client-side form validation  
6. `c741ed7` — docs: update test counts, coverage, and image credits  
7. `d425af7` — docs: append Prompt 7 to PROMPTS.md  

## BLOCKED / skipped

- **Reference image:** file missing; no pixel comparison.  
- **Photo CREDITS lines per file:** no raster photos on disk to attribute.  
- **Responsive overflow:** manual viewport check not run in automation.

## Assumptions

- User will add photos named `{make}-{model}.{ext}` under `frontend/public/cars` locally; seed and CREDITS are ready.  
- `80%` frontend line target met via meaningful admin/dialog tests, not deleting coverage exclusions.

## Hand-todo

- Place `docs/design/reference.png` locally and spot-check layout.  
- Add photos and fill `[TODO: author and licence]` in `CREDITS.md`.  
- Run `seed:demo` after adding photos.
