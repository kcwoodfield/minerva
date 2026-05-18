# Minerva

Personal book library management: an ASP.NET Core API with a React (Vite) client, PostgreSQL, and ISBN metadata from Google Books and Open Library.

## Quick start

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download) (or the SDK matching `Minerva.Api.csproj`)
- [Node.js 20+](https://nodejs.org/) and npm
- [Docker](https://www.docker.com/) (for PostgreSQL)

### 1. Database

```bash
docker compose up -d
```

PostgreSQL listens on **localhost:5434** (`minerva` / `postgres` / `postgres`).

### 2. API

```bash
cd src/Minerva.Api
dotnet ef database update   # first run only
dotnet run --launch-profile http
```

- API: http://localhost:5000  
- Swagger (dev): http://localhost:5000/swagger  

Optional: set a Google Books API key in `appsettings.Development.json` or user secrets:

```json
"GoogleBooks": { "ApiKey": "your-key" }
```

### 3. Client

```bash
cd src/Minerva.Client
npm install
npm run dev
```

- App: http://localhost:5174  
- `/api` is proxied to the API (see `vite.config.ts`)

## Project structure

```
kcw_minerva/
├── src/
│   ├── Minerva.Api/          # ASP.NET Core API (Carter, MediatR, EF Core)
│   └── Minerva.Client/       # React + Vite + TypeScript + Tailwind
├── docker-compose.yml        # PostgreSQL for local dev
└── docs/                     # Architecture and deployment notes
```

## Features

- Paginated library with search, sort, and status filters
- List and grid views
- Book detail modal with prev/next navigation
- Add / edit books with ISBN lookup (Google Books + Open Library, merged)
- Plain-text summaries (HTML stripped from provider descriptions)
- Dark mode
- Zustand for UI state; no TanStack Query/Table

## API (summary)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/books` | List books (paginated) |
| POST | `/api/books` | Create book |
| PUT | `/api/books/{id}` | Update book |
| DELETE | `/api/books/{id}` | Delete book |
| GET | `/api/books/lookup/{isbn}` | Lookup metadata by ISBN |
| POST | `/api/books/{id}/cover` | Upload cover image |
| DELETE | `/api/books/{id}/cover` | Remove uploaded cover |
| GET | `/api/books/{id}/cover` | Serve or proxy book cover |
| GET | `/api/covers/proxy?url=` | Proxy allowlisted cover URL |

## Tech stack

| Layer | Stack |
|-------|--------|
| API | ASP.NET Core, Carter, MediatR, FluentValidation, EF Core, PostgreSQL |
| Client | React 19, Vite, TypeScript, Tailwind CSS 4, Zustand, React Hook Form, Zod |
| Metadata | Google Books API, Open Library |

## Configuration

Copy `.env.example` for deployment-oriented variable names. Local dev uses:

- `src/Minerva.Api/appsettings.json` — connection string, optional `GoogleBooks:ApiKey`
- Vite proxy in `src/Minerva.Client/vite.config.ts`

Do not commit real secrets. Use environment variables or [.NET user secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) for API keys in development.

## Development commands

```bash
# API
cd src/Minerva.Api && dotnet run
cd src/Minerva.Api && dotnet ef migrations add <Name>
cd src/Minerva.Api && dotnet ef database update

# Client
cd src/Minerva.Client && npm run dev
cd src/Minerva.Client && npm run build
cd src/Minerva.Client && npm run lint
```

## Documentation

- [docs/README.md](docs/README.md) — architecture, setup, features, ADRs
- [CLAUDE.md](CLAUDE.md) — agent/developer guide (sync with `docs/` when changing stack)

## Contributing

1. Branch from `main` (e.g. `feature/your-change`)
2. Keep commits focused; conventional messages appreciated
3. Open a PR with a short summary and test plan

## License

Private / personal project — see repository settings.
