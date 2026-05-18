# Library UI

## Views

- **List** — table on desktop (`LibraryBookRow`), stacked cards on mobile (`BookCard`).
- **Grid** — cover-forward cards (`BookGridCard`).

Toggle persisted in Zustand (`view`: `list` | `grid`).

## Filters & sort

`FilterBar` drives Zustand state:

- **Search** — debounced 300ms → `GET /api/books?search=...`
- **Status chips** — client-side filter on `completed` (reading / finished / unread)
- **Sort** — `sortBy` + `ascending` query params (`dateAdded`, `title`, `author`, `rating`, `completed`)

## Book detail modal

Click a row or card (not the ⋮ menu) to open `BookDetailModal`:

- Cover, metadata, summary, tags
- **Prev / Next** within the current result set (keyboard ← / →)
- **Edit** opens `EditBookModal` on top

## Edit & delete

- **Edit** — `EditBookModal` with `BookForm`, Save / Cancel
- **Delete** — `DeleteConfirmDialog` from row menu
- Row menu uses `stopPropagation` so it does not open the detail modal

## Theming

- `ThemeProvider` + `next-themes` (`class` strategy on `<html>`)
- Design tokens in `src/Minerva.Client/src/index.css` (cream / ink palette)
- `Logo` — light (`logo.webp`) and dark (`logo-dark.png`) variants

## State management

`libraryStore` (Zustand + persist partial state):

- Persisted: `pageSize`, `view`, `columnVisibility`
- Ephemeral: filters, sort, page, selection, `listVersion`

Use **selector hooks** in `librarySelectors.ts` with `useShallow` when selecting objects — avoids infinite re-renders.

`listVersion` increments on create/update/delete so `useBooks` refetches.

## Key paths

```
src/Minerva.Client/src/features/library/
├── components/   # LibraryTable, FilterBar, modals, cards
├── hooks/        # useLibrary.ts
├── stores/       # libraryStore, librarySelectors
└── api/          # libraryApi.ts
```
