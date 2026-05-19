import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useRef } from 'react';
import { Barcode, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { normalizeIsbn, isbn10ToIsbn13 } from '@/lib/isbn';
import { createBookSchema, type CreateBookForm, type BookMetadata } from '../types/library.types';
import { BookTitle } from './BookTitle';
import { formatBookTitle } from '../lib/formatBookTitle';
import { formatPublicationYear } from '../lib/formatPublicationYear';
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

function apiErrorMessage(err: unknown, fallback = 'Failed to save book'): string {
  const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
  if (res?.data?.message) return res.data.message;
  if (res?.status === 409) return 'This book already exists in your library.';
  return fallback;
}

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
    ...(metadata.description ? { summary: metadata.description } : {}),
    ...(metadata.coverImageUrl ? { coverImageUrl: metadata.coverImageUrl } : {}),
    ...(metadata.series ? { series: metadata.series } : {}),
  };
}

function Typewriter({ text, speed = 28 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse">▎</span>}
    </span>
  );
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
        Enter an ISBN, or search by title or author. Results appear as you type.
      </p>

      {/* Input row */}
      <div className="flex items-center gap-2">
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
          className="h-[42px] flex-1 py-0"
        />
        {isbnInput && (
          <Button
            className="h-[42px] shrink-0 px-5"
            onClick={handleIsbnLookup}
            disabled={lookupMutation.isPending}
          >
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
                {formatPublicationYear(result.publicationDate) && (
                  <div className="t-meta tabular-nums" style={{ marginTop: 2 }}>
                    {formatPublicationYear(result.publicationDate)}
                  </div>
                )}
                {(result.isbn13?.trim() || result.isbn10?.trim()) && (
                  <div className="t-meta tabular-nums truncate" style={{ marginTop: 2 }}>
                    {result.isbn13?.trim() || result.isbn10?.trim()}
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
                {confirmedResult.publicationDate
                  ? ` · ${new Date(confirmedResult.publicationDate).getFullYear()}`
                  : ''}
              </div>
            )}
            <p className="font-serif italic text-accent-moss" style={{ fontSize: 12, marginTop: 8 }}>
              <Typewriter key={confirmedResult?.title} text="Details loaded. Please review and save below." />
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
    defaultValues: { title: '', author: '', isbn13: '', pages: 0, rating: 0, completed: 0, archived: false, ...defaultValues },
  });

  const { onBlur: isbn13RhfBlur, ...isbn13Register } = register('isbn13');

  const pendingReset = useRef<Partial<CreateBookForm> | null>(null);

  const handleFoundMetadata = (isbn: string, metadata: BookMetadata) => {
    pendingReset.current = { ...getValues(), ...metadataToFormValues(isbn, metadata) };
    setShowForm(true);
  };

  useEffect(() => {
    if (showForm && pendingReset.current) {
      reset(pendingReset.current);
      pendingReset.current = null;
      setTimeout(() => clearErrors('pages'), 0);
    }
  }, [showForm]);

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
    if (!isEditMode && data.isbn13) {
      try {
        const existing = await libraryApi.getBooks({ search: data.isbn13, pageSize: 5 });
        const duplicate = existing.items.find(
          (b) => normalizeIsbn(b.isbn13 ?? '') === data.isbn13,
        );
        if (duplicate) {
          setHaikuModalOpen(false);
          setPendingSubmit(null);
          setGeneratedHaiku('');
          toast.error('This book already exists in your library.');
          return;
        }
      } catch {
        // check failed — let the API handle it
      }
    }
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
      try {
        await finalizeSubmit(data, data.haiku);
      } catch (err) {
        toast.error(apiErrorMessage(err));
      }
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
      try {
        await finalizeSubmit(data);
      } catch (saveErr) {
        toast.error(apiErrorMessage(saveErr));
      }
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
    } catch (err) {
      toast.error(apiErrorMessage(err));
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
              <Input
                {...isbn13Register}
                onBlur={(e) => {
                  isbn13RhfBlur(e);
                  const val = e.target.value.trim();
                  const normalized = normalizeIsbn(val);
                  if (normalized?.length === 10) {
                    const converted = isbn10ToIsbn13(normalized);
                    if (converted) setValue('isbn13', converted, { shouldValidate: true });
                  }
                }}
              />
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
            <Field label={`Progress — ${watch('completed') ?? 0}%`}>
              <input
                type="range"
                min={0}
                max={100}
                step={25}
                value={watch('completed') ?? 0}
                onChange={(e) => setValue('completed', Number(e.target.value), { shouldValidate: false })}
                className="w-full accent-accent"
                style={{ height: 36 }}
              />
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
              <Input placeholder="e.g. Mystery, Self-Help" {...register('genre')} />
            </Field>
            <Field label="Fiction / Non-Fiction">
              <select
                className="w-full rounded-md border border-rule bg-paper font-serif text-ink focus-visible:border-accent-blue focus-visible:outline-none transition-[border-color] duration-[140ms]"
                style={{ height: 42, padding: '0 14px', fontSize: 15 }}
                value={watch('isFiction') === true ? 'true' : watch('isFiction') === false ? 'false' : ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setValue('isFiction', v === 'true' ? true : v === 'false' ? false : undefined, { shouldDirty: true });
                }}
              >
                <option value="">—</option>
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

          <Field label="Summary">
            <textarea
              className="w-full rounded-md border border-rule bg-paper font-serif text-ink placeholder:italic placeholder:text-ink-faint focus-visible:border-accent-blue focus-visible:outline-none transition-[border-color] duration-[140ms]"
              style={{ minHeight: 160, padding: '11px 14px', fontSize: 15, resize: 'vertical' }}
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

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 accent-accent"
              checked={watch('archived') === true}
              onChange={(e) => setValue('archived', e.target.checked, { shouldDirty: true })}
            />
            <span>
              <span className="font-serif text-ink" style={{ fontSize: 15 }}>Archived</span>
              <span className="block t-meta" style={{ marginTop: 2 }}>
                No longer in your collection (sold, donated, given away) but keep the record.
              </span>
            </span>
          </label>

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
