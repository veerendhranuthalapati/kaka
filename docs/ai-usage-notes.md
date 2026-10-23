# Running notes for README "My AI Usage"

- **Planning (Step 1):** OpenCode AI produced repo layout, Prisma sketch, API contract, TDD ordering, commit plan, and risk list; user approved with search/purchase/auth/PUT-quantity decisions.
- **Chore commits:** AI generated monorepo skeleton, docker-compose, and backend scaffold; user to review before push.
- **Backend scaffold:** AI added Express `createApp()` factory, Vitest (`fileParallelism: false`), Supertest health smoke test, and `.env.example`.
- **TDD #1 RED:** AI wrote failing Supertest for register invalid email; user runs suite before GREEN.
- **TDD #1 GREEN:** AI added Zod register schema (email + password 8–72 strict), validateBody middleware, and auth route stub.
