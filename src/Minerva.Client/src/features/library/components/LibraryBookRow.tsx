import { format } from 'date-fns';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from 'lucide-react';
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

function CoverCell({
  bookId,
  url,
  sourceUrl,
  title,
  cacheKey,
}: {
  bookId: string;
  url?: string;
  sourceUrl?: string;
  title: string;
  cacheKey?: string;
}) {
  return (
    <BookCoverImage
      bookId={bookId}
      coverImageUrl={url}
      coverSourceUrl={sourceUrl}
      cacheKey={cacheKey}
      alt={formatBookTitle(title)}
      className="object-cover rounded-sm shadow-minerva-cover"
      placeholderClassName="rounded-sm shadow-minerva-cover"
      style={{ width: 36, height: 52, flexShrink: 0 }}
    />
  );
}

function ProgressBar({ completed }: { completed: number }) {
  return (
    <div className="m-prog" style={{ width: 120 }}>
      <div className="m-prog__fill" style={{ width: `${completed}%` }} />
    </div>
  );
}

const headerCellStyle = { padding: '10px 16px 14px', background: 'transparent' } as const;

function SortableTableHead({
  label,
  field,
  sortBy,
  ascending,
  onSort,
  className,
}: {
  label: string;
  field: string;
  sortBy: string;
  ascending: boolean;
  onSort: (field: string) => void;
  className?: string;
}) {
  const active = sortBy === field;
  const Icon = active ? (ascending ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead className={className} style={headerCellStyle}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 t-eyebrow text-ink-faint hover:text-ink transition-colors duration-[120ms] cursor-pointer"
        aria-sort={active ? (ascending ? 'ascending' : 'descending') : 'none'}
      >
        {label}
        <Icon
          className={active ? 'text-ink' : 'text-ink-faint opacity-50'}
          style={{ width: 12, height: 12, flexShrink: 0 }}
          aria-hidden
        />
      </button>
    </TableHead>
  );
}

export function LibraryBookTableHeader({
  sortBy,
  ascending,
  onSort,
}: {
  sortBy: string;
  ascending: boolean;
  onSort: (field: string) => void;
}) {
  return (
    <TableRow className="border-b border-rule" style={{ background: 'transparent' }}>
      <TableHead className="text-ink-faint" style={headerCellStyle} />
      <SortableTableHead label="Title" field="title" sortBy={sortBy} ascending={ascending} onSort={onSort} />
      <SortableTableHead label="Author" field="author" sortBy={sortBy} ascending={ascending} onSort={onSort} />
      <SortableTableHead label="Genre" field="genre" sortBy={sortBy} ascending={ascending} onSort={onSort} />
      <SortableTableHead label="Pages" field="pages" sortBy={sortBy} ascending={ascending} onSort={onSort} />
      <SortableTableHead label="Status" field="completed" sortBy={sortBy} ascending={ascending} onSort={onSort} />
      <SortableTableHead label="Rating" field="rating" sortBy={sortBy} ascending={ascending} onSort={onSort} />
      <SortableTableHead label="Progress" field="completed" sortBy={sortBy} ascending={ascending} onSort={onSort} />
      <SortableTableHead label="Added" field="dateAdded" sortBy={sortBy} ascending={ascending} onSort={onSort} />
      <TableHead className="text-ink-faint" style={headerCellStyle} />
    </TableRow>
  );
}

export function LibraryBookRow({ book, onSelect, onEdit, onDelete }: Props) {
  return (
    <TableRow
      className="border-b border-rule-soft hover:bg-cream-warm cursor-pointer transition-colors duration-[120ms]"
      onClick={() => onSelect(book)}
    >
      <TableCell style={{ padding: '14px 16px' }}>
        <CoverCell
          bookId={book.id}
          url={book.coverImageUrl}
          sourceUrl={book.coverSourceUrl}
          title={book.title}
          cacheKey={book.timestamp}
        />
      </TableCell>
      <TableCell style={{ padding: '14px 16px' }}>
        <div style={{ maxWidth: 280 }}>
          <BookTitle
            title={book.title}
            as="div"
            className="font-serif text-ink truncate"
            style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}
          />
          <BookPublishedYear publicationDate={book.publicationDate} />
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
        <span className="t-meta tabular-nums">{book.pages > 0 ? book.pages : '—'}</span>
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
