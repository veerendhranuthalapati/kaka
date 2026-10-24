# Project progress

## RUN1 (complete)

Invalid dates, seed cleanup, dashboard cards, shared `VehicleForm`, top bar overflow fixes. See `RUN1-REPORT.md`.

## RUN2 (complete) — visual redesign

- Dark showroom theme: CSS variables, Tailwind tokens, WCAG AA contrast test (`THEME_CONTRAST_PAIRS`).
- Fonts: Sora (display) + Inter (body); Manrope removed.
- Components restyled: top bar (glass), cards, details page (sticky purchase panel, spec grid), filters, toasts, dialogs, login/register.
- Illustrations: all `frontend/public/cars/*.svg` redrawn (800×400, `currentColor`).
- Motion: CSS transitions, route fade, dialog/drawer enter, stock highlight + purchase success toast; respects `prefers-reduced-motion`.
- Skeleton loading placeholders (inventory, details, buttons while purchasing).

## RUN3 (complete) — docs & verification

- README: spec validation table, `GET /api/vehicles/:id`, details route, seed disclaimer, updated test/coverage figures.
- curl via 5173, `seed:demo`, fresh-clone `npm ci` + test DB + builds, hygiene greps, audits. See `RUN3-REPORT.md`.

## Next

- Spec lookup API/UI (Prompt B).

## Blocked

- None.
