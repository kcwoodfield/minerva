import { format } from 'date-fns';
import { MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  return (
    <div className="bg-card rounded-lg border p-4 flex gap-4">
      {book.coverImageUrl
        ? <img src={book.coverImageUrl} alt={book.title} className="w-16 h-24 object-cover rounded flex-shrink-0" />
        : <div className="w-16 h-24 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">No cover</div>
      }
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold leading-tight truncate">{book.title}</h3>
        <p className="text-sm text-muted-foreground">{book.author}</p>
        <div className="flex gap-1 mt-2 flex-wrap">
          {book.genre && <Badge variant="secondary" className="text-xs">{book.genre}</Badge>}
          {book.format && <Badge variant="outline" className="text-xs">{book.format}</Badge>}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < book.rating ? 'text-yellow-500 text-xs' : 'text-gray-300 text-xs'}>★</span>
            ))}
          </div>
          <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[80px]">
            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${book.completed}%` }} />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{book.completed}%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Added {format(new Date(book.dateAdded), 'MMM d, yyyy')}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="flex-shrink-0 self-start" />}>
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(book)}>Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(book)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
