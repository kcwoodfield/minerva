import { useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge } from '@/components/ui/status-badge';
import type { Book } from '../types/library.types';
import { formatBookTitle } from '../lib/formatBookTitle';
import { BookCoverImage } from './BookCoverImage';

interface Props {
  books: Book[];
  index: number;
  open: boolean;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onEdit: (book: Book) => void;
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  if (children == null || children === '') return null;
  return (
    <div>
      <dt className="t-eyebrow" style={{ marginBottom: 4 }}>{label}</dt>
      <dd className="font-serif text-ink" style={{ fontSize: 15, lineHeight: 1.45 }}>{children}</dd>
    </div>
  );
}

function BookCover({ book }: { book: Book }) {
  return (
    <BookCoverImage
      bookId={book.id}
      coverImageUrl={book.coverImageUrl}
      coverSourceUrl={book.coverSourceUrl}
      cacheKey={book.timestamp}
      className="object-cover rounded-sm shadow-minerva-cover"
      placeholderClassName="rounded-sm shadow-minerva-cover flex items-center justify-center"
      style={{ width: 160, maxWidth: '100%', aspectRatio: '2/3' }}
    />
  );
}

export function BookDetailModal({ books, index, open, onIndexChange, onClose, onEdit }: Props) {
  const book = books[index];
  const hasPrev = index > 0;
  const hasNext = index < books.length - 1;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        onIndexChange(index - 1);
      } else if (e.key === 'ArrowRight' && index < books.length - 1) {
        e.preventDefault();
        onIndexChange(index + 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, index, books.length, onIndexChange]);

  if (!book) return null;

  const pubYear = book.publicationDate
    ? new Date(book.publicationDate).getFullYear()
    : null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-h-[92vh] max-w-3xl overflow-hidden border-rule bg-cream p-0 gap-0 sm:rounded-lg"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <DialogDescription className="sr-only">
          Book details for {formatBookTitle(book.title)}. Use previous and next to browse volumes.
        </DialogDescription>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row gap-6 p-6 pr-12">
            <div className="flex-shrink-0 flex justify-center sm:justify-start self-start">
              <BookCover book={book} />
            </div>

            <div className="flex-1 min-w-0 space-y-5">
              <div>
                <p className="t-eyebrow" style={{ marginBottom: 8 }}>Volume</p>
                <DialogTitle
                  className="font-display font-semibold text-ink text-left"
                  style={{ fontSize: 26, lineHeight: 1.15, letterSpacing: '-0.02em' }}
                >
                  {formatBookTitle(book.title)}
                </DialogTitle>
                <p className="font-serif italic text-ink-mute" style={{ fontSize: 16, marginTop: 6 }}>
                  {book.author}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge completed={book.completed} />
                {book.rating > 0 && <StarRating rating={book.rating} size={16} />}
                {book.completed > 0 && book.completed < 100 && (
                  <span className="t-meta tabular-nums">{book.completed}% read</span>
                )}
              </div>

              {book.haiku ? (
                <div
                  className="border border-rule-soft bg-paper text-center"
                  style={{ borderRadius: 6, padding: '20px 18px' }}
                >
                  <p className="t-eyebrow" style={{ marginBottom: 10 }}>Haiku</p>
                  {book.haiku.split('\n').filter(Boolean).map((line, i) => (
                    <p
                      key={i}
                      className="font-serif text-ink"
                      style={{ fontSize: 17, lineHeight: 1.55, letterSpacing: '0.01em' }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : book.summary ? (
                <div
                  className="overflow-y-auto border-l-2 border-rule pl-4"
                  style={{ maxHeight: 120 }}
                >
                  <p
                    className="font-serif text-ink-soft"
                    style={{ fontSize: 15, lineHeight: 1.55 }}
                  >
                    {book.summary}
                  </p>
                </div>
              ) : null}

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <DetailField label="ISBN-13">{book.isbn13}</DetailField>
                <DetailField label="ISBN-10">{book.isbn10}</DetailField>
                <DetailField label="Publisher">{book.publisher}</DetailField>
                <DetailField label="Published">
                  {pubYear ?? book.publicationDate}
                </DetailField>
                <DetailField label="Genre">
                  {[book.genre, book.subGenre].filter(Boolean).join(' · ') || undefined}
                </DetailField>
                <DetailField label="Format">{book.format}</DetailField>
                <DetailField label="Pages">{book.pages ? `${book.pages} pp.` : undefined}</DetailField>
                <DetailField label="Language">{book.language}</DetailField>
                <DetailField label="Edition">{book.edition}</DetailField>
                <DetailField label="Translator">{book.translator}</DetailField>
                <DetailField label="Added">
                  {format(new Date(book.dateAdded), 'MMMM d, yyyy')}
                </DetailField>
              </dl>

              {book.review && (
                <div>
                  <p className="t-eyebrow" style={{ marginBottom: 6 }}>Review</p>
                  <p className="font-serif text-ink-soft" style={{ fontSize: 15, lineHeight: 1.5 }}>
                    {book.review}
                  </p>
                </div>
              )}

              {book.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-serif italic text-ink-mute border border-rule-soft rounded-sm"
                      style={{ fontSize: 12, padding: '4px 10px' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-rule-soft bg-paper px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onEdit(book)}>
            Edit
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              disabled={!hasPrev}
              onClick={() => onIndexChange(index - 1)}
              aria-label="Previous book"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <span className="t-meta tabular-nums min-w-[4.5rem] text-center">
              {index + 1} / {books.length}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              disabled={!hasNext}
              onClick={() => onIndexChange(index + 1)}
              aria-label="Next book"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
