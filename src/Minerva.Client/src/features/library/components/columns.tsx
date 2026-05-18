import type { ColumnDef } from '@tanstack/react-table';
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
import type { Book } from '../types/library.types';

interface ColumnActions {
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

function CoverCell({ url, title }: { url?: string; title: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={title}
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

export const createColumns = ({ onEdit, onDelete }: ColumnActions): ColumnDef<Book>[] => [
  {
    accessorKey: 'coverImageUrl',
    header: '',
    size: 52,
    cell: ({ row }) => (
      <CoverCell url={row.getValue('coverImageUrl')} title={row.getValue('title')} />
    ),
  },
  {
    accessorKey: 'title',
    header: () => <span className="t-eyebrow">Title</span>,
    cell: ({ row }) => {
      const year = row.original.publicationDate
        ? new Date(row.original.publicationDate).getFullYear()
        : null;
      const pages = row.original.pages;
      return (
        <div style={{ maxWidth: 280 }}>
          <div
            className="font-serif text-ink truncate"
            style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}
          >
            {row.getValue('title')}
          </div>
          {(year || pages) && (
            <div className="t-meta truncate" style={{ marginTop: 2 }}>
              {[year, pages ? `${pages} pp.` : null].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'author',
    header: () => <span className="t-eyebrow">Author</span>,
    cell: ({ row }) => (
      <div className="font-serif text-ink-soft truncate" style={{ fontSize: 14, maxWidth: 200 }}>
        {row.getValue('author')}
      </div>
    ),
  },
  {
    accessorKey: 'genre',
    header: () => <span className="t-eyebrow">Genre</span>,
    cell: ({ row }) => {
      const genre = row.getValue('genre') as string | undefined;
      return genre
        ? <span className="font-serif italic text-ink-mute" style={{ fontSize: 13 }}>{genre}</span>
        : <span className="text-ink-faint" style={{ fontSize: 13 }}>—</span>;
    },
  },
  {
    accessorKey: 'completed',
    header: () => <span className="t-eyebrow">Status</span>,
    cell: ({ row }) => <StatusBadge completed={row.getValue('completed')} />,
  },
  {
    accessorKey: 'rating',
    header: () => <span className="t-eyebrow">Rating</span>,
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number;
      return rating > 0
        ? <StarRating rating={rating} size={14} />
        : <span className="text-ink-faint" style={{ fontSize: 13 }}>—</span>;
    },
  },
  {
    id: 'progress',
    accessorKey: 'completed',
    header: () => <span className="t-eyebrow">Progress</span>,
    cell: ({ row }) => {
      const completed = row.getValue('completed') as number;
      return (
        <div className="flex items-center gap-2">
          <ProgressBar completed={completed} />
          <span className="t-meta tabular-nums" style={{ minWidth: 30, textAlign: 'right' }}>
            {completed}%
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'dateAdded',
    header: () => <span className="t-eyebrow">Added</span>,
    cell: ({ row }) => {
      const date = row.getValue('dateAdded') as string;
      return (
        <div className="t-meta tabular-nums">
          {format(new Date(date), 'MMM d, yyyy')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    size: 40,
    cell: ({ row }) => {
      const book = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="h-7 w-7 p-0" />}>
            <MoreHorizontal style={{ width: 15, height: 15 }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(book)}>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(book)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
