import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge, getStatus } from '@/components/ui/status-badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Book } from '../types/library.types';

interface Props {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export function BookCard({ book, onEdit, onDelete }: Props) {
  const status = getStatus(book.completed);
  const showProgress = status === 'reading';

  return (
    <div
      className="flex items-start gap-4 border-b border-rule-soft"
      style={{ padding: '16px 18px' }}
    >
      {/* Cover */}
      {book.coverImageUrl
        ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="object-cover rounded-sm shadow-minerva-cover flex-shrink-0"
            style={{ width: 56, height: 84 }}
          />
        ) : (
          <div
            className="m-cover-ph rounded-sm shadow-minerva-cover flex-shrink-0"
            style={{ width: 56, height: 84 }}
          >
            cover
          </div>
        )
      }

      {/* Content */}
      <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h3
          className="font-display font-semibold text-ink leading-tight truncate"
          style={{ fontSize: 16 }}
        >
          {book.title}
        </h3>
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
        <DropdownMenuTrigger render={<Button variant="ghost" className="h-7 w-7 p-0 flex-shrink-0" />}>
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
