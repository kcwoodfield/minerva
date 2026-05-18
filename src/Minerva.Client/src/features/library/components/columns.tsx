import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export const createColumns = ({ onEdit, onDelete }: ColumnActions): ColumnDef<Book>[] => [
  {
    accessorKey: 'coverImageUrl',
    header: '',
    cell: ({ row }) => {
      const url = row.getValue('coverImageUrl') as string | undefined;
      return url
        ? <img src={url} alt="Cover" className="h-16 w-10 object-cover rounded" />
        : <div className="h-16 w-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">No cover</div>;
    },
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => <div className="font-medium max-w-xs truncate">{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'author',
    header: 'Author',
    cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue('author')}</div>,
  },
  {
    accessorKey: 'genre',
    header: 'Genre',
    cell: ({ row }) => {
      const genre = row.getValue('genre') as string | undefined;
      return genre ? <Badge variant="secondary">{genre}</Badge> : null;
    },
  },
  {
    accessorKey: 'format',
    header: 'Format',
    cell: ({ row }) => {
      const fmt = row.getValue('format') as string | undefined;
      return fmt ? <Badge variant="outline">{fmt}</Badge> : null;
    },
  },
  {
    accessorKey: 'pages',
    header: 'Pages',
    cell: ({ row }) => <div className="text-right tabular-nums">{row.getValue('pages')}</div>,
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number;
      return (
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'completed',
    header: 'Progress',
    cell: ({ row }) => {
      const completed = row.getValue('completed') as number;
      return (
        <div className="flex items-center gap-2 min-w-[100px]">
          <div className="w-20 bg-muted rounded-full h-2">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${completed}%` }} />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{completed}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'dateAdded',
    header: 'Added',
    cell: ({ row }) => {
      const date = row.getValue('dateAdded') as string;
      return <div className="text-sm tabular-nums">{format(new Date(date), 'MMM d, yyyy')}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const book = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
            <MoreHorizontal className="h-4 w-4" />
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
