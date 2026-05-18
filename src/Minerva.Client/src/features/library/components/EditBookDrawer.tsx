import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Book</SheetTitle>
        </SheetHeader>
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
      </SheetContent>
    </Sheet>
  );
}
