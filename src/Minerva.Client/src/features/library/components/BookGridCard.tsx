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
          className="flex w-full items-center justify-center overflow-hidden bg-ink/5"
          style={{ aspectRatio: '2/3', maxHeight: 220 }}
        >
          <BookCoverImage
            coverImageUrl={book.coverImageUrl}
            cacheKey={book.timestamp}
            className="h-full w-full object-contain"
            placeholderClassName="flex h-full w-full items-center justify-center"
          />
        </div>
        <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
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
              <DropdownMenuItem onClick={() => onEdit(book)}>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(book)}>
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
