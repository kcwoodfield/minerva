import { apiClient } from '@/lib/api';
import type { Book, BookMetadata, CreateBookDto, PaginatedResponse, UpdateBookDto } from '../types/library.types';

export const libraryApi = {
  getBooks: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    ascending?: boolean;
  }): Promise<PaginatedResponse<Book>> => {
    const { data } = await apiClient.get('/books', { params });
    return data;
  },

  getBook: async (id: string): Promise<Book> => {
    const { data } = await apiClient.get(`/books/${id}`);
    return data;
  },

  createBook: async (book: CreateBookDto): Promise<Book> => {
    const { data } = await apiClient.post('/books', book);
    return data;
  },

  updateBook: async (id: string, book: UpdateBookDto): Promise<Book> => {
    const { data } = await apiClient.put(`/books/${id}`, book);
    return data;
  },

  deleteBook: async (id: string): Promise<void> => {
    await apiClient.delete(`/books/${id}`);
  },

  lookupByISBN: async (isbn: string): Promise<BookMetadata> => {
    const { data } = await apiClient.get(`/books/lookup/${isbn}`);
    return data;
  },
};
