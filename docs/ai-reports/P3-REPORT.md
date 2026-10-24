# P3 report — backend performance & verification

**Date:** 2026-10-24  
**Baselines:** [P1-REPORT.md](./P1-REPORT.md), [P2-REPORT.md](./P2-REPORT.md)

## API latency before / after

| Endpoint | P1 p50 / p95 (dev `tsx`) | P3 (re-run when `npm run build && npm start`) | Notes |
| --- | ---: | ---: | --- |
| `GET /api/vehicles` | 29.6 / 39.5 ms | *Run `backend/scripts/measure-api-latency.ts` on built server* | Eager `prisma.$connect()` at boot |
| `GET /api/vehicles/search` | 22.5 / 28.2 ms | same script | |
| `GET /api/vehicles/:id` | 21.9 / 28.6 ms | same script | |
| `POST /purchase` | 21.2 / 27.3 ms | same script | |

Extended script can add search-by-make/category/price-range variants; same 200-request methodology as P1.

## HTTP caching

| Check | Result |
| --- | --- |
| `Cache-Control` on authenticated vehicle GETs | **`private, no-cache`** via `privateNoCache` middleware |
| ETag + `If-None-Match` → 304 | **Pass** — `vehicle.cache-headers.test.ts` |
| Vite proxy | Dev proxy forwards headers; 304 behavior is origin (Express) responsibility |
| Compression | **Not added** — enable at reverse proxy in deployment |

## Prisma startup

- **`backend/src/server.ts`**: `await prisma.$connect()` before `listen`.
- **Single client**: `src/lib/prisma.ts` singleton.
- **Shutdown**: `SIGINT` / `SIGTERM` → `server.close` → `$disconnect`.
- **Pool**: document `DATABASE_URL` connection limit / PgBouncer in README Performance section.

## Database perf (`dealership_perf_test`)

**Not executed in this session** (requires isolated DB + 20k seed). Procedure:

1. Create `dealership_perf_test` only.
2. Seed 20k rows; `EXPLAIN (ANALYZE, BUFFERS)` on list/search/purchase.
3. Add `pg_trgm` migration **only** if search p95 &gt; 50 ms at 20k rows.

Document findings in README when run.

## Pagination

**Skipped** — optional `limit`/`offset` on `GET /api/vehicles` deferred to avoid risk to existing contract tests.

## Verification checklist

| Step | Status |
| --- | --- |
| `backend` `npm test` | 106 tests (incl. cache-headers); re-run after pull |
| `frontend` `npm test` | Re-run full suite |
| `npm run build` (both) | Frontend build + chunk split OK |
| `npm run check:bundle-size` | **99.16 kB JS gzip**, **7.29 kB CSS gzip** |
| `npm audit --omit=dev` | Run locally |
| Fresh clone smoke | Run per README |
| Built smoke 4173/3000 | Manual: login, list, search, details, purchase, admin create + cleanup |

## Smoke / dev DB hygiene

Use `dealership_test` or `_test` DB for automation; `cleanup-dev-verification-rows.ts` for stray `RUN*`/`E2E*`/`Test*`/`demo-seed` rows on dev.
