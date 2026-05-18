import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCreateBook } from '../hooks/useLibrary';
import { BookForm } from './BookForm';
import type { CreateBookForm } from '../types/library.types';

export function AddBookDrawer() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateBook();

  const handleSubmit = async (data: CreateBookForm) => {
    await createMutation.mutateAsync(data);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Book</SheetTitle>
        </SheetHeader>
        <BookForm onSubmit={handleSubmit} isPending={createMutation.isPending} />
      </SheetContent>
    </Sheet>
  );
}
