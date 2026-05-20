# Minerva

Personal book library management: an ASP.NET Core API with a React (Vite) client, PostgreSQL, and ISBN metadata from Google Books and Open Library.

## Quick start

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
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
- List view (table) and grid view (cover cards)
- Book detail modal with prev/next navigation and keyboard shortcuts
- Add / edit books with ISBN lookup (Google Books + Open Library, merged)
- Cover image uploads with fallback to external CDN sources
- AI-generated haiku per finished book (Ollama or Anthropic); hover overlay on grid cards
- Reading notes, quotes, and highlights per book
- Archived books (kept in catalog but excluded from main library)
- Bulk ISBN upload page for adding multiple books at once
- Insights page: reading stats, monthly chart, top genres and authors, fiction split
- Settings menu: dark mode toggle, link to bulk upload
- Duplicate ISBN pre-check before submission

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/books` | List books (paginated, with `search`, `sortBy`, `ascending`, `archived`) |
| POST | `/api/books` | Create book |
| PUT | `/api/books/{id}` | Update book |
| DELETE | `/api/books/{id}` | Delete book |
| GET | `/api/books/lookup/{isbn}` | Lookup metadata by ISBN |
| GET | `/api/books/search` | Search by title/author (`q`) |
| GET | `/api/books/stats` | Reading statistics |
| POST | `/api/books/generate-haiku` | Generate haiku from title + author |
| POST | `/api/books/{id}/cover` | Upload cover image (multipart/form-data) |
| DELETE | `/api/books/{id}/cover` | Remove uploaded cover; reverts to source URL |
| GET | `/api/books/{id}/cover` | Serve local cover or stream allowlisted external URL |
| GET | `/api/books/{id}/notes` | List reading notes |
| POST | `/api/books/{id}/notes` | Create note (`note` \| `quote` \| `highlight`) |
| PUT | `/api/books/{id}/notes/{noteId}` | Update note |
| DELETE | `/api/books/{id}/notes/{noteId}` | Delete note |

## Tech stack

| Layer | Stack |
|-------|-------|
| API | ASP.NET Core (.NET 10), Carter, MediatR, FluentValidation, EF Core, Npgsql, PostgreSQL |
| Client | React 19, Vite, TypeScript, Tailwind CSS 4, Zustand, React Hook Form, Zod |
| Metadata | Google Books API, Open Library |
| AI | Ollama (local) or Anthropic (cloud) for haiku generation |

## Configuration

Copy `.env.example` for deployment-oriented variable names. Local dev uses:

- `src/Minerva.Api/appsettings.json` — connection string, optional `GoogleBooks:ApiKey`
- Vite proxy in `src/Minerva.Client/vite.config.ts`

Do not commit real secrets. Use environment variables or [.NET user secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) for API keys in development.

## Development commands

```bash
# API
cd src/Minerva.Api && dotnet run --launch-profile http
cd src/Minerva.Api && dotnet ef migrations add <Name>
cd src/Minerva.Api && dotnet ef database update

# Client
cd src/Minerva.Client && npm run dev
cd src/Minerva.Client && npm run build
cd src/Minerva.Client && npx tsc -b   # type-check only
```

## Documentation

- [docs/README.md](docs/README.md) — architecture, setup, features, ADRs
- [CLAUDE.md](CLAUDE.md) — agent/developer guide

## License

Private / personal project — see repository settings.
