# Roadmap

Current focus: stable personal library on the dotnet + React stack. Items below are **not** committed timelines.

## Near term

- [ ] Authentication (JWT or cookie session) and user-scoped data
- [ ] Automated tests (API integration, client component tests)
- [ ] Production deployment guide (hosting API + static client + managed Postgres)
- [ ] Remove or archive leftover `backend/` / `frontend/` tree if still present on `main`

## Medium term

- [ ] Bulk import/export (CSV / JSON)
- [ ] Tag management UI
- [ ] Reading statistics dashboard
- [ ] PWA / offline-friendly mobile layout

## Long term (see ADR 002)

- [ ] LangGraph-based recommendations and semantic search
- [ ] Multi-user libraries with isolation

## Done (dotnet rebuild branch)

- [x] ASP.NET Core API + EF Core + PostgreSQL
- [x] React/Vite client with Minerva design system
- [x] ISBN lookup merge (Google + Open Library) + HTML sanitization
- [x] Detail / edit modals, list & grid views, dark mode
- [x] Zustand-based UI state (TanStack removed)
