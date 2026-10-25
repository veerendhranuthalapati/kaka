# Security policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main` (latest) | Yes |
| Older tags | No |

Security fixes are applied on the active development branch only.

## Reporting a vulnerability

Please **do not** open public GitHub issues for security problems.

1. Use [GitHub private vulnerability reporting](https://github.com/OWNER/REPO/security/advisories/new) for this repository (replace `OWNER/REPO` with your fork’s remote).
2. Or contact the maintainer at **[TODO: my contact]** (replace this placeholder before production use; do not publish a personal email here until you intend to support it).

Include steps to reproduce, impact, and any proof-of-concept. We aim to acknowledge reports within a few business days.

## Scope

This policy covers the Autoyard / car-dealership monorepo: Express API, React SPA, Prisma/PostgreSQL, and deployment headers documented in `docs/SECURITY-DESIGN.md`.

## Out of scope

Third-party hosting defaults, dependency advisories already tracked via `npm audit`, and issues in forks or deployments that diverge from this repository’s documented configuration.
