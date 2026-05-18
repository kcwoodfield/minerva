import { z } from 'zod';
import { normalizeIsbn } from '@/lib/isbn';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn13: string;
  isbn10?: string;
  pages: number;
  rating: number;
  review?: string;
  completed: number;
  publisher?: string;
  publicationDate?: string;
  genre?: string;
  subGenre?: string;
  language?: string;
  format?: string;
  edition?: string;
  translator?: string;
  summary?: string;
  tags: string[];
  coverImageUrl?: string;
  coverSourceUrl?: string;
  dateAdded: string;
  timestamp: string;
}

export interface CreateBookDto {
  title: string;
  author: string;
  isbn13: string;
  isbn10?: string;
  pages: number;
  rating?: number;
  review?: string;
  completed?: number;
  publisher?: string;
  publicationDate?: string;
  genre?: string;
  subGenre?: string;
  language?: string;
  format?: string;
  edition?: string;
  translator?: string;
  summary?: string;
  tags?: string[];
  coverImageUrl?: string;
}

export type UpdateBookDto = Partial<CreateBookDto>;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BookMetadata {
  title?: string;
  author?: string;
  publisher?: string;
  publicationDate?: string;
  pageCount?: number;
  description?: string;
  genre?: string;
  language?: string;
  coverImageUrl?: string;
}

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  author: z.string().min(1, 'Author is required').max(300),
  isbn13: z
    .string()
    .min(1, 'ISBN-13 is required')
    .refine((v) => normalizeIsbn(v)?.length === 13, 'Enter a valid 13-digit ISBN (dashes optional)'),
  isbn10: z
    .string()
    .optional()
    .refine(
      (v) => !v?.trim() || normalizeIsbn(v)?.length === 10,
      'Enter a valid 10-digit ISBN (dashes optional)',
    ),
  pages: z.number().min(1, 'Pages must be at least 1'),
  rating: z.number().min(0).max(5),
  review: z.string().optional(),
  completed: z.number().min(0).max(100),
  publisher: z.string().optional(),
  publicationDate: z.string().optional(),
  genre: z.string().optional(),
  subGenre: z.string().optional(),
  language: z.string().optional(),
  format: z.string().optional(),
  edition: z.string().optional(),
  translator: z.string().optional(),
  summary: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

export type CreateBookForm = z.infer<typeof createBookSchema>;
