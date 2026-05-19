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

  uploadCover: async (id: string, file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await apiClient.post<{ url: string }>(`/books/${id}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteCover: async (id: string): Promise<void> => {
    await apiClient.delete(`/books/${id}/cover`);
  },

  searchBooks: async (query: string): Promise<BookMetadata[]> => {
    const { data } = await apiClient.get<BookMetadata[]>('/books/search', { params: { q: query } });
    return data;
  },

  generateHaiku: async (input: {
    title: string;
    author: string;
    summary?: string;
  }): Promise<string> => {
    const { data } = await apiClient.post<{ haiku: string }>('/books/generate-haiku', input);
    return data.haiku;
  },

  getStats: async (): Promise<{
    totalBooks: number;
    totalFinished: number;
    totalReading: number;
    totalPagesRead: number;
    averageRating: number;
    booksThisYear: number;
    booksByMonth: { month: string; year: number; count: number }[];
    topGenres: { name: string; count: number }[];
    topAuthors: { name: string; count: number }[];
    fictionCount: number;
    nonFictionCount: number;
  }> => {
    const { data } = await apiClient.get('/books/stats');
    return data;
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
