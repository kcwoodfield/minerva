import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { libraryApi } from '../api/libraryApi';
import type { CreateBookDto, UpdateBookDto } from '../types/library.types';

export const useBooks = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  ascending?: boolean;
}) => useQuery({
  queryKey: ['books', params],
  queryFn: () => libraryApi.getBooks(params),
});

export const useBook = (id: string) => useQuery({
  queryKey: ['book', id],
  queryFn: () => libraryApi.getBook(id),
  enabled: !!id,
});

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (book: CreateBookDto) => libraryApi.createBook(book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book added successfully');
    },
    onError: () => toast.error('Failed to add book'),
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, book }: { id: string; book: UpdateBookDto }) =>
      libraryApi.updateBook(id, book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book updated successfully');
    },
    onError: () => toast.error('Failed to update book'),
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => libraryApi.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book deleted');
    },
    onError: () => toast.error('Failed to delete book'),
  });
};

export const useLookupISBN = () => useMutation({
  mutationFn: (isbn: string) => libraryApi.lookupByISBN(isbn),
});
