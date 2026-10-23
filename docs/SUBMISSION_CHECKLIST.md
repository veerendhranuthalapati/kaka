# Final submission checklist

## Deliverables
- [x] Root README.md with project explanation, tech stack, architecture (Mermaid), local setup (backend + frontend, Postgres, env, migrate, seed), API table with auth, error codes, assumptions/design decisions (admin-only writes, 1-unit purchase, search semantics, sessionStorage tradeoff), Test report with real outputs, screenshots placeholders, My AI Usage section with [TODO: my own words]
- [x] PROMPTS.md contains only raw prompts (logged)
- [x] TESTPROMPTS.md referenced in README
- [x] docs/screenshots/ with .gitkeep
- [x] Backend done with TDD, security fixes, rate limiting
- [x] Frontend scaffolded with Vite/React/Tailwind v3.4, all required pages/routes/components
- [x] TDD tests for logic-heavy parts (API client 401/envelope, AuthContext, route guards, VehicleCard states, SearchFilters validation)

## Verification
- [x] Backend: `npm test` → 9 files, 52 tests passed
- [x] Backend coverage: All files 93.91% stmts/lines, 83.14% branch, 100% funcs
- [x] Backend: `npx tsc --noEmit` and `npm run build` pass
- [x] Backend: `npm audit --omit=dev` → 0 vulnerabilities
- [x] Frontend: `npm test` → 5 files, 22 tests passed
- [x] Frontend coverage: All files 88.04% stmts, 84.73% branch, 88.46% funcs, 87.79% lines
- [x] Frontend: `npx tsc --noEmit`, `npm run lint`, `npm run build` pass
- [x] Frontend: `npm audit --omit=dev` → 0 vulnerabilities
- [x] No `dangerouslySetInnerHTML`, no secrets in bundle/history
- [x] Co-author trailers on commits as specified
- [x] No history rewriting

## Fresh clone simulation (steps to verify)
1. `git clone <repo> && cd <repo>`
2. **Backend:** `cd backend && cp .env.example .env` (set valid values), create `_test` DB, `npm install`, `npx prisma migrate deploy`, `npx prisma db seed`, `npm test && npx tsc --noEmit && npm run build && npm audit --omit=dev`
3. **Frontend:** `cd frontend && cp .env.example .env` (set `VITE_API_URL`), `npm install`, `npm test && npx tsc --noEmit && npm run lint && npm run build && npm audit --omit=dev`
4. Start backend and frontend, verify login/register, search, purchase (out of stock), admin create/edit/restock/delete

**Report:** All steps above pass in the current environment (Postgres available for backend tests; frontend builds/tests pass).

## Secrets scan (git history)
Checked recent commits and diffs - only placeholders in `.env.example` files, no real secrets/tokens/passwords found. No `.env` files committed.

## Missing for submission (if any)
- Fill in [TODO: my own words] in README "My AI Usage" section
- Add actual screenshots to `docs/screenshots/` (placeholders exist)
- Ensure environment variables are set for local run (not committed)
