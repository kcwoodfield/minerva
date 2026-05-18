import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useUpdateBook } from '../hooks/useLibrary';
import { BookForm } from './BookForm';
import type { Book, CreateBookForm } from '../types/library.types';

interface Props {
  book: Book | null;
  onClose: () => void;
}

export function EditBookDrawer({ book, onClose }: Props) {
  const updateMutation = useUpdateBook();

  const handleSubmit = async (data: CreateBookForm) => {
    if (!book) return;
    await updateMutation.mutateAsync({ id: book.id, book: data });
    onClose();
  };

  return (
    <Sheet open={!!book} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        {/* Drawer header */}
        <div style={{ padding: '22px 28px 16px' }}>
          <p className="t-eyebrow" style={{ marginBottom: 6 }}>Edit Volume</p>
          <h2
            className="font-display font-semibold text-ink"
            style={{ fontSize: 24, lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            {book?.title ?? 'Edit Book'}
          </h2>
        </div>

        <hr className="m-rule mx-0" style={{ margin: '0 28px' }} />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '22px 28px' }}>
          {book && (
            <BookForm
              defaultValues={{
                title: book.title,
                author: book.author,
                isbn13: book.isbn13,
                isbn10: book.isbn10,
                pages: book.pages,
                rating: book.rating,
                review: book.review,
                completed: book.completed,
                publisher: book.publisher,
                genre: book.genre,
                subGenre: book.subGenre,
                language: book.language,
                format: book.format,
                edition: book.edition,
                translator: book.translator,
                summary: book.summary,
                coverImageUrl: book.coverImageUrl,
              }}
              onSubmit={handleSubmit}
              submitLabel="Update Book"
              isPending={updateMutation.isPending}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
