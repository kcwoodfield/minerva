import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableHead, TableRow } from '@/components/ui/table';
import type { Book } from '../types/library.types';

interface Props {
  book: Book;
  onSelect: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

function CoverCell({ url, title }: { url?: string; title: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={title}
        loading="lazy"
        decoding="async"
        className="object-cover rounded-sm shadow-minerva-cover"
        style={{ width: 36, height: 52, flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      className="m-cover-ph rounded-sm shadow-minerva-cover"
      style={{ width: 36, height: 52, flexShrink: 0 }}
    >
      cover
    </div>
  );
}

function ProgressBar({ completed }: { completed: number }) {
  return (
    <div className="m-prog" style={{ width: 120 }}>
      <div className="m-prog__fill" style={{ width: `${completed}%` }} />
    </div>
  );
}

export function LibraryBookTableHeader() {
  return (
    <TableRow className="border-b border-rule" style={{ background: 'transparent' }}>
      <TableHead className="text-ink-faint" style={{ padding: '10px 16px 14px', background: 'transparent' }} />
      <TableHead className="text-ink-faint" style={{ padding: '10px 16px 14px', background: 'transparent' }}>
        <span className="t-eyebrow">Title</span>
      </TableHead>
      <TableHead className="text-ink-faint" style={{ padding: '10px 16px 14px', background: 'transparent' }}>
        <span className="t-eyebrow">Author</span>
      </TableHead>
      <TableHead className="text-ink-faint" style={{ padding: '10px 16px 14px', background: 'transparent' }}>
        <span className="t-eyebrow">Genre</span>
      </TableHead>
      <TableHead className="text-ink-faint" style={{ padding: '10px 16px 14px', background: 'transparent' }}>
        <span className="t-eyebrow">Status</span>
      </TableHead>
      <TableHead className="text-ink-faint" style={{ padding: '10px 16px 14px', background: 'transparent' }}>
        <span className="t-eyebrow">Rating</span>
      </TableHead>
      <TableHead className="text-ink-faint" style={{ padding: '10px 16px 14px', background: 'transparent' }}>
        <span className="t-eyebrow">Progress</span>
      </TableHead>
      <TableHead className="text-ink-faint" style={{ padding: '10px 16px 14px', background: 'transparent' }}>
        <span className="t-eyebrow">Added</span>
      </TableHead>
      <TableHead className="text-ink-faint" style={{ padding: '10px 16px 14px', background: 'transparent' }} />
    </TableRow>
  );
}

export function LibraryBookRow({ book, onSelect, onEdit, onDelete }: Props) {
  const year = book.publicationDate ? new Date(book.publicationDate).getFullYear() : null;

  return (
    <TableRow
      className="border-b border-rule-soft hover:bg-cream-warm cursor-pointer transition-colors duration-[120ms]"
      onClick={() => onSelect(book)}
    >
      <TableCell style={{ padding: '14px 16px' }}>
        <CoverCell url={book.coverImageUrl} title={book.title} />
      </TableCell>
      <TableCell style={{ padding: '14px 16px' }}>
        <div style={{ maxWidth: 280 }}>
          <div
            className="font-serif text-ink truncate"
            style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}
          >
            {book.title}
          </div>
          {(year || book.pages) && (
            <div className="t-meta truncate" style={{ marginTop: 2 }}>
              {[year, book.pages ? `${book.pages} pp.` : null].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell style={{ padding: '14px 16px' }}>
        <div className="font-serif text-ink-soft truncate" style={{ fontSize: 14, maxWidth: 200 }}>
          {book.author}
        </div>
      </TableCell>
      <TableCell style={{ padding: '14px 16px' }}>
        {book.genre ? (
          <span className="font-serif italic text-ink-mute" style={{ fontSize: 13 }}>{book.genre}</span>
        ) : (
          <span className="text-ink-faint" style={{ fontSize: 13 }}>—</span>
        )}
      </TableCell>
      <TableCell style={{ padding: '14px 16px' }}>
        <StatusBadge completed={book.completed} />
      </TableCell>
      <TableCell style={{ padding: '14px 16px' }}>
        {book.rating > 0 ? (
          <StarRating rating={book.rating} size={14} />
        ) : (
          <span className="text-ink-faint" style={{ fontSize: 13 }}>—</span>
        )}
      </TableCell>
      <TableCell style={{ padding: '14px 16px' }}>
        <div className="flex items-center gap-2">
          <ProgressBar completed={book.completed} />
          <span className="t-meta tabular-nums" style={{ minWidth: 30, textAlign: 'right' }}>
            {book.completed}%
          </span>
        </div>
      </TableCell>
      <TableCell style={{ padding: '14px 16px' }}>
        <div className="t-meta tabular-nums">{format(new Date(book.dateAdded), 'MMM d, yyyy')}</div>
      </TableCell>
      <TableCell style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="h-7 w-7 p-0" />}>
            <MoreHorizontal style={{ width: 15, height: 15 }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(book)}>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(book)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
