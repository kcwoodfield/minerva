# Library UI

## Pages

| Page | Route | Component |
|------|-------|-----------|
| Library | `/` | `LibraryTable` + `FilterBar` |
| Insights | `/#insights` | `InsightsPage` |
| Bulk upload | `/upload` | `BulkUploadPage` |

Navigation lives in `AppHeader`. The Settings gear icon holds dark mode and a link to Bulk upload.

## Views

- **List** — table on desktop (`LibraryBookRow`), stacked cards on mobile (`BookCard`).
- **Grid** — cover-forward cards (`BookGridCard`). 2 columns → 6 at `xl`.

Toggle persisted in Zustand (`view`: `list` | `grid`).

## Filters & sort

`FilterBar` drives Zustand state:

- **Status chips** — client-side filter on `completed` (unread / reading / finished)
- **Search** — centered in FilterBar, debounced 300 ms → `GET /api/books?search=...`, ⌘K to focus
- **Sort** — `sortBy` + `ascending` query params (`dateAdded`, `title`, `author`, `rating`, `completed`)
- **View toggle** — list / grid icon buttons

## Book detail modal

Click a row or card (not the ⋯ menu) to open `BookDetailModal`:

- Cover, metadata, haiku or summary, tags, review
- Prev / Next within the current result set (keyboard ← / →, counter shows position)
- ⋯ footer menu → Edit or Delete (delete triggers `DeleteConfirmDialog`)
- `?book=<id>` written to the URL so links are shareable and survive refresh

## Grid card

`BookGridCard` shows cover, title, author, status badge, star rating, and reading progress bar. On finished books with a haiku, hovering (or touching on mobile) reveals the haiku as an overlay on the cover.

## Edit & delete

- **Edit** — `EditBookModal` with `BookForm`; ISBN lookup pre-fills fields; cover upload inline
- **Delete** — `DeleteConfirmDialog` from row/card ⋯ menu or detail modal ⋯ menu
- Row/card ⋯ menu uses `stopPropagation` so it does not open the detail modal

## Add book

`AddBookDrawer` (500 px on sm+): search by title/author or enter an ISBN to pre-fill the form. Duplicate ISBN check fires before submit. If the book is finished, optionally generates an AI haiku.

## Bulk upload

`BulkUploadPage` at `/upload`: paste or upload a list of ISBNs; each is looked up and added in sequence. Previously-added ISBNs are skipped with a log entry.

## Insights page

`InsightsPage` at `/#insights`:

- Hero metric: total pages read
- Stat cards: total volumes, finished, currently reading, average rating, volumes this year
- Monthly bar chart (last 12 months)
- Top genres and top authors (horizontal bar lists)
- Fiction / non-fiction split (segmented bar)

## Theming

- `ThemeProvider` + `next-themes` (`class` strategy on `<html>`)
- Design tokens in `src/Minerva.Client/src/index.css` (cream / ink palette)
- `Logo` — light (`logo.webp`) and dark (`logo-dark.png`) variants
- Dark mode toggled via the `SettingsMenu` gear icon

## State management

`libraryStore` (Zustand + partial persistence):

- Persisted: `pageSize`, `view`
- Ephemeral: filters, sort, page, `listVersion`

Use **selector hooks** in `librarySelectors.ts` with `useShallow` when selecting objects — avoids infinite re-renders.

`listVersion` increments on create/update/delete so `useBooks` refetches.

## Key paths

```
src/Minerva.Client/src/features/library/
├── components/   # LibraryTable, FilterBar, modals, cards, InsightsPage, BulkUploadPage
├── hooks/        # useLibrary.ts (useBooks, useStats, ...)
├── stores/       # libraryStore, librarySelectors
└── api/          # libraryApi.ts
```
