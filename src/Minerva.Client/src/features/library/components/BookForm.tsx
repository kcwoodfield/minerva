import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Barcode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizeIsbn } from '@/lib/isbn';
import { createBookSchema, type CreateBookForm, type BookMetadata } from '../types/library.types';
import { BookTitle } from './BookTitle';
import { formatBookTitle } from '../lib/formatBookTitle';
import { useLookupISBN } from '../hooks/useLibrary';
import { libraryApi } from '../api/libraryApi';
import { CoverImageUpload } from './CoverImageUpload';

interface Props {
  bookId?: string;
  coverSourceUrl?: string;
  cacheKey?: string;
  defaultValues?: Partial<CreateBookForm>;
  onSubmit: (data: CreateBookForm) => Promise<void>;
  onCancel?: () => void;
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

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were',
]);

function isIsbnMode(value: string): boolean {
  return value.trim().length > 0 && /^[0-9\-\s X]+$/i.test(value);
}

function hasMeaningfulWord(value: string): boolean {
  return value.trim().toLowerCase().split(/\s+/)
    .some(w => w.length >= 2 && !STOP_WORDS.has(w));
}

function metadataToFormValues(isbn: string, metadata: BookMetadata): Partial<CreateBookForm> {
  const sourceIsbn = isbn || metadata.isbn13 || '';
  const normalized = normalizeIsbn(sourceIsbn);
  const pages = metadata.pageCount && metadata.pageCount > 0 ? metadata.pageCount : 1;

  let publicationDate = '';
  if (metadata.publicationDate) {
    const parsed = new Date(metadata.publicationDate);
    if (!Number.isNaN(parsed.getTime())) {
      publicationDate = parsed.toISOString().split('T')[0];
    }
  }

  return {
    title: metadata.title ? formatBookTitle(metadata.title) : '',
    author: metadata.author ?? '',
    isbn13: normalized ?? sourceIsbn.replace(/[^0-9Xx]/g, ''),
    pages,
    rating: 0,
    completed: 0,
    ...(metadata.isbn10 ? { isbn10: metadata.isbn10 } : {}),
    ...(metadata.publisher ? { publisher: metadata.publisher } : {}),
    ...(publicationDate ? { publicationDate } : {}),
    ...(metadata.genre ? { genre: metadata.genre } : {}),
    ...(metadata.language ? { language: metadata.language } : {}),
    ...(metadata.description ? { summary: metadata.description } : {}),
    ...(metadata.coverImageUrl ? { coverImageUrl: metadata.coverImageUrl } : {}),
  };
}

