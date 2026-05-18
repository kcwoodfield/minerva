import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { libraryApi } from '../api/libraryApi';
import { useLibraryStore } from '../stores/libraryStore';
import type { Book, CreateBookDto, PaginatedResponse, UpdateBookDto } from '../types/library.types';

export function useBooks(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  ascending?: boolean;
}) {
  const listVersion = useLibraryStore((s) => s.listVersion);
  const [data, setData] = useState<PaginatedResponse<Book> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { page, pageSize, search, sortBy, ascending } = params;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    libraryApi
      .getBooks({ page, pageSize, search, sortBy, ascending })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, search, sortBy, ascending, listVersion]);

  return { data, isLoading, error };
}

export function useCreateBook() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (book: CreateBookDto) => {
    setIsPending(true);
    try {
      const result = await libraryApi.createBook(book);
      toast.success('Book added successfully');
      useLibraryStore.getState().bumpList();
      return result;
    } catch {
      toast.error('Failed to add book');
      throw new Error('Failed to add book');
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}

export function useUpdateBook() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async ({ id, book }: { id: string; book: UpdateBookDto }) => {
    setIsPending(true);
    try {
      const result = await libraryApi.updateBook(id, book);
      toast.success('Book updated successfully');
      useLibraryStore.getState().bumpList();
      return result;
    } catch {
      toast.error('Failed to update book');
      throw new Error('Failed to update book');
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}

export function useDeleteBook() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (id: string) => {
    setIsPending(true);
    try {
      await libraryApi.deleteBook(id);
      toast.success('Book deleted');
      useLibraryStore.getState().bumpList();
    } catch {
      toast.error('Failed to delete book');
      throw new Error('Failed to delete book');
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}

export function useLookupISBN() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (isbn: string) => {
    setIsPending(true);
    try {
      return await libraryApi.lookupByISBN(isbn);
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}
