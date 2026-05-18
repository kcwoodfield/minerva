# ISBN lookup

## Endpoint

`GET /api/books/lookup/{isbn}`

The path segment should be **digits only** (normalization happens on the client before the request). Dashes in the UI are accepted and stripped.

## Providers

| Provider | Role |
|----------|------|
| **Google Books** | Primary; `volumeInfo.description` and rich metadata |
| **Open Library** | Fallback and gap-fill; work-level descriptions |

`CompositeBookLookupService` queries both **in parallel** and merges with `BookMetadataMerger` (Google wins when both have a value).

## Open Library enrichment

When edition JSON includes `works[].key`, the API fetches `/works/{id}.json` for:

- `description` (string or `{ value: "..." }`)
- `first_sentence` as fallback

Search results may also supply `first_sentence` before work fetch.

## Description sanitization

`DescriptionSanitizer`:

1. HTML-decode entities
2. Strip tags
3. Collapse whitespace
4. Cap at 8,000 characters

Applied to Google descriptions and all Open Library text before returning `BookMetadata.Description`.

## Client mapping

`BookForm` maps lookup response → form:

- `description` → `summary`
- Cover, title, author, publisher, etc. as available

On success, the add-book form expands with prefilled fields.

## Configuration

Optional `GoogleBooks:ApiKey` in API configuration improves quota. Without a key, Open Library still supplies most fields; summaries may be sparser.

## Timeouts

| Setting | Default | Purpose |
|---------|---------|---------|
| `BookLookup:RequestTimeoutSeconds` | 8 | Per HTTP call to Google Books or Open Library |
| `BookLookup:OverallTimeoutSeconds` | 25 | Entire lookup (parallel providers + Open Library fallbacks) |

Open Library strategies (search, books API, `isbn.json`) run **in parallel** per ISBN variant; the first hit wins. If the overall budget is exceeded, the API returns **504** with a retry message instead of waiting ~70s and returning 404.

## Implementation files

```
src/Minerva.Api/Features/Books/Services/
├── GoogleBooksService.cs
├── OpenLibraryBooksService.cs
├── CompositeBookLookupService.cs
├── BookMetadataMerger.cs
├── DescriptionSanitizer.cs
└── IsbnHelper.cs
```
