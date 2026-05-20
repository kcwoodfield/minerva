# Roadmap

Planned work in rough priority order. Not committed timelines.

## Near term (P1)

- [ ] Started / finished dates on books
- [ ] Goodreads / CSV import
- [ ] Shelves / tags

## Medium term (P2)

- [ ] Annual reading goal tracker
- [ ] Richer Insights page (more charts, streaks, longest books)
- [ ] Barcode scan on mobile (ISBN via camera)
- [ ] Empty state / first-run experience

## Long term (P3)

- [ ] Surface series grouping in library
- [ ] Authentication (JWT or cookie session) and user-scoped data
- [ ] LangGraph-based recommendations and semantic search (see ADR 002)
- [ ] Multi-user libraries with data isolation

## Done

- [x] ASP.NET Core API + EF Core + PostgreSQL
- [x] React/Vite client with Minerva design system (cream/ink palette, dark mode)
- [x] ISBN lookup merge (Google Books + Open Library) + HTML sanitization
- [x] Cover image uploads with CDN proxy fallback
- [x] List view (table) and grid view (cover cards)
- [x] Book detail modal with prev/next navigation, keyboard shortcuts, deep-link URL
- [x] Add / edit / delete with confirmation dialog
- [x] AI-generated haiku per finished book (Ollama or Anthropic); hover overlay on grid cards
- [x] Reading notes, quotes, and highlights (API + data model)
- [x] Archived books (excluded from main library, available in filter)
- [x] Bulk ISBN upload page
- [x] Insights page (stats, monthly chart, genres, authors, fiction split)
- [x] Settings menu (dark mode toggle + bulk upload link)
- [x] ⌘K search shortcut; ⌘B add-book shortcut
- [x] Mobile nav drawer with responsive layout
- [x] Duplicate ISBN pre-check on add
- [x] Zustand UI state with selector hooks; no TanStack Query/Table
