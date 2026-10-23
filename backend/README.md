# Car Dealership Backend

Node.js + TypeScript + Express 5 API backed by PostgreSQL through Prisma. Tests use Vitest and Supertest in a separate `_test` database.

## Requirements

- Node.js 20+
- PostgreSQL 15+ running on `localhost:5432`

## Getting started

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create your environment file and set a real secret:

   ```bash
   cp .env.example .env
   ```

   `JWT_SECRET` must be at least 32 characters. Keep `DATABASE_URL_TEST` set and make sure its database name ends with `_test`; the test setup refuses to run otherwise.

3. Create the databases (or use `docker compose up -d` from the repo root), then apply migrations:

   ```bash
   npx prisma migrate deploy
   ```

   Use `npx prisma migrate dev --name <change>` when changing `schema.prisma` locally.

4. Seed the admin user. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` first:

   ```bash
   npx prisma db seed
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

   The API listens on `PORT` (default `3000`). Health check: `GET /health`.

## Tests

```bash
npm test              # full suite
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

Tests run against `DATABASE_URL_TEST`, apply migrations automatically, and truncate all public tables between tests. The suite fails fast if the database name does not end with `_test`.

Before committing backend changes, run:

```bash
npm test
npx tsc --noEmit
npm run build
```

## Production build

```bash
npm run build
npm start
```

Build output goes to `dist/`; run `npx prisma migrate deploy` during deployment before starting the server.

## Rate limiting and proxies

`/api/auth/*` is rate limited per client IP (`AUTH_RATE_LIMIT_MAX` per `AUTH_RATE_LIMIT_WINDOW_MS`, default 100 requests per 15 minutes). Exceeding it returns `429` with `{ "error": { "code": "TOO_MANY_REQUESTS", "message": "Too many requests" } }`.

The limiter uses Express `req.ip`, which depends on the `trust proxy` setting:

- Direct connections (local, Docker): leave `TRUST_PROXY` unset or `false`.
- Render, Vercel, or one reverse proxy/load balancer: set `TRUST_PROXY=1` so the first `X-Forwarded-For` hop is trusted and the real client IP is used.
- Multiple proxy hops: set `TRUST_PROXY` to the exact hop count or a trusted subnet list. Never use `TRUST_PROXY=true` in production; it trusts client-supplied headers and lets callers spoof IPs to bypass rate limits.

## Routes

All vehicle routes require `Authorization: Bearer <jwt>`.

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/vehicles` | Any authenticated user |
| GET | `/api/vehicles/search` | Any authenticated user |
| POST | `/api/vehicles` | Admin |
| PUT | `/api/vehicles/:id` | Admin |
| DELETE | `/api/vehicles/:id` | Admin |
| POST | `/api/vehicles/:id/purchase` | Any authenticated user |
| POST | `/api/vehicles/:id/restock` | Admin |
| GET | `/health` | Public |
