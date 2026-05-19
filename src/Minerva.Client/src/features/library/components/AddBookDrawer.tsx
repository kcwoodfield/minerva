import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCreateBook } from '../hooks/useLibrary';
import { BookForm } from './BookForm';
import type { CreateBookForm } from '../types/library.types';

interface AddBookDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function AddBookDrawer({
  open: openProp,
  onOpenChange,
  showTrigger = true,
}: AddBookDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const createMutation = useCreateBook();

  const handleSubmit = async (data: CreateBookForm) => {
    await createMutation.mutateAsync(data);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button>
            <Plus style={{ width: 15, height: 15 }} />
            Add Book
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="sm:w-[500px]">
        {/* Drawer header */}
        <div style={{ padding: '22px 28px 16px' }}>
          <p className="t-eyebrow" style={{ marginBottom: 6 }}>Add a Volume</p>
          <SheetTitle
            className="font-display font-semibold text-ink"
            style={{ fontSize: 24, lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            Add New Volume
          </SheetTitle>
          <SheetDescription className="sr-only">
            Search by ISBN or title to find a book, or enter details manually.
          </SheetDescription>
        </div>

        <hr className="m-rule mx-0" style={{ margin: '0 28px' }} />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '22px 28px' }}>
          <BookForm onSubmit={handleSubmit} isPending={createMutation.isPending} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
