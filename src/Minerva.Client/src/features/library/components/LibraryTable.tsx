import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useBooks } from '../hooks/useLibrary';
import { useLibraryStore } from '../stores/libraryStore';
import { createColumns } from './columns';
import { BookCard } from './BookCard';
import { EditBookDrawer } from './EditBookDrawer';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { LibraryPagination } from './LibraryPagination';
import type { Book } from '../types/library.types';

export function LibraryTable() {
  const { filters, sortBy, ascending, page, pageSize } = useLibraryStore();
  const { data, isLoading } = useBooks({
    page, pageSize,
    search: filters.search,
    sortBy, ascending,
  });

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  const columns = createColumns({
    onEdit: setEditingBook,
    onDelete: setDeletingBook,
  });

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  const books = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <>
      {/* Mobile card view */}
      <div className="block md:hidden space-y-3">
        {books.length === 0
          ? <p className="text-center py-12 text-muted-foreground">No books found</p>
          : books.map((book) => (
            <BookCard key={book.id} book={book} onEdit={setEditingBook} onDelete={setDeletingBook} />
          ))
        }
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  No books found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LibraryPagination total={total} />

      <EditBookDrawer book={editingBook} onClose={() => setEditingBook(null)} />
      <DeleteConfirmDialog book={deletingBook} onClose={() => setDeletingBook(null)} />
    </>
  );
}