function BookLookupCard({
  onFound,
  defaultIsbn,
}: {
  onFound: (isbn: string, metadata: BookMetadata) => void;
  defaultIsbn?: string;
}) {
  const [input, setInput] = useState(defaultIsbn ?? '');
  const [confirmedResult, setConfirmedResult] = useState<BookMetadata | null>(null);
  const [isbnError, setIsbnError] = useState('');
  const [searchResults, setSearchResults] = useState<BookMetadata[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const lookupMutation = useLookupISBN();

  const isbnInput = isIsbnMode(input);

  useEffect(() => {
    if (isbnInput || !hasMeaningfulWord(input)) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timer = setTimeout(() => {
      libraryApi.searchBooks(input)
        .then(results => {
          if (!cancelled) {
            setSearchResults(results);
            setShowDropdown(results.length > 0);
          }
        })
        .catch(() => { if (!cancelled) setSearchResults([]); })
        .finally(() => { if (!cancelled) setIsSearching(false); });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [input, isbnInput]);

  const handleIsbnLookup = async () => {
    if (!input.trim()) return;
    setIsbnError('');
    setConfirmedResult(null);
    try {
      const metadata = await lookupMutation.mutateAsync(input.trim());
      setConfirmedResult(metadata);
      onFound(normalizeIsbn(input) ?? input.trim(), metadata);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setIsbnError(message ?? 'No book found for that ISBN. Try entering details manually.');
    }
  };

  const handleSelectResult = (result: BookMetadata) => {
    setShowDropdown(false);
    setSearchResults([]);
    setConfirmedResult(result);
    onFound(result.isbn13 ?? result.isbn10 ?? '', result);
  };

  return (
    <div className="border border-rule bg-paper" style={{ borderRadius: 6, padding: 22 }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
        <Barcode className="text-ink-mute" style={{ width: 18, height: 18 }} />
        <h3 className="font-display font-semibold text-ink" style={{ fontSize: 17, lineHeight: 1.2 }}>
          Find a Book
        </h3>
      </div>
      <p className="font-serif italic text-ink-mute" style={{ fontSize: 13.5, marginBottom: 14 }}>
        Enter an ISBN, or search by title or author — results appear as you type.
      </p>

      {/* Input row */}
      <div className="flex gap-2" style={{ position: 'relative' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Input
            autoFocus
            placeholder="ISBN or title / author…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setConfirmedResult(null);
              setIsbnError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isbnInput) handleIsbnLookup();
              if (e.key === 'Escape') setShowDropdown(false);
            }}
            onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />

          {/* Type-ahead dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div
              className="absolute left-0 right-0 bg-paper border border-rule z-50 overflow-y-auto"
              style={{ top: '100%', marginTop: 4, borderRadius: 6, maxHeight: 300, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
            >
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  type="button"
                  className="flex items-start gap-3 w-full text-left hover:bg-cream-warm transition-colors"
                  style={{
                    padding: '10px 12px',
                    borderBottom: i < searchResults.length - 1 ? '1px solid var(--color-rule-soft)' : undefined,
                  }}
                  onMouseDown={(e) => { e.preventDefault(); handleSelectResult(result); }}
                >
                  {result.coverImageUrl ? (
                    <img
                      src={result.coverImageUrl}
                      referrerPolicy="no-referrer"
                      alt=""
                      className="object-cover rounded-sm flex-shrink-0"
                      style={{ width: 30, height: 44 }}
                    />
                  ) : (
                    <div className="m-cover-ph rounded-sm flex-shrink-0" style={{ width: 30, height: 44, fontSize: 9 }}>
                      cover
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-serif font-medium text-ink truncate" style={{ fontSize: 14 }}>
                      {formatBookTitle(result.title ?? '')}
                    </div>
                    <div className="font-serif italic text-ink-mute truncate" style={{ fontSize: 12 }}>
                      {result.author}
                    </div>
                    {(result.publisher || result.publicationDate) && (
                      <div className="t-meta truncate" style={{ marginTop: 2 }}>
                        {[result.publisher, result.publicationDate ? new Date(result.publicationDate).getFullYear() : null]
                          .filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {isbnInput && (
          <Button onClick={handleIsbnLookup} disabled={lookupMutation.isPending}>
            {lookupMutation.isPending
              ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
              : 'Look Up'
            }
          </Button>
        )}
        {!isbnInput && isSearching && (
          <div className="flex items-center px-2">
            <Loader2 style={{ width: 15, height: 15 }} className="animate-spin text-ink-mute" />
          </div>
        )}
      </div>

      {/* ISBN error */}
      {isbnError && (
        <p className="font-serif italic text-accent-terracotta" style={{ fontSize: 13, marginTop: 8 }}>
          {isbnError}
        </p>
      )}

      {/* Confirmed result */}
      {confirmedResult && (
        <div className="flex items-start gap-[14px] bg-cream-warm" style={{ borderRadius: 4, padding: 14, marginTop: 14 }}>
          {confirmedResult.coverImageUrl ? (
            <img
              src={confirmedResult.coverImageUrl}
              referrerPolicy="no-referrer"
              alt={formatBookTitle(confirmedResult.title ?? '')}
              className="object-cover rounded-sm shadow-minerva-cover flex-shrink-0"
              style={{ width: 48, height: 70 }}
            />
          ) : (
            <div className="m-cover-ph rounded-sm flex-shrink-0" style={{ width: 48, height: 70 }}>cover</div>
          )}
          <div className="flex-1 min-w-0">
            <BookTitle
              title={confirmedResult.title ?? ''}
              as="div"
              className="font-serif text-ink font-medium truncate"
              style={{ fontSize: 15 }}
            />
            <div className="font-serif italic text-ink-mute truncate" style={{ fontSize: 13 }}>
              {confirmedResult.author}
            </div>
            {confirmedResult.publisher && (
              <div className="t-meta truncate" style={{ marginTop: 4 }}>
                {confirmedResult.publisher}
                {confirmedResult.publicationDate ? ` · ${confirmedResult.publicationDate}` : ''}
              </div>
            )}
            <p className="font-serif italic text-accent-moss" style={{ fontSize: 12, marginTop: 8 }}>
              Details loaded — review and save below.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function BookForm({
  bookId,
  coverSourceUrl,
  cacheKey,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save Book',
  isPending,
}: Props) {
  const [showForm, setShowForm] = useState(!!defaultValues?.title);

  const { register, handleSubmit, reset, getValues, watch, setValue, formState: { errors } } = useForm<CreateBookForm>({
    resolver: zodResolver(createBookSchema),
    defaultValues: { title: '', author: '', isbn13: '', pages: 0, rating: 0, completed: 0, ...defaultValues },
  });

  const handleFoundMetadata = (isbn: string, metadata: BookMetadata) => {
    reset({
      ...getValues(),
      ...metadataToFormValues(isbn, metadata),
    });
    setShowForm(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* ISBN lookup — always shown so user can re-look while editing */}
      {!defaultValues?.title && (
        <BookLookupCard
          onFound={handleFoundMetadata}
          defaultIsbn={defaultValues?.isbn13}
        />
      )}

      {!showForm && !defaultValues?.title && (
        <Button variant="ghost" className="w-full" onClick={() => setShowForm(true)}>
          Enter details manually
        </Button>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit({
              ...data,
              isbn13: normalizeIsbn(data.isbn13) ?? data.isbn13,
              isbn10: data.isbn10?.trim()
                ? normalizeIsbn(data.isbn10) ?? data.isbn10
                : undefined,
            }),
          )}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
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
            <Field label="Publisher">
              <Input {...register('publisher')} />
            </Field>
            <Field label="Publication Date">
              <Input type="date" {...register('publicationDate')} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Genre">
              <Input {...register('genre')} />
            </Field>
            <Field label="Language">
              <Input {...register('language')} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Format">
              <Input placeholder="Hardcover, Paperback…" {...register('format')} />
            </Field>
            <Field label="Edition">
              <Input placeholder="1st, 2nd…" {...register('edition')} />
            </Field>
          </div>

          <Field label="Summary">
            <textarea
              className="w-full rounded-md border border-rule bg-paper font-serif text-ink placeholder:italic placeholder:text-ink-faint focus-visible:border-accent-blue focus-visible:outline-none transition-[border-color] duration-[140ms]"
              style={{ minHeight: 80, padding: '11px 14px', fontSize: 15, resize: 'vertical' }}
              {...register('summary')}
            />
          </Field>

          {bookId ? (
            <>
              <CoverImageUpload
                bookId={bookId}
                coverUrl={watch('coverImageUrl')}
                coverSourceUrl={coverSourceUrl}
                cacheKey={cacheKey}
                onCoverChange={(url) => setValue('coverImageUrl', url ?? '', { shouldDirty: true })}
                disabled={isPending}
              />
              <Field label="Cover image URL (optional)">
                <Input {...register('coverImageUrl')} placeholder="https://… or leave blank" />
              </Field>
            </>
          ) : (
            <Field label="Cover Image URL">
              <Input {...register('coverImageUrl')} />
            </Field>
          )}

          {/* Footer actions */}
          <div
            className="flex justify-end gap-3 border-t border-rule-soft"
            style={{ paddingTop: 16, marginTop: 6 }}
          >
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
            )}
            {!defaultValues?.title && !onCancel && (
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
