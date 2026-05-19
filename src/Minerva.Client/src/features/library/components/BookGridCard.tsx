import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge, getStatus } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Book } from '../types/library.types';
import { BookPublishedYear } from './BookPublishedYear';
import { BookTitle } from './BookTitle';
import { BookCoverImage } from './BookCoverImage';

interface Props {
  book: Book;
  onSelect: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export function BookGridCard({ book, onSelect, onEdit, onDelete }: Props) {
  const showProgress = getStatus(book.completed) === 'reading';

  return (
    <article
      role="button"
      tabIndex={0}
      className="group relative flex flex-col rounded-md border border-rule-soft bg-paper shadow-minerva-1 overflow-hidden cursor-pointer transition-shadow duration-[140ms] hover:shadow-minerva-2"
      onClick={() => onSelect(book)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(book);
        }
      }}
    >
      <div className="relative">
        <div
          className="relative flex w-full items-center justify-center overflow-hidden bg-ink/5"
          style={{ aspectRatio: '2/3', maxHeight: 220 }}
        >
          <BookCoverImage
            bookId={book.id}
            coverImageUrl={book.coverImageUrl}
            coverSourceUrl={book.coverSourceUrl}
            cacheKey={book.timestamp}
            className="max-h-full w-[85%] object-contain translate-y-[5%] group-hover:translate-y-0 transition-transform duration-[420ms] ease-in-out"
            placeholderClassName="flex h-full w-full items-center justify-center"
          />
          {book.completed === 100 && book.haiku && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 bg-ink/82 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 pointer-events-none">
              {book.haiku.split('\n').filter(Boolean).map((line, i) => (
                <p
                  key={i}
                  className="font-serif italic text-cream text-center leading-snug"
                  style={{ fontSize: 11 }}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
        <div
          className="absolute top-2 right-2"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-paper/90 backdrop-blur-sm shadow-minerva-1"
                />
              }
            >
              <MoreVertical className="size-[15px]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(book)}>Edit</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(book)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <BookTitle
          title={book.title}
          as="h3"
          className="font-display font-semibold text-ink leading-snug line-clamp-2 text-[15px]"
        />
        <BookPublishedYear publicationDate={book.publicationDate} className="t-meta line-clamp-1" />
        <p className="font-serif italic text-ink-mute text-[13px] line-clamp-1">{book.author}</p>
        <div className="flex items-center gap-2 flex-wrap mt-auto">
          <StatusBadge completed={book.completed} />
          {book.rating > 0 && <StarRating rating={book.rating} size={12} />}
        </div>
        {showProgress && (
          <div className="flex items-center gap-2">
            <div className="m-prog flex-1">
              <div className="m-prog__fill" style={{ width: `${book.completed}%` }} />
            </div>
            <span className="t-meta tabular-nums">{book.completed}%</span>
          </div>
        )}
      </div>
    </article>
  );
}
