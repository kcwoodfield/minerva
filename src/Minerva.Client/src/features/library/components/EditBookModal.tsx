import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdateBook } from '../hooks/useLibrary';
import { bookToFormValues } from '../lib/bookFormValues';
import { BookForm } from './BookForm';
import type { Book, CreateBookForm } from '../types/library.types';
import { formatBookTitle } from '../lib/formatBookTitle';

interface Props {
  book: Book | null;
  onClose: () => void;
  onSaved?: (book: Book) => void;
}

export function EditBookModal({ book, onClose, onSaved }: Props) {
  const updateMutation = useUpdateBook();

  const handleSubmit = async (data: CreateBookForm) => {
    if (!book) return;
    const updated = await updateMutation.mutateAsync({ id: book.id, book: data });
    onSaved?.(updated);
    onClose();
  };

  return (
    <Dialog open={!!book} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[90vh] max-w-lg overflow-hidden border-rule bg-cream p-0 sm:max-w-xl"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <div className="border-b border-rule-soft px-6 pb-4 pt-6 pr-12">
          <p className="t-eyebrow" style={{ marginBottom: 6 }}>Edit volume</p>
          <DialogTitle
            className="font-display font-semibold text-ink text-left"
            style={{ fontSize: 22, lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            {book?.title ? formatBookTitle(book.title) : 'Edit book'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Edit book details and save or cancel
          </DialogDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {book && (
            <BookForm
              bookId={book.id}
              cacheKey={book.timestamp}
              defaultValues={bookToFormValues(book)}
              onSubmit={handleSubmit}
              onCancel={onClose}
              submitLabel="Save"
              isPending={updateMutation.isPending}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
