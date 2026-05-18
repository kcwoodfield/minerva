import { apiClient } from '@/lib/api';
import { normalizeIsbn } from '@/lib/isbn';
import { sanitizeBookPayload } from '@/lib/sanitize-book-payload';
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
    const { data } = await apiClient.post('/books', sanitizeBookPayload(book));
    return data;
  },

  updateBook: async (id: string, book: UpdateBookDto): Promise<Book> => {
    const { data } = await apiClient.put(`/books/${id}`, sanitizeBookPayload(book));
    return data;
  },

  deleteBook: async (id: string): Promise<void> => {
    await apiClient.delete(`/books/${id}`);
  },

  lookupByISBN: async (isbn: string): Promise<BookMetadata> => {
    const normalized = normalizeIsbn(isbn);
    if (!normalized) {
      throw Object.assign(new Error('Invalid ISBN'), {
        response: { status: 400, data: { message: 'Invalid ISBN. Enter 10 or 13 digits.' } },
      });
    }
    const { data } = await apiClient.get(`/books/lookup/${normalized}`);
    return data;
  },
};
