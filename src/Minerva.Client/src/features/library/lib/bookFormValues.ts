import { normalizeIsbn } from '@/lib/isbn';
import { formatBookTitle } from './formatBookTitle';
import type { Book, BookMetadata, CreateBookForm } from '../types/library.types';

export function metadataToFormValues(isbn: string, metadata: BookMetadata): Partial<CreateBookForm> {
  const sourceIsbn = isbn || metadata.isbn13 || '';
  const normalized = normalizeIsbn(sourceIsbn);
  const pages = metadata.pageCount && metadata.pageCount > 0 ? metadata.pageCount : 0;

  let publicationDate = '';
  if (metadata.publicationDate) {
    const parsed = new Date(metadata.publicationDate);
    if (!Number.isNaN(parsed.getTime())) {
      publicationDate = String(parsed.getFullYear());
    }
  }

  return {
    title: metadata.title ? formatBookTitle(metadata.title) : '',
    author: metadata.author ?? '',
    isbn13: normalized ?? sourceIsbn.replace(/[^0-9Xx]/g, ''),
    pages,
    rating: 0,
    completed: 0,
    ...(metadata.isbn10 ? { isbn10: metadata.isbn10 } : {}),
    ...(metadata.publisher ? { publisher: metadata.publisher } : {}),
    ...(publicationDate ? { publicationDate } : {}),
    ...(metadata.genre ? { genre: metadata.genre } : {}),
    ...(metadata.description ? { summary: metadata.description } : {}),
    ...(metadata.coverImageUrl ? { coverImageUrl: metadata.coverImageUrl } : {}),
    ...(metadata.series ? { series: metadata.series } : {}),
  };
}

export function bookToFormValues(book: Book): Partial<CreateBookForm> {
  return {
    title: book.title,
    author: book.author,
    isbn13: book.isbn13,
    isbn10: book.isbn10,
    pages: book.pages,
    rating: book.rating,
    review: book.review,
    completed: book.completed,
    publisher: book.publisher,
    publicationDate: book.publicationDate
      ? String(new Date(book.publicationDate).getFullYear())
      : undefined,
    genre: book.genre,
    subGenre: book.subGenre,
    series: book.series,
    isFiction: book.isFiction,
    format: book.format,
    edition: book.edition,
    translator: book.translator,
    summary: book.summary,
    haiku: book.haiku,
    coverImageUrl: book.coverImageUrl,
    archived: book.archived,
  };
}
