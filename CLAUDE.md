# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minerva is a personal book library management system.

- **Backend** (`src/Minerva.Api/`): ASP.NET Core (.NET 10), Carter minimal-API modules, MediatR CQRS handlers, FluentValidation, EF Core + Npgsql (PostgreSQL)
- **Frontend** (`src/Minerva.Client/`): React 19, Vite, TypeScript, Tailwind CSS 4, Zustand, React Hook Form + Zod

## Development Commands

### Database (Docker)

```bash
docker compose up -d   # start PostgreSQL on localhost:5434
```

### API

```bash
cd src/Minerva.Api
dotnet ef database update   # first run — apply EF Core migrations
dotnet run --launch-profile http
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

### Client

```bash
cd src/Minerva.Client
npm install
npm run dev
# App: http://localhost:5174 (proxies /api/* to http://localhost:5000)
```

### EF Core migrations

```bash
cd src/Minerva.Api
dotnet ef migrations add <Name>
dotnet ef database update
```

## Architecture

### Backend

| Concern | Choice |
|---------|--------|
| HTTP routing | Carter `ICarterModule` — each feature registers its own routes |
| Application layer | MediatR `IRequest<T>` / `IRequestHandler<T>` — one handler class per command/query |
| Validation | FluentValidation validators wired into MediatR pipeline |
| Persistence | EF Core `MinervaDbContext` + Npgsql |
| Configuration | `appsettings.json` + env vars (double-underscore convention: `Cors__Origins`) |

Feature layout: `src/Minerva.Api/Features/Books/{Create,GetAll,Update,Delete,LookupByISBN,UploadCover,CoverProxy}/`

Each feature folder contains a Carter module (`*Module.cs`) and, where needed, a MediatR command/query + handler.

#### ISBN lookup pipeline

1. `CompositeBookLookupService` calls Google Books and Open Library **in parallel**.
2. `BookMetadataMerger` prefers Google when both return a field; fills gaps from Open Library.
3. `DescriptionSanitizer` strips HTML before returning to the client.

#### Cover image pipeline

- **Uploads**: `BookImageStorage` saves files under `BookImages:RootPath`; served as static files at `/uploads/covers/{file}`.
- **Proxy**: `CoverProxyModule` proxies external covers from an allowlisted set of hosts (Open Library, Google Books) so the browser never hits third-party origins.
- When a file is uploaded, the original external URL is preserved in `CoverSourceUrl`; deleting the upload reverts `CoverImageUrl` to it.

### Frontend

| Concern | Choice |
|---------|--------|
| Build | Vite |
| UI | React 19, Tailwind CSS 4, shadcn-style Radix components |
| Forms | React Hook Form + Zod |
| Server data | `useEffect` + `libraryApi` (no TanStack Query) |
| UI state | Zustand (`libraryStore`) with `useShallow` selectors |
| Theming | `next-themes` (framework-agnostic; works with Vite) |

Feature code lives in `src/Minerva.Client/src/features/library/`.

## API Surface

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/books` | Paginated list (`page`, `pageSize`, `search`, `sortBy`, `ascending`) |
| POST | `/api/books` | Create book |
| PUT | `/api/books/{id}` | Update book |
| DELETE | `/api/books/{id}` | Delete book |
| GET | `/api/books/lookup/{isbn}` | Metadata by ISBN (digits only in path) |
| POST | `/api/books/{id}/cover` | Upload cover image (multipart/form-data) |
| DELETE | `/api/books/{id}/cover` | Remove uploaded cover; reverts to `CoverSourceUrl` |
| GET | `/api/books/{id}/cover` | Serve or proxy the book's cover |
| GET | `/api/covers/proxy?url=` | Proxy an arbitrary allowlisted cover URL |

All JSON uses camelCase. Empty strings for optional date fields are normalized to `null` via `NullableDateTimeJsonConverter`.

## Key File Locations

### API

