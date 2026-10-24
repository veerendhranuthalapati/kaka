# Final submission checklist

## Deliverables
- [x] Root README.md with project explanation, tech stack, architecture (Mermaid), local setup (backend + frontend, Postgres, env, migrate, seed), API table with auth, error codes, assumptions/design decisions, Test report with real outputs, Known limitations and provenance, My AI Usage section with [TODO: my own words]
- [x] PROMPTS.md contains raw prompts (logged)
- [x] TESTPROMPTS.md referenced in README
- [ ] docs/screenshots/ with actual screenshots (placeholders / folder may be missing)
- [x] Backend done with TDD, security fixes, rate limiting
- [x] Frontend scaffolded with Vite/React/Tailwind v3.4, all required pages/routes/components
- [x] TDD tests for logic-heavy parts (API client 401/envelope, AuthContext, route guards, VehicleCard states, SearchFilters validation, Dashboard OUT_OF_STOCK)

## Verification
- [x] Backend: `npm test` → 12 files, 63 tests passed
- [x] Backend coverage: Statements 94.75%, Branches 88.07%, Functions 100%, Lines 94.75%
- [x] Backend: `npx tsc --noEmit` and `npm run build` pass
- [x] Frontend: `npm test` → 9 files, 34 tests passed
- [x] Frontend coverage: Statements 72.93%, Branches 64.33%, Functions 74.77%, Lines 73.79%
- [x] Frontend: `npx tsc --noEmit`, `npm run lint`, `npm run build` pass
- [x] No `dangerouslySetInnerHTML`, no secrets in bundle/history (spot-checked)
- [x] Co-author trailers on Cursor session commits as specified
- [x] No history rewriting

## Fresh clone simulation (steps to verify)
1. `git clone <repo> && cd <repo>`
2. **Backend:** `cd backend && cp .env.example .env` (set valid values), create `_test` DB, `npm install`, `npx prisma migrate deploy`, `npx prisma db seed`, `npm test && npx tsc --noEmit && npm run build`
3. **Frontend:** `cd frontend && cp .env.example .env` (set `VITE_API_URL`), `npm install`, `npm test && npx tsc --noEmit && npm run lint && npm run build`
4. Start backend and frontend, verify login/register, search, purchase (out of stock), admin create/edit/restock/delete

## Missing for submission (if any)
- Fill in [TODO: my own words] in README "My AI Usage" section
- Add actual screenshots to `docs/screenshots/`
- Ensure environment variables are set for local run (not committed)
