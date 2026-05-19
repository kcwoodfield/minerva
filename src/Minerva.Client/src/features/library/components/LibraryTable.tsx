import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useBooks } from '../hooks/useLibrary';
import {
  useLibraryFilters,
  useLibraryPagination,
  useLibrarySort,
  useLibraryView,
} from '../stores/librarySelectors';
import { getStatus } from '@/components/ui/status-badge';
import { useLibraryStore } from '../stores/libraryStore';
import { LibraryBookRow, LibraryBookTableHeader } from './LibraryBookRow';
import { BookCard } from './BookCard';
import { BookGridCard } from './BookGridCard';
import { BookDetailModal } from './BookDetailModal';
import { EditBookModal } from './EditBookModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { LibraryPagination } from './LibraryPagination';
import type { Book } from '../types/library.types';

const TABLE_COL_COUNT = 10;

function getBookIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('book');
}

function setBookIdInUrl(id: string | null, replace = false) {
  const url = new URL(window.location.href);
  if (id) {
    url.searchParams.set('book', id);
  } else {
    url.searchParams.delete('book');
  }
  if (replace) {
    window.history.replaceState(null, '', url.toString());
  } else {
    window.history.pushState(null, '', url.toString());
  }
}

function EmptyState() {
  return (
    <p className="text-center py-12 font-serif italic text-ink-mute">No books found</p>
  );
}

export function LibraryTable() {
  const filters = useLibraryFilters();
  const { sortBy, ascending } = useLibrarySort();
  const toggleSort = useLibraryStore((s) => s.toggleSort);
  const { page, pageSize } = useLibraryPagination();
  const view = useLibraryView();

  const queryParams = useMemo(
    () => ({ page, pageSize, search: filters.search, sortBy, ascending }),
    [page, pageSize, filters.search, sortBy, ascending],
  );

  const { data, isLoading } = useBooks(queryParams);

  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  const handleEdit = useCallback((book: Book) => setEditingBook(book), []);
  const handleDelete = useCallback((book: Book) => setDeletingBook(book), []);

  const allBooks = data?.items ?? [];
  const books = useMemo(
    () =>
      filters.status
        ? allBooks.filter((b) => getStatus(b.completed) === filters.status)
        : allBooks,
    [allBooks, filters.status],
  );
  const total = data?.total ?? 0;

  // Restore modal from ?book=<id> on initial load
  const restoredFromUrl = useRef(false);
  useEffect(() => {
    if (restoredFromUrl.current || books.length === 0) return;
    restoredFromUrl.current = true;
    const id = getBookIdFromUrl();
    if (!id) return;
    const idx = books.findIndex((b) => b.id === id);
    if (idx >= 0) {
      setDetailIndex(idx);
    } else {
      setBookIdInUrl(null, true);
    }
  }, [books]);

  // Sync modal state when user navigates with browser back/forward
  useEffect(() => {
    const onPop = () => {
      const id = getBookIdFromUrl();
      if (id) {
        const idx = books.findIndex((b) => b.id === id);
        setDetailIndex(idx >= 0 ? idx : null);
      } else {
        setDetailIndex(null);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [books]);

  const openDetail = useCallback(
    (book: Book) => {
      const idx = books.findIndex((b) => b.id === book.id);
      if (idx >= 0) {
        setDetailIndex(idx);
        setBookIdInUrl(book.id);
      }
    },
    [books],
  );

  const closeDetail = useCallback(() => {
    setDetailIndex(null);
    setBookIdInUrl(null);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-px pt-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  const bookList = books.map((book) => (
    <BookCard
      key={book.id}
      book={book}
      onSelect={openDetail}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ));

  const bookGrid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {books.map((book) => (
        <BookGridCard
          key={book.id}
          book={book}
          onSelect={openDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );

  return (
    <>
      {view === 'grid' ? (
        <div className="pt-4">
          {books.length === 0 ? <EmptyState /> : bookGrid}
        </div>
      ) : (
        <>
          <div className="block md:hidden pt-4">
            {books.length === 0 ? <EmptyState /> : bookList}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <LibraryBookTableHeader
                  sortBy={sortBy}
                  ascending={ascending}
                  onSort={toggleSort}
                />
              </TableHeader>
              <TableBody>
                {books.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={TABLE_COL_COUNT}
                      className="text-center py-12 font-serif italic text-ink-mute"
                    >
                      No books found
                    </TableCell>
                  </TableRow>
                ) : (
                  books.map((book) => (
                    <LibraryBookRow
                      key={book.id}
                      book={book}
                      onSelect={openDetail}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <LibraryPagination total={total} />

      <BookDetailModal
        books={books}
        index={detailIndex ?? 0}
        open={detailIndex !== null && books.length > 0}
        onIndexChange={(idx) => {
          setDetailIndex(idx);
          if (books[idx]) setBookIdInUrl(books[idx].id, true);
        }}
        onClose={closeDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditBookModal book={editingBook} onClose={() => setEditingBook(null)} />

      <DeleteConfirmDialog
        book={deletingBook}
        onClose={() => {
          if (deletingBook && detailIndex !== null && books[detailIndex]?.id === deletingBook.id) {
            setDetailIndex(null);
          }
          setDeletingBook(null);
        }}
      />
    </>
  );
}