| File | Purpose |
|------|---------|
| `src/Minerva.Api/Program.cs` | Service registration, middleware, static files |
| `src/Minerva.Api/appsettings.json` | Default config (connection string, CORS, Google Books key) |
| `src/Minerva.Api/Features/Books/Book.cs` | `Book` entity + `BookDto` |
| `src/Minerva.Api/Infrastructure/Data/MinervaDbContext.cs` | EF Core context |
| `src/Minerva.Api/Infrastructure/Storage/BookImageStorage.cs` | Cover file management |
| `src/Minerva.Api/Migrations/` | EF Core migration files |

### Client

| File | Purpose |
|------|---------|
| `src/Minerva.Client/src/features/library/api/libraryApi.ts` | All HTTP calls |
| `src/Minerva.Client/src/features/library/store/libraryStore.ts` | Zustand store |
| `src/Minerva.Client/src/features/library/types/library.types.ts` | Shared TS types + Zod schemas |
| `src/Minerva.Client/src/lib/api.ts` | Axios instance base config |
| `src/Minerva.Client/vite.config.ts` | Proxy config (`/api`, `/uploads/covers`, `/assets/images`) |

### Documentation

| Path | Contents |
|------|---------|
| `docs/README.md` | Index |
| `docs/architecture/overview.md` | Architecture + API surface |
| `docs/architecture/data-model.md` | `Book` field reference |
| `docs/development/` | Setup, configuration |
| `docs/features/` | Library UI, ISBN lookup |
| `docs/decisions/` | ADRs (including dotnet rebuild) |
| `docs/roadmap.md` | Planned work |

## Configuration

Local dev values live in `src/Minerva.Api/appsettings.json`. For secrets (API keys, real DB passwords) use [.NET user secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) or environment variables.

Environment variables use ASP.NET Core double-underscore convention:

```bash
ConnectionStrings__DefaultConnection=Host=...
GoogleBooks__ApiKey=...
Cors__Origins=http://localhost:5174
```

See `.env.example` for the full list.

## Development Guidelines

### Adding a new API feature

1. Create `src/Minerva.Api/Features/Books/<Feature>/` with a Carter module and MediatR handler.
2. Add a FluentValidation validator if the command takes user input.
3. Register nothing in `Program.cs` — Carter auto-discovers modules; MediatR scans the assembly.

### Adding a new client feature

- Mirror the library feature structure: `api/`, `components/`, `hooks/`, `store/`, `types/`.
- Use Zod for form validation schemas; keep them in `types/`.
- UI state in Zustand; avoid prop-drilling for cross-component state.

### Database changes

1. Modify `Book.cs` (entity).
2. Run `dotnet ef migrations add <Name>` from `src/Minerva.Api/`.
3. Review the generated migration.
4. Run `dotnet ef database update`.
5. Update `BookDto.FromBook()` and the client `Book` type / Zod schema as needed.

## Testing

No automated test suite is currently configured. Before shipping a change:

- **API**: `dotnet build` from `src/Minerva.Api/` — must have zero errors/warnings.
- **Client**: `npm run build` or `npx tsc -b` from `src/Minerva.Client/` — must typecheck clean.
- Manual smoke test: start both services and exercise the changed flows.

## Project Structure

```
kcw_minerva/
├── src/
│   ├── Minerva.Api/
│   │   ├── Features/Books/       # Carter modules + MediatR handlers
│   │   ├── Infrastructure/       # DbContext, storage, JSON converters
│   │   ├── Migrations/           # EF Core migrations
│   │   ├── Program.cs
│   │   └── appsettings.json
│   └── Minerva.Client/
│       ├── src/
│       │   ├── features/library/ # Main feature (api, components, hooks, store, types)
│       │   ├── components/       # Shared UI components
│       │   └── lib/              # Axios client, utilities
│       └── vite.config.ts
├── docker-compose.yml            # PostgreSQL for local dev
├── docs/                         # Architecture and feature documentation
├── .env.example                  # Deployment env var reference
└── CLAUDE.md                     # This file
```

## Current Status

- Single-user; no authentication enforced.
- CORS reads from `Cors:Origins` config (falls back to `http://localhost:5174` if unset).
- Deployment: configure `VITE_API_URL` (build-time) and `Cors__Origins` (runtime) for your domains.
