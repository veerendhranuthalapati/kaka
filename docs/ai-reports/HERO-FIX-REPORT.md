# Hero fix & photo audit report

**Date:** 2026-10-24

## Part 1 — Hero white veil (root cause)

| Source | Rule | Effect |
| --- | --- | --- |
| `HeroCarousel.tsx` (before) | `bg-gradient-to-t from-ink via-ink/80 via-45% to-ink/10` on full-bleed overlay | **`ink` is the light text colour** (`--ink: 245 246 250` in `index.css`), so the scrim was a **light/white haze** over the lower half of the photo. |
| `HeroCarousel.tsx` (before) | Prev/next: `bg-white/95 text-ink` centred vertically | White discs with dark chevrons; poor contrast on bright images and overlap with title. |
| `index.css` `.btn-hero-secondary` | `bg-ink/80` on hero secondary | Near-white button on a washed-out overlay → **white-on-white** Details control. |
| `VehicleImage` | `vehicle-img-loading` `opacity-0` until load | Not the veil; image runs at **opacity 1** when loaded (unchanged). |

**Fix:** Fixed rgba scrims in `heroOverlayTheme.ts` (bottom + left gradients), dark glass Details button, bottom-right arrow pair, dots on dark pill, text zone bottom-left (`p-6` / `sm:p-8` ≈ 24–32px). Tests: `heroOverlayTheme.test.ts`, `HeroCarousel.test.tsx` (structure + fixed scrim strings).

**Hero tests changed**

| Test | Reason |
| --- | --- |
| New: fixed scrim / control zone structure | Assert non-theme scrim and arrows outside `data-hero-text-zone`. |
| Existing arrow/chevron tests | Unchanged behaviour; still 44px targets. |

## Part 2 — Photo audit

**Rule (pipeline + integrity):** `photoAcceptableForDemoVehicle` — make **and** model in title/categories (accent-normalized); no other demo make; category conflict hints (e.g. Honda Pilot wagon for Skoda Combi). Unit fixture: Honda Pilot → Skoda Octavia Combi **rejected**; BMW 5-Series → BMW 3 Series **rejected** (no `E39` digit false positive).

**Skoda Octavia Combi:** was showing **category fallback** `wagon-1.jpg` (Honda Pilot). Now **`skoda-octavia-combi.jpg`** — *Skoda Octavia RS Combi, Auto 2024, Zurich*.

**Fetch:** `npm run fetch:car-photos` — 31 vehicle JPEGs + category fillers; manifest **52** entries; ~9.2 MB total. `seed:demo` updated image URLs on dev (31 updated).

### Demo vehicle photo match summary

| Vehicle | Commons title (short) | Make+model in title | Notes |
| --- | --- | --- | --- |
| All 31 catalog rows | See `frontend/src/data/car-photos.json` | Yes (integrity test) | Each has dedicated `make-model.jpg`; fillers only for empty `imageUrl` admin cars. |

**Notable corrections vs old manifest:** dedicated files for all demo models (previously many used category fillers, e.g. Skoda → Honda wagon). **BMW 3 Series** re-picked after stricter token matching (was 5-Series E39).

**Review page:** `docs/design/photo-review.html` (git-ignored) regenerated.

## Verify

- `npx vitest run` hero + integrity + `car-photos.lib` unit tests: pass.
- Manual: `cd frontend && npm run build && npx vite preview --port 4173` — check 6 hero slides + grid (readable text, dark scrim, arrows bottom-right).
