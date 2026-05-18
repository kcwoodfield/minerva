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
