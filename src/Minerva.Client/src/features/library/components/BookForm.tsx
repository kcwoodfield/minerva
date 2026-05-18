import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Barcode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createBookSchema, type CreateBookForm, type BookMetadata } from '../types/library.types';
import { useLookupISBN } from '../hooks/useLibrary';

interface Props {
  defaultValues?: Partial<CreateBookForm>;
  onSubmit: (data: CreateBookForm) => Promise<void>;
  submitLabel?: string;
  isPending?: boolean;
}

function MLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-serif italic text-ink-mute" style={{ display: 'block', fontSize: 13, marginBottom: 8 }}>
      {children}
    </label>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <MLabel>{label}</MLabel>
      {children}
      {error && (
        <p className="font-serif italic text-accent-terracotta" style={{ fontSize: 13, marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function ISBNLookupCard({
  onUse,
  defaultIsbn,
}: {
  onUse: (isbn: string, metadata: BookMetadata) => void;
  defaultIsbn?: string;
}) {
  const [isbnInput, setIsbnInput] = useState(defaultIsbn ?? '');
  const [result, setResult] = useState<BookMetadata | null>(null);
  const [error, setError] = useState('');
  const lookupMutation = useLookupISBN();

  const handleLookup = async () => {
    if (!isbnInput.trim()) return;
    setError('');
    setResult(null);
    try {
      const metadata = await lookupMutation.mutateAsync(isbnInput.trim());
      setResult(metadata);
    } catch {
      setError('No book found for that ISBN. Try entering details manually.');
    }
  };

  return (
    <div
      className="border border-rule bg-paper"
      style={{ borderRadius: 6, padding: 22 }}
    >
      {/* Card title */}
      <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
        <Barcode style={{ width: 18, height: 18, color: '#6B665C' }} />
        <h3
          className="font-display font-semibold text-ink"
          style={{ fontSize: 17, lineHeight: 1.2 }}
        >
          Look Up by ISBN
        </h3>
      </div>
      <p className="font-serif italic text-ink-mute" style={{ fontSize: 13.5, marginBottom: 14 }}>
        Enter an ISBN-13 to auto-fill book details from Google Books.
      </p>

      {/* Input row */}
      <div className="flex gap-2">
        <Input
          placeholder="9780000000000"
          value={isbnInput}
          onChange={(e) => setIsbnInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          style={{ flex: 1 }}
        />
        <Button onClick={handleLookup} disabled={lookupMutation.isPending}>
          {lookupMutation.isPending
            ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
            : 'Look Up'
          }
        </Button>
      </div>

      {/* Error */}
      {error && (
        <p className="font-serif italic text-accent-terracotta" style={{ fontSize: 13, marginTop: 8 }}>
          {error}
        </p>
      )}

      {/* Result row */}
      {result && (
        <div
          className="flex items-start gap-[14px] bg-cream-warm"
          style={{ borderRadius: 4, padding: 14, marginTop: 14 }}
        >
          {result.coverImageUrl
            ? (
              <img
                src={result.coverImageUrl}
                alt={result.title}
                className="object-cover rounded-sm shadow-minerva-cover flex-shrink-0"
                style={{ width: 48, height: 70 }}
              />
            ) : (
              <div
                className="m-cover-ph rounded-sm flex-shrink-0"
                style={{ width: 48, height: 70 }}
              >
                cover
              </div>
            )
          }
          <div className="flex-1 min-w-0">
            <div className="font-serif text-ink font-medium truncate" style={{ fontSize: 15 }}>
              {result.title}
            </div>
            <div className="font-serif italic text-ink-mute truncate" style={{ fontSize: 13 }}>
              {result.author}
            </div>
            {result.publisher && (
              <div className="t-meta truncate" style={{ marginTop: 4 }}>
                {result.publisher}{result.publicationDate ? ` · ${result.publicationDate}` : ''}
              </div>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onUse(isbnInput, result)}
            className="flex-shrink-0 self-start"
          >
            Use
          </Button>
        </div>
      )}
    </div>
  );
}

export function BookForm({ defaultValues, onSubmit, submitLabel = 'Save Book', isPending }: Props) {
  const [showForm, setShowForm] = useState(!!defaultValues?.title);

  const { register, handleSubmit, reset, getValues, formState: { errors } } = useForm<CreateBookForm>({
    resolver: zodResolver(createBookSchema),
    defaultValues: { title: '', author: '', isbn13: '', pages: 0, rating: 0, completed: 0, ...defaultValues },
  });

  const handleUseMetadata = (isbn: string, metadata: BookMetadata) => {
    reset({
      ...getValues(),
      title:        metadata.title ?? '',
      author:       metadata.author ?? '',
      isbn13:       isbn,
      pages:        metadata.pageCount ?? 0,
      publisher:    metadata.publisher ?? '',
      genre:        metadata.genre ?? '',
      language:     metadata.language ?? '',
      summary:      metadata.description ?? '',
      coverImageUrl:metadata.coverImageUrl ?? '',
    });
    setShowForm(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* ISBN lookup — always shown so user can re-look while editing */}
      {!defaultValues?.title && (
        <ISBNLookupCard
          onUse={handleUseMetadata}
          defaultIsbn={defaultValues?.isbn13}
        />
      )}

      {!showForm && !defaultValues?.title && (
        <Button variant="ghost" className="w-full" onClick={() => setShowForm(true)}>
          Enter details manually
        </Button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              className="w-full rounded-md border border-rule bg-paper font-serif text-ink placeholder:italic placeholder:text-ink-faint focus-visible:border-accent-blue focus-visible:outline-none transition-[border-color] duration-[140ms]"
              style={{ minHeight: 80, padding: '11px 14px', fontSize: 15, resize: 'vertical' }}
              {...register('summary')}
            />
          </Field>

          <Field label="Cover Image URL">
            <Input {...register('coverImageUrl')} />
          </Field>

          {/* Footer actions */}
          <div
            className="flex justify-end gap-3 border-t border-rule-soft"
            style={{ paddingTop: 16, marginTop: 6 }}
          >
            {!defaultValues?.title && (
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Back
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : submitLabel}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
