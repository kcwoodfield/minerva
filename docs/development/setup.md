# Development setup

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) matching `src/Minerva.Api/Minerva.Api.csproj` (currently .NET 10)
- [Node.js 20+](https://nodejs.org/) and npm
- [Docker](https://www.docker.com/) for PostgreSQL
- Git

Recommended: VS Code / Cursor with C# Dev Kit and ESLint.

## Clone and install

```bash
git clone https://github.com/kcwoodfield/minerva.git
cd minerva

cd src/Minerva.Client && npm install && cd ../..
```

No root `npm install` is required unless you add workspace scripts later.

## Database

```bash
docker compose up -d
```

| Setting | Value |
|---------|--------|
| Host | `localhost` |
| Port | `5434` |
| Database | `minerva` |
| User / password | `postgres` / `postgres` |

Connection string (already in `appsettings.json`):

```
Host=localhost;Port=5434;Database=minerva;Username=postgres;Password=postgres
```

Apply migrations on first run:

```bash
cd src/Minerva.Api
dotnet ef database update
```

## API

```bash
cd src/Minerva.Api
dotnet run --launch-profile http
```

| Service | URL |
|---------|-----|
| API | http://localhost:5000 |
| Swagger | http://localhost:5000/swagger |

Optional Google Books API key (higher quota):

```bash
dotnet user-secrets set "GoogleBooks:ApiKey" "your-key"
```

Or add to `appsettings.Development.json` (do not commit real keys).

## Client

```bash
cd src/Minerva.Client
npm run dev
```

| Service | URL |
|---------|-----|
| App | http://localhost:5174 |

The dev server proxies `/api/*` to `http://localhost:5000` (see [configuration](configuration.md)).

## Verify

1. Open http://localhost:5174 — library loads without 502 errors.
2. Open http://localhost:5000/swagger — `GET /api/books` returns 200.
3. Add a book via **Add Book** or ISBN lookup.

## Common issues

### 502 on `/api/books`

The Vite proxy cannot reach the API. Ensure `dotnet run` is active on **port 5000** and restart `npm run dev` after changing `vite.config.ts`.

### Database connection errors

Confirm Postgres is up: `docker compose ps`. Port **5434** must be free.

### EF migrations

After pulling schema changes:

```bash
cd src/Minerva.Api && dotnet ef database update
```
