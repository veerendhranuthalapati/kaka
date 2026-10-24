You are a READ-ONLY reviewer of this repo. Do NOT edit, create, delete or commit any files, and do not run migrations or anything that modifies state. You may read code and run the existing test suite and coverage only.

Review for:
1. Security: authorization gaps (every route's role check against: POST/PUT/DELETE/restock = ADMIN; list/search/purchase = any authenticated user), JWT handling (HS256 pinned, expiry, secret from env), user enumeration or timing leaks on login, mass assignment (role or quantity injectable via register or PUT), passwordHash leaking into any response, missing validation, error responses leaking internals, CORS/helmet/rate limit config.
2. Correctness: purchase atomicity and oversell races, negative stock paths, search semantics (make/model contains, category exact, inclusive price range, minPrice > maxPrice returns 400), route ordering of /search vs /:id.
3. Test quality: tests that pass trivially, missing edge cases, flaky shared-DB risk, coverage gaps.
4. Clean code: SOLID violations, layering leaks (business logic in controllers, Prisma outside repositories), unclear naming.

Output a table: severity (High/Med/Low), file:line, issue, why it matters, and a suggested failing test that would prove it. Do not output fixes as code edits. If you are unsure about something, say so rather than guessing. create a new file testprompts.md and add every prompt i provide

You may append to TESTPROMPTS.md only (log my raw prompts verbatim; never your own replies). Modify nothing else. Also review: dependency risk (npm audit --omit=dev), rate-limit effectiveness behind a proxy, and whether any route's guard differs from: POST/PUT/DELETE vehicles and restock = ADMIN; list, search, purchase = any authenticated user.
