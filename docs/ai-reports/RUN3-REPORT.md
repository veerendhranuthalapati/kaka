# RUN3 — Documentation & verification report

**Scope:** Documentation and verification only (no feature or visual code changes in this run).  
**Date:** 2026-10-24

## 1. README updates

Updated root [`README.md`](../../README.md):

- API table: `GET /api/vehicles/:id` (200 / 400 / 404), expanded list/search notes, create/PUT spec + `imageUrl` behavior.
- New **Vehicle fields and validation** table (core + spec + search query params).
- **Sample / demo data disclaimer** (seed specs illustrative, not verified).
- Frontend routes: `/vehicles/:id` details page; admin pages mention specs.
- Assumptions: details page UX, Sora/Inter + dark showroom tokens (aligned with `CREDITS.md`).
- **Test report** section: actual RUN3 counts and coverage (backend 92 tests, frontend 97 tests).
- Left **My AI Usage** and **Screens (placeholders)** sections unchanged.

## 2. Live verification (dev DB + servers)

| Step | Result |
| --- | --- |
| `npm run seed:demo` (dev `dealership_dev`) | `seed:demo created 11 vehicles` |
| Backend `http://localhost:3000/health` | 200 |
| Frontend `http://localhost:5173/` | 200 |
| Proxy `http://localhost:5173/api/*` | Used for all API checks below |

**curl.exe via port 5173** (admin session from local `.env`; credentials/tokens not logged):

| Check | HTTP | Notes |
| --- | --- | --- |
| Admin login | 200 | — |
| `GET /api/vehicles` | 200 | Response includes spec keys (`year`, `fuelType`, …); `createdAt` / `updatedAt` valid ISO timestamps |
| `GET /api/vehicles/search?category=Sedan` | 200 | Items include spec fields (e.g. `odometerKm`) |
| `GET /api/vehicles/:id` (valid) | 200 | — |
| `GET /api/vehicles/not-a-uuid` | 400 | Invalid UUID param |
| `GET /api/vehicles/00000000-0000-4000-8000-000000000099` | 404 | Unknown id |
| `POST /api/vehicles` with specs | 201 | `year` + `fuelType` persisted |
| `POST` with `imageUrl: javascript:…` | 400 | Rejected |
| `POST /api/vehicles` as `USER` | 403 | — |
| `DELETE /api/vehicles/:id` as `USER` | 403 | — |

## 3. Fresh clone smoke test

- Cloned local repo to `%TEMP%\kaka-run3-fresh-<id>` (removed after run).
- `npm ci` in `backend/` and `frontend/`.
- Tests against `DATABASE_URL_TEST=postgresql://postgres:postgres@localhost:5432/dealership_run3_fresh_test` (name ends with `_test`; migrations applied by Vitest `beforeAll`).
- **Backend:** 19 files, 92 tests passed; `npm run build` OK.
- **Frontend:** tests + `npm run build` OK (clone reflects committed tree at clone time).
- Clone directory deleted.

## 4. Hygiene greps (file:line)

| Scan | Findings |
| --- | --- |
| Local absolute paths (`C:\Users\…`, `Desktop\kaka`) | **None** in tracked sources |
| Personal / private emails | **None** (only `example.com`, `test.com`, `autoyard.local`, `dealership.local` in tests/docs) |
| JWT-like strings (`eyJ…`) | **None** |
| Tracked `.env` files | **None** (`git ls-files` empty; `backend/.env` ignored via `.gitignore:3`) |

## 5. `npm audit --omit=dev`

| Package | Result |
| --- | --- |
| `backend/` | 0 vulnerabilities |
| `frontend/` | 0 vulnerabilities |

## 6. Test & coverage reference (workspace RUN3)

**Backend** (`cd backend && npm test` / `npm run test:coverage`):

```
 Test Files  19 passed (19)
      Tests  92 passed (92)
Lines        : 94.39% ( 337/357 )
```

**Frontend** (`cd frontend && npm test` / `npm run test:coverage`):

```
 Test Files  28 passed (28)
      Tests  97 passed (97)
Lines        : 80.06% ( 731/913 )
```

## Assumptions

- Postgres available on `localhost:5432` with `postgres`/`postgres` as in `.env.example`.
- Dev servers were already running on ports 3000 and 5173; not restarted for RUN3.
- Fresh clone used a file:// path mirror of the working copy; uncommitted local changes are not in that clone.
