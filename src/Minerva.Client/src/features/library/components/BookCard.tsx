import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge, getStatus } from '@/components/ui/status-badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Book } from '../types/library.types';
import { BookPublishedYear } from './BookPublishedYear';
import { BookTitle } from './BookTitle';
import { formatBookTitle } from '../lib/formatBookTitle';
import { BookCoverImage } from './BookCoverImage';

interface Props {
  book: Book;
  onSelect: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export function BookCard({ book, onSelect, onEdit, onDelete }: Props) {
  const status = getStatus(book.completed);
  const showProgress = status === 'reading';

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-start gap-4 border-b border-rule-soft cursor-pointer hover:bg-cream-warm transition-colors duration-[120ms]"
      style={{ padding: '16px 18px' }}
      onClick={() => onSelect(book)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(book);
        }
      }}
    >
      {/* Cover */}
      <BookCoverImage
        coverImageUrl={book.coverImageUrl}
        cacheKey={book.timestamp}
        alt={formatBookTitle(book.title)}
        className="object-cover rounded-sm shadow-minerva-cover flex-shrink-0"
        placeholderClassName="rounded-sm shadow-minerva-cover flex-shrink-0"
        style={{ width: 56, height: 84 }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <BookTitle
          title={book.title}
          as="h3"
          className="font-display font-semibold text-ink leading-tight truncate"
          style={{ fontSize: 16 }}
        />
        <BookPublishedYear publicationDate={book.publicationDate} className="t-meta truncate" />
        <p className="font-serif italic text-ink-mute truncate" style={{ fontSize: 13.5 }}>
          {book.author}
        </p>

        <div className="flex items-center gap-3" style={{ marginTop: 4 }}>
          <StatusBadge completed={book.completed} />
          {book.rating > 0 && <StarRating rating={book.rating} size={13} />}
        </div>

        {showProgress && (
          <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
            <div className="m-prog" style={{ width: 80 }}>
              <div className="m-prog__fill" style={{ width: `${book.completed}%` }} />
            </div>
            <span className="t-meta tabular-nums">{book.completed}%</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" className="h-7 w-7 p-0 flex-shrink-0" />}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical style={{ width: 15, height: 15 }} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(book)}>Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(book)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
