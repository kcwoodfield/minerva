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
    publicationDate: book.publicationDate,
    genre: book.genre,
    subGenre: book.subGenre,
    language: book.language,
    format: book.format,
    edition: book.edition,
    translator: book.translator,
    summary: book.summary,
    coverImageUrl: book.coverImageUrl,
  };
}
