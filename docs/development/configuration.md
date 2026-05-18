# Configuration

## Local development defaults

| Component | Setting | Location |
|-----------|---------|----------|
| API port | `5000` | `Properties/launchSettings.json`, `vite.config.ts` proxy |
| Client port | `5174` | `vite.config.ts` |
| Postgres port | `5434` | `docker-compose.yml` |
| API base path | `/api` | Carter endpoints under `/api/books` |
| Client API calls | `/api` (relative) | `src/Minerva.Client/src/lib/api.ts` |

## API (`appsettings.json`)

```json
{
  "GoogleBooks": { "ApiKey": "" },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5434;Database=minerva;Username=postgres;Password=postgres"
  }
}
```

Override in `appsettings.Development.json` or [user secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) for local keys.

## CORS

Development allows `http://localhost:5174` in `Program.cs`. Add production origins via configuration when deploying.

## Client proxy

`vite.config.ts`:

```ts
proxy: {
  '/api': {
    target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:5000',
    changeOrigin: true,
  },
},
```

Override for non-default API port:

```bash
VITE_API_PROXY_TARGET=http://localhost:5266 npm run dev
```

## Deployment templates

See repository root:

- `.env.example` — variable names for hosted environments
- `.env.prod.example` — production template (copy locally; never commit secrets)

Production builds may set `VITE_API_URL` if the client is served separately from the API.
