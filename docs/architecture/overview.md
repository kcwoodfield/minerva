# System architecture

## Overview

Minerva is a personal book library: a **React SPA** talks to an **ASP.NET Core API** backed by **PostgreSQL**. External **ISBN metadata** comes from Google Books and Open Library. Optional **AI haiku generation** uses Ollama (local) or Anthropic (cloud).

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
                                                  ISBN / AI
                                            ┌──────────┴──────────┐
                                            │ Google Books API    │
                                            │ Open Library API    │
                                            │ Ollama / Anthropic  │
                                            └─────────────────────┘
```

## Backend (`Minerva.Api`)

| Concern | Choice |
|---------|--------|
| HTTP | Minimal APIs via [Carter](https://github.com/CarterCommunity/Carter) modules |
| Application layer | [MediatR](https://github.com/jbogard/MediatR) handlers per feature |
| Validation | FluentValidation |
| Persistence | EF Core + Npgsql |
| IDs | `Guid` on `Book` and `BookNote` |

Feature layout:

```
Features/
├── Books/
│   ├── Create, GetAll, Update, Delete
│   ├── LookupByISBN, SearchByTitle
│   ├── UploadCover, CoverProxy
│   ├── GetStats, GenerateHaiku
│   └── Services/   # lookup, merge, sanitize, haiku
└── Notes/
    ├── GetNotes, CreateNote, UpdateNote, DeleteNote
    └── BookNote.cs, NoteValidation.cs
```

### Cover image pipeline

Uploaded files are stored by `BookImageStorage` under `BookImages:RootPath` and served as static files at `/uploads/covers/{file}`. The original external URL is preserved in `CoverSourceUrl`; deleting an upload reverts to it. `CoverProxyModule` proxies external covers from an allowlisted set of hosts (Open Library, Google Books) so the browser never hits third-party origins directly.

### ISBN lookup pipeline

1. `CompositeBookLookupService` calls Google Books and Open Library **in parallel**.
2. `BookMetadataMerger` prefers Google when both return a field; fills gaps from Open Library.
3. `DescriptionSanitizer` strips HTML from descriptions before returning to the client.
4. Open Library may fetch **work-level** descriptions when edition data lacks a summary.

### Haiku generation

`HaikuGenerationService` sends title, author, and optional summary to the configured provider (Ollama for local inference or Anthropic for cloud). Reading notes are never sent.

## Frontend (`Minerva.Client`)

| Concern | Choice |
|---------|--------|
| Build | Vite |
| UI | React 19, Tailwind CSS 4, shadcn-style Radix/Base UI components |
| Forms | React Hook Form + Zod |
| Server data | `useEffect` + `libraryApi` (no React Query) |
| UI state | Zustand (`libraryStore`) with `useShallow` selectors |
| Routing | Hash + `history.pushState` (no router library); `?book=<id>` for deep links |

### Pages

- `/` — Library (list/grid) + FilterBar
- `/#insights` — Insights dashboard
- `/upload` — Bulk ISBN upload

### Library data flow

1. `useBooks` loads paginated data from `GET /api/books`.
2. Filters/sort/page live in Zustand; changes refetch via hook dependencies.
3. Mutations call the API then `bumpList()` to increment `listVersion` and trigger refetch.
4. Row/card click opens `BookDetailModal` (pushes `?book=<id>`); ⋯ menu opens edit or delete.

## API surface

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/books` | Paginated list (`page`, `pageSize`, `search`, `sortBy`, `ascending`, `archived`) |
| POST | `/api/books` | Create |
| PUT | `/api/books/{id}` | Update |
| DELETE | `/api/books/{id}` | Delete |
| GET | `/api/books/lookup/{isbn}` | Metadata by ISBN (digits only in path) |
| GET | `/api/books/search` | Search by title/author (`q`) |
| GET | `/api/books/stats` | Reading statistics |
| POST | `/api/books/generate-haiku` | Generate haiku (title + author + optional summary) |
| POST | `/api/books/{id}/cover` | Upload a cover image (multipart/form-data) |
| DELETE | `/api/books/{id}/cover` | Remove uploaded cover; reverts to `CoverSourceUrl` |
| GET | `/api/books/{id}/cover` | Serve local cover or stream from allowlisted CDN hosts |
| GET | `/api/books/{id}/notes` | List notes (404 if book missing) |
| POST | `/api/books/{id}/notes` | Create note (`note` \| `quote` \| `highlight`) |
| PUT | `/api/books/{id}/notes/{noteId}` | Update note |
| DELETE | `/api/books/{id}/notes/{noteId}` | Delete note |

JSON uses **camelCase**. Empty strings for optional dates are normalized to `null` via `NullableDateTimeJsonConverter`.

## Security (current)

- No authentication enforced (single-user design).
- CORS restricted to the configured origin (`Cors:Origins`; defaults to the Vite dev origin).
- Secrets via configuration / environment — not committed.
- Server-side cover fetches are restricted to known book-metadata hosts (Open Library, Google Books CDNs).
- Haiku generation sends title, author, and optional summary only; reading notes are not transmitted.
