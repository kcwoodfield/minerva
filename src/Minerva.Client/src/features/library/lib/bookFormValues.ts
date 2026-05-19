import type { Book, CreateBookForm } from '../types/library.types';

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
