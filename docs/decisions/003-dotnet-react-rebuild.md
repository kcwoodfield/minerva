# ADR 003: ASP.NET Core + React (Vite) rebuild

**Status:** Accepted  
**Date:** 2026

## Context

The original stack was Django + Django Ninja + Next.js + Chakra UI. Maintenance cost, performance (heavy table libraries), and a desire for a typed vertical slice on the server motivated a rewrite.

## Decision

- **API:** ASP.NET Core with Carter, MediatR, EF Core, PostgreSQL
- **Client:** React 19 + Vite + TypeScript + Tailwind + Zustand
- **Remove** TanStack Query and React Table; use lightweight hooks + Zustand
- **ISBN lookup:** Parallel Google Books + Open Library with merge and HTML stripping
- **Legacy** `backend/` and `frontend/` directories removed from active development

## Consequences

- API routes are `/api/books` (not `/api/library/`).
- Dev ports: API **5000**, client **5174**, Postgres **5434**.
- JWT/auth not yet ported; single-user assumption until implemented.
- Historical docs on `main` are obsolete for this branch.

## References

- [Architecture overview](../architecture/overview.md)
- [Development setup](../development/setup.md)
