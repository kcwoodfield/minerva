import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Book } from '../types/library.types';
import { formatBookTitle } from '../lib/formatBookTitle';
import { useDeleteBook } from '../hooks/useLibrary';

interface Props {
  book: Book | null;
  onClose: () => void;
}

export function DeleteConfirmDialog({ book, onClose }: Props) {
  const deleteMutation = useDeleteBook();

  const handleConfirm = async () => {
    if (!book) return;
    await deleteMutation.mutateAsync(book.id);
    onClose();
  };

  return (
    <Dialog open={!!book} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Book</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{book?.title ? formatBookTitle(book.title) : ''}</strong>? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleteMutation.isPending}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
