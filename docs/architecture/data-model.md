# Data model

## `Book` (database & API)

Defined in `src/Minerva.Api/Features/Books/Book.cs` and exposed as `BookDto` / client `Book` type.

| Field | Type | Notes |
|-------|------|--------|
| `Id` | `Guid` | Primary key |
| `Title` | string | Required |
| `Author` | string | Required |
| `Isbn13` | string | Required, normalized on write |
| `Isbn10` | string? | Optional |
| `Pages` | int | Required, ≥ 1 |
| `Rating` | int | 0–5 |
| `Review` | string? | User review text |
| `Completed` | int | Progress 0–100; drives status UI |
| `Publisher` | string? | |
| `PublicationDate` | DateTime? | |
| `Genre` / `SubGenre` | string? | |
| `Language` / `Format` / `Edition` / `Translator` | string? | |
| `Summary` | string? | Plain text; often from ISBN lookup |
| `Haiku` | string? | Optional AI-generated haiku (Ollama or Anthropic) |
| `Tags` | string[] | JSON column |
| `CoverImageUrl` | string? | Current cover; managed upload path or external URL |
| `CoverSourceUrl` | string? | Original external URL from ISBN lookup; preserved when a file is uploaded so the upload can be reverted |
| `DateAdded` | DateTime | Set on create |
| `Timestamp` | DateTime | Updated on save |

## Reading status (UI only)

Not stored separately. Derived from `Completed`:

| `Completed` | Status |
|-------------|--------|
| `0` | Unread |
| `1–99` | Reading |
| `100` | Finished |

## `BookNote`

Defined in `src/Minerva.Api/Features/Notes/BookNote.cs`. Child of `Book` with cascade delete.

| Field | Type | Notes |
|-------|------|--------|
| `Id` | `Guid` | Primary key |
| `BookId` | `Guid` | FK → `Book` |
| `Type` | string | `note`, `quote`, or `highlight` |
| `Content` | string | Required, max 10 000 chars |
| `PageNumber` | int? | Optional, &gt; 0 when set |
| `CreatedAt` | DateTime | UTC, set on create |

## ISBN lookup metadata

`BookMetadata` (lookup response only) maps to form fields on the client; `description` → `summary` after sanitization.

## Migrations

EF Core migrations live in `src/Minerva.Api/Migrations/`. Apply with:

```bash
cd src/Minerva.Api && dotnet ef database update
```
