import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createBookSchema, type CreateBookForm } from '../types/library.types';
import { useLookupISBN } from '../hooks/useLibrary';

interface Props {
  defaultValues?: Partial<CreateBookForm>;
  onSubmit: (data: CreateBookForm) => Promise<void>;
  submitLabel?: string;
  isPending?: boolean;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function BookForm({ defaultValues, onSubmit, submitLabel = 'Save Book', isPending }: Props) {
  const [isbnInput, setIsbnInput] = useState(defaultValues?.isbn13 ?? '');
  const [showForm, setShowForm] = useState(!!defaultValues?.title);
  const lookupMutation = useLookupISBN();

  const { register, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm<CreateBookForm>({
    resolver: zodResolver(createBookSchema),
    defaultValues: { title: '', author: '', isbn13: '', pages: 0, rating: 0, completed: 0, ...defaultValues },
  });

  const handleLookup = async () => {
    if (!isbnInput) return;
    try {
      const metadata = await lookupMutation.mutateAsync(isbnInput);
      reset({
        ...getValues(),
        title: metadata.title ?? '',
        author: metadata.author ?? '',
        isbn13: isbnInput,
        pages: metadata.pageCount ?? 0,
        publisher: metadata.publisher ?? '',
        genre: metadata.genre ?? '',
        language: metadata.language ?? '',
        summary: metadata.description ?? '',
        coverImageUrl: metadata.coverImageUrl ?? '',
      });
    } catch {
      setValue('isbn13', isbnInput);
    }
    setShowForm(true);
  };

  if (!showForm) {
    return (
      <div className="space-y-4 mt-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter ISBN-13"
            value={isbnInput}
            onChange={(e) => setIsbnInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
          <Button onClick={handleLookup} disabled={lookupMutation.isPending}>
            <Search className="h-4 w-4 mr-2" />
            {lookupMutation.isPending ? 'Looking…' : 'Lookup'}
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>
          Enter Manually
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <Field label="Title *" error={errors.title?.message}>
        <Input {...register('title')} />
      </Field>

      <Field label="Author *" error={errors.author?.message}>
        <Input {...register('author')} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="ISBN-13 *" error={errors.isbn13?.message}>
          <Input {...register('isbn13')} />
        </Field>
        <Field label="ISBN-10">
          <Input {...register('isbn10')} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Pages *" error={errors.pages?.message}>
          <Input type="number" {...register('pages', { valueAsNumber: true })} />
        </Field>
        <Field label="Rating (0–5)">
          <Input type="number" min={0} max={5} {...register('rating', { valueAsNumber: true })} />
        </Field>
        <Field label="Progress %">
          <Input type="number" min={0} max={100} {...register('completed', { valueAsNumber: true })} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Genre">
          <Input {...register('genre')} />
        </Field>
        <Field label="Format">
          <Input placeholder="Hardcover, Paperback…" {...register('format')} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Publisher">
          <Input {...register('publisher')} />
        </Field>
        <Field label="Language">
          <Input {...register('language')} />
        </Field>
      </div>

      <Field label="Summary">
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register('summary')}
        />
      </Field>

      <Field label="Cover Image URL">
        <Input {...register('coverImageUrl')} />
      </Field>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? 'Saving…' : submitLabel}
        </Button>
        {!defaultValues?.title && (
          <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Back</Button>
        )}
      </div>
    </form>
  );
}
