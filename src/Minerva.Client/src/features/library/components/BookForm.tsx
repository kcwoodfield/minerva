import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Barcode, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { normalizeIsbn } from '@/lib/isbn';
import { createBookSchema, type CreateBookForm, type BookMetadata } from '../types/library.types';
import { BookTitle } from './BookTitle';
import { formatBookTitle } from '../lib/formatBookTitle';
import { useLookupISBN } from '../hooks/useLibrary';
import { libraryApi } from '../api/libraryApi';
import { CoverImageUpload } from './CoverImageUpload';
import { HaikuConfirmModal } from './HaikuConfirmModal';

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
  const pages = metadata.pageCount && metadata.pageCount > 0 ? metadata.pageCount : 0;

  let publicationDate = '';
  if (metadata.publicationDate) {
    const parsed = new Date(metadata.publicationDate);
    if (!Number.isNaN(parsed.getTime())) {
      publicationDate = String(parsed.getFullYear());
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
    ...(metadata.series ? { series: metadata.series } : {}),
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
  const lookupMutation = useLookupISBN();

  const isbnInput = isIsbnMode(input);

  useEffect(() => {
    if (isbnInput || !hasMeaningfulWord(input)) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timer = setTimeout(() => {
      libraryApi.searchBooks(input)
        .then(results => { if (!cancelled) setSearchResults(results); })
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
      <div className="flex gap-2">
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
            if (e.key === 'Escape') setSearchResults([]);
          }}
          style={{ flex: 1 }}
        />
        {isbnInput && (
          <Button onClick={handleIsbnLookup} disabled={lookupMutation.isPending}>
            {lookupMutation.isPending
              ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
              : 'Look Up'
            }
          </Button>
        )}
      </div>

      {/* Skeleton rows while searching */}
      {!isbnInput && isSearching && (
        <div className="border border-rule overflow-hidden" style={{ borderRadius: 6, marginTop: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3"
              style={{
                padding: '10px 12px',
                borderBottom: i < 3 ? '1px solid var(--color-rule-soft)' : undefined,
              }}
            >
              <Skeleton className="flex-shrink-0 rounded-sm" style={{ width: 30, height: 44 }} />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search results — inline so overflow-y-auto containers don't clip them */}
      {!isSearching && searchResults.length > 0 && (
        <div className="border border-rule overflow-hidden" style={{ borderRadius: 6, marginTop: 8 }}>
          {searchResults.map((result, i) => (
            <button
              key={i}
              type="button"
              className="flex items-start gap-3 w-full text-left hover:bg-cream-warm transition-colors"
              style={{
                padding: '10px 12px',
                borderBottom: i < searchResults.length - 1 ? '1px solid var(--color-rule-soft)' : undefined,
              }}
              onClick={() => handleSelectResult(result)}
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

function haikuErrorMessage(err: unknown): string {
  const response = (err as { response?: { data?: { message?: string }; status?: number } })?.response;
  if (response?.data?.message) return response.data.message;
  if (response?.status === 503) {
    return 'Haiku generation is not configured on the server. Set HaikuGeneration:Provider to Ollama or Anthropic.';
  }
  return 'Could not generate a haiku. Check that your model is running and try again.';
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
  const [haikuModalOpen, setHaikuModalOpen] = useState(false);
  const [haikuModalMode, setHaikuModalMode] = useState<'create' | 'edit'>('create');
  const [generatedHaiku, setGeneratedHaiku] = useState('');
  const [pendingSubmit, setPendingSubmit] = useState<CreateBookForm | null>(null);
  const [isGeneratingHaiku, setIsGeneratingHaiku] = useState(false);
  const isEditMode = !!bookId || !!defaultValues?.title;

  const { register, handleSubmit, reset, getValues, watch, setValue, clearErrors, formState: { errors } } = useForm<CreateBookForm>({
    resolver: zodResolver(createBookSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: { title: '', author: '', isbn13: '', pages: 0, rating: 0, completed: 0, ...defaultValues },
  });

  const handleFoundMetadata = (isbn: string, metadata: BookMetadata) => {
    reset({
      ...getValues(),
      ...metadataToFormValues(isbn, metadata),
    });
    // clearErrors must run after the resolver's async re-validation cycle
    setTimeout(() => clearErrors('pages'), 0);
    setShowForm(true);
  };

  const requestHaiku = async (title: string, author: string, summary?: string) => {
    setIsGeneratingHaiku(true);
    try {
      const haiku = await libraryApi.generateHaiku({ title, author, summary });
      setGeneratedHaiku(haiku);
      return haiku;
    } finally {
      setIsGeneratingHaiku(false);
    }
  };

  const finalizeSubmit = async (data: CreateBookForm, haiku?: string) => {
    await onSubmit({
      ...data,
      ...(haiku ? { haiku } : {}),
    });
    setHaikuModalOpen(false);
    setPendingSubmit(null);
    setGeneratedHaiku('');
  };

  const handleFormSubmit = async (data: CreateBookForm) => {
    if (isEditMode) {
      await finalizeSubmit(data, data.haiku);
      return;
    }

    setPendingSubmit(data);
    setHaikuModalMode('create');
    setHaikuModalOpen(true);
    try {
      await requestHaiku(data.title, data.author, data.summary);
    } catch (err) {
      setHaikuModalOpen(false);
      setPendingSubmit(null);
      toast.warning('Haiku generation failed — saving book without one.');
      await finalizeSubmit(data);
    }
  };

  const handleGenerateHaikuClick = async () => {
    const values = getValues();
    if (!values.title?.trim() || !values.author?.trim()) {
      toast.error('Enter title and author before generating a haiku.');
      return;
    }

    setPendingSubmit(null);
    setHaikuModalMode('edit');
    setHaikuModalOpen(true);
    try {
      await requestHaiku(values.title, values.author, values.summary);
    } catch (err) {
      setHaikuModalOpen(false);
      toast.error(haikuErrorMessage(err));
    }
  };

  const handleHaikuConfirm = async () => {
    try {
      if (haikuModalMode === 'create' && pendingSubmit) {
        await finalizeSubmit(pendingSubmit, generatedHaiku);
        return;
      }
      setValue('haiku', generatedHaiku, { shouldDirty: true });
      setHaikuModalOpen(false);
      setGeneratedHaiku('');
      toast.success('Haiku added — save to keep it.');
    } catch {
      toast.error('Failed to save book');
    }
  };

  const handleHaikuRegenerate = async () => {
    const source = pendingSubmit ?? getValues();
    try {
      await requestHaiku(source.title, source.author, source.summary);
    } catch (err) {
      toast.error(haikuErrorMessage(err));
    }
  };

  const handleHaikuCancel = () => {
    setHaikuModalOpen(false);
    setPendingSubmit(null);
    setGeneratedHaiku('');
  };

  const handleSaveWithoutHaiku = async () => {
    if (!pendingSubmit) return;
    await finalizeSubmit(pendingSubmit);
  };

  const haikuValue = watch('haiku');

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
            handleFormSubmit({
              ...data,
              isbn13: normalizeIsbn(data.isbn13) ?? data.isbn13,
              isbn10: data.isbn10?.trim()
                ? normalizeIsbn(data.isbn10) ?? data.isbn10
                : undefined,
              publicationDate: data.publicationDate?.trim()
                ? `${data.publicationDate.trim()}-01-01`
                : undefined,
            }),
          )}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {bookId && (
            <CoverImageUpload
              bookId={bookId}
              coverUrl={watch('coverImageUrl')}
              coverSourceUrl={coverSourceUrl}
              cacheKey={cacheKey}
              onCoverChange={(url) => setValue('coverImageUrl', url ?? '', { shouldDirty: true })}
              disabled={isPending}
            />
          )}

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
            <Field label="Pages" error={errors.pages?.message}>
              <Input
                type="number"
                placeholder="e.g. 312"
                value={watch('pages') || ''}
                onChange={(e) => setValue('pages', e.target.valueAsNumber || 0, { shouldDirty: true })}
              />
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
            <Field label="Publication Year" error={errors.publicationDate?.message}>
              <Input
                type="number"
                placeholder="YYYY"
                min={1000}
                max={new Date().getFullYear() + 5}
                {...register('publicationDate')}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Genre">
              <Input {...register('genre')} />
            </Field>
            <Field label="Fiction">
              <select
                className="w-full rounded-md border border-rule bg-paper font-serif text-ink focus-visible:border-accent-blue focus-visible:outline-none transition-[border-color] duration-[140ms]"
                style={{ height: 42, padding: '0 14px', fontSize: 15 }}
                value={watch('isFiction') === true ? 'true' : watch('isFiction') === false ? 'false' : ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setValue('isFiction', v === 'true' ? true : v === 'false' ? false : undefined, { shouldDirty: true });
                }}
              >
                <option value="">Unknown</option>
                <option value="true">Fiction</option>
                <option value="false">Non-Fiction</option>
              </select>
            </Field>
          </div>

          <Field label="Series">
            <Input
              placeholder="Penguin Classics, Oxford World's Classics…"
              list="series-suggestions"
              {...register('series')}
            />
            <datalist id="series-suggestions">
              <option value="Penguin Classics" />
              <option value="Penguin Modern Classics" />
              <option value="Penguin Popular Classics" />
              <option value="Penguin Great Ideas" />
              <option value="Oxford World's Classics" />
              <option value="Everyman's Library" />
              <option value="Library of America" />
              <option value="Modern Library" />
              <option value="New York Review Books Classics" />
              <option value="Vintage Classics" />
              <option value="Signet Classics" />
              <option value="Dover Thrift Editions" />
              <option value="Wordsworth Classics" />
              <option value="Barnes & Noble Classics" />
              <option value="Canongate Classics" />
              <option value="Folio Society" />
              <option value="Pelican Books" />
              <option value="Anchor Books" />
              <option value="Picador" />
              <option value="Harvill Secker" />
            </datalist>
          </Field>

          <Field label="Summary">
            <textarea
              className="w-full rounded-md border border-rule bg-paper font-serif text-ink placeholder:italic placeholder:text-ink-faint focus-visible:border-accent-blue focus-visible:outline-none transition-[border-color] duration-[140ms]"
              style={{ minHeight: 80, padding: '11px 14px', fontSize: 15, resize: 'vertical' }}
              {...register('summary')}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Format">
              <Input placeholder="Hardcover, Paperback…" {...register('format')} />
            </Field>
            <Field label="Edition">
              <Input placeholder="1st, 2nd…" {...register('edition')} />
            </Field>
          </div>

          {haikuValue && (
            <div className="border border-rule-soft bg-cream-warm" style={{ borderRadius: 6, padding: '14px 16px' }}>
              <p className="t-eyebrow" style={{ marginBottom: 8 }}>Haiku</p>
              {haikuValue.split('\n').filter(Boolean).map((line, i) => (
                <p key={i} className="font-serif text-ink" style={{ fontSize: 16, lineHeight: 1.5 }}>
                  {line}
                </p>
              ))}
            </div>
          )}
          <input type="hidden" {...register('haiku')} />

          {/* Footer actions */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-t border-rule-soft"
            style={{ paddingTop: 16, marginTop: 6 }}
          >
            <div>
              {isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateHaikuClick}
                  disabled={isPending || isGeneratingHaiku}
                >
                  {isGeneratingHaiku ? (
                    <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
                  ) : (
                    <Sparkles style={{ width: 15, height: 15 }} />
                  )}
                  Generate haiku
                </Button>
              )}
            </div>
            <div className="flex justify-end gap-3">
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
              <Button type="submit" disabled={isPending || isGeneratingHaiku}>
                {isPending ? 'Saving…' : submitLabel}
              </Button>
            </div>
          </div>
        </form>
      )}

      <HaikuConfirmModal
        open={haikuModalOpen}
        haiku={generatedHaiku}
        isGenerating={isGeneratingHaiku}
        isSaving={isPending}
        mode={haikuModalMode}
        onConfirm={handleHaikuConfirm}
        onRegenerate={handleHaikuRegenerate}
        onCancel={handleHaikuCancel}
        onSaveWithoutHaiku={haikuModalMode === 'create' ? handleSaveWithoutHaiku : undefined}
      />
    </div>
  );
}
