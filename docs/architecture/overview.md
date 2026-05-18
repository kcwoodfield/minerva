# System architecture

## Overview

Minerva is a personal book library: a **React SPA** talks to an **ASP.NET Core API** backed by **PostgreSQL**. External **ISBN metadata** comes from Google Books and Open Library.

```
┌─────────────────────┐     /api/books      ┌─────────────────────┐
│  Minerva.Client     │ ──────────────────► │  Minerva.Api        │
│  React + Vite       │     JSON over HTTP  │  Carter + MediatR   │
│  Zustand UI state   │ ◄────────────────── │  EF Core            │
└─────────────────────┘                     └──────────┬──────────┘
                                                       │
                                                       ▼
                                            ┌─────────────────────┐
                                            │  PostgreSQL         │
                                            └─────────────────────┘
                                                       ▲
                                                       │ ISBN lookup
                                            ┌──────────┴──────────┐
                                            │ Google Books API    │
                                            │ Open Library API    │
                                            └─────────────────────┘
```

## Backend (`Minerva.Api`)

| Concern | Choice |
|---------|--------|
| HTTP | Minimal APIs via [Carter](https://github.com/CarterCommunity/Carter) modules |
| Application layer | [MediatR](https://github.com/jbogard/MediatR) handlers per feature |
| Validation | FluentValidation |
| Persistence | EF Core + Npgsql |
| IDs | `Guid` on `Book` |

Features live under `Features/Books/` (Create, GetAll, Update, Delete, LookupByISBN).

### ISBN lookup pipeline

1. `CompositeBookLookupService` calls Google Books and Open Library **in parallel**.
2. `BookMetadataMerger` prefers Google when both return a field; fills gaps from Open Library.
3. `DescriptionSanitizer` strips HTML from descriptions before returning to the client.
4. Open Library may fetch **work-level** descriptions when edition data lacks a summary.

## Frontend (`Minerva.Client`)

| Concern | Choice |
|---------|--------|
| Build | Vite |
| UI | React 19, Tailwind CSS 4, shadcn-style components |
| Forms | React Hook Form + Zod |
| Server data | `useEffect` + `libraryApi` (no React Query) |
| UI state | Zustand (`libraryStore`) with `useShallow` selectors |

### Library UI flow

1. `useBooks` loads paginated data from `GET /api/books`.
2. Filters/sort/page live in Zustand; changes refetch via hook dependencies.
3. Mutations call API then `bumpList()` to invalidate the list.
4. Row/card click opens **BookDetailModal**; **Edit** opens **EditBookModal**.

## API surface

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/books` | Paginated list (`page`, `pageSize`, `search`, `sortBy`, `ascending`) |
| POST | `/api/books` | Create |
| PUT | `/api/books/{id}` | Update |
| DELETE | `/api/books/{id}` | Delete |
| GET | `/api/books/lookup/{isbn}` | Metadata by ISBN (digits only in path) |

JSON uses **camelCase**. Empty strings for optional dates are normalized to `null` via `NullableDateTimeJsonConverter`.

## Security (current)

- No authentication enforced (single-user design; multi-user planned).
- CORS restricted in development to the Vite origin.
- Secrets via configuration / environment — not committed.

See [roadmap](../roadmap.md) for auth and deployment plans.
