import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { parseIsbnList } from '@/lib/isbn';
import { useCreateBook, useLookupISBN } from '../hooks/useLibrary';
import { metadataToFormValues } from '../lib/bookFormValues';
import { formatBookTitle } from '../lib/formatBookTitle';
import { BookForm } from './BookForm';
import type { CreateBookForm } from '../types/library.types';

type BatchPhase = 'idle' | 'running' | 'done';

type ActiveEntry = {
  isbn: string;
  index: number;
  total: number;
  defaultValues: Partial<CreateBookForm>;
  lookupError?: string;
};

type SkippedEntry = {
  isbn: string;
  title?: string;
  reason?: string;
};

function lookupErrorMessage(err: unknown): string {
  const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
  if (res?.data?.message) return res.data.message;
  if (res?.status === 404) return 'No book found for that ISBN.';
  return 'Lookup failed. You can enter details manually or skip.';
}

export function BulkUploadPage() {
  const [isbnText, setIsbnText] = useState('');
  const [phase, setPhase] = useState<BatchPhase>('idle');
  const [queue, setQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [skippedLog, setSkippedLog] = useState<SkippedEntry[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [activeEntry, setActiveEntry] = useState<ActiveEntry | null>(null);
  const abortRef = useRef(false);

  const lookupMutation = useLookupISBN();
  const createMutation = useCreateBook();

  const resetBatch = useCallback(() => {
    abortRef.current = true;
    setPhase('idle');
    setQueue([]);
    setCurrentIndex(0);
    setSavedCount(0);
    setSkippedCount(0);
    setSkippedLog([]);
    setIsLookingUp(false);
    setActiveEntry(null);
  }, []);

  const advance = useCallback(() => {
    setActiveEntry(null);
    setCurrentIndex((i) => i + 1);
  }, []);

  const runLookup = useCallback(
    async (isbn: string, index: number, total: number) => {
      setIsLookingUp(true);
      try {
        const metadata = await lookupMutation.mutateAsync(isbn);
        setActiveEntry({
          isbn,
          index,
          total,
          defaultValues: metadataToFormValues(isbn, metadata),
        });
      } catch (err) {
        setActiveEntry({
          isbn,
          index,
          total,
          defaultValues: { isbn13: isbn, title: '', author: '', pages: 0, rating: 0, completed: 0 },
          lookupError: lookupErrorMessage(err),
        });
      } finally {
        setIsLookingUp(false);
      }
    },
    [lookupMutation],
  );

  useEffect(() => {
    if (phase !== 'running' || activeEntry || isLookingUp || abortRef.current) return;

    if (currentIndex >= queue.length) {
      setPhase('done');
      return;
    }

    void runLookup(queue[currentIndex], currentIndex, queue.length);
  }, [phase, currentIndex, queue, activeEntry, isLookingUp, runLookup]);

  const handleGo = () => {
    const isbns = parseIsbnList(isbnText);
    if (isbns.length === 0) {
      toast.error('Paste at least one valid ISBN (10 or 13 digits).');
      return;
    }

    abortRef.current = false;
    setQueue(isbns);
    setCurrentIndex(0);
    setSavedCount(0);
    setSkippedCount(0);
    setSkippedLog([]);
    setActiveEntry(null);
    setPhase('running');
  };

  const handleStop = () => {
    resetBatch();
    toast.message('Import stopped.');
  };

  const handleSkip = useCallback(
    (reason?: string) => {
      if (!activeEntry) return;

      const entry: SkippedEntry = {
        isbn: activeEntry.isbn,
        title: activeEntry.defaultValues.title?.trim() || undefined,
        reason: reason ?? activeEntry.lookupError,
      };

      setSkippedLog((log) => [...log, entry]);
      setSkippedCount((n) => n + 1);
      console.info('[bulk-upload] skipped', entry);
      advance();
    },
    [activeEntry, advance],
  );

  const handleSave = async (data: CreateBookForm) => {
    await createMutation.mutateAsync(data);
    setSavedCount((n) => n + 1);
    advance();
  };

  const progressLabel =
    phase === 'running'
      ? activeEntry
        ? `Reviewing ${activeEntry.index + 1} of ${activeEntry.total}`
        : isLookingUp
          ? `Looking up ${currentIndex + 1} of ${queue.length}…`
          : `Preparing ${currentIndex + 1} of ${queue.length}…`
      : phase === 'done'
        ? `Finished — ${savedCount} saved, ${skippedCount} skipped`
        : null;

  const modalOpen = !!activeEntry;
  const title = activeEntry?.defaultValues.title?.trim();

  return (
    <main className="px-4 py-5 md:px-page-x md:py-6">
      <div className="mx-auto max-w-2xl">
        <p className="t-eyebrow" style={{ marginBottom: 6 }}>
          Bulk import
        </p>
        <h2
          className="font-display font-semibold text-ink"
          style={{ fontSize: 28, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 8 }}
        >
          ISBN Uploader
        </h2>
        <p className="font-serif text-ink-mute" style={{ fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
          Paste ISBNs separated by commas, spaces, or new lines. Each volume is looked up via Google Books
          and Open Library, then you review and save in a modal — one at a time.
        </p>

        <label className="font-serif italic text-ink-mute" style={{ display: 'block', fontSize: 13, marginBottom: 8 }}>
          ISBN list
        </label>
        <textarea
          className="w-full rounded-md border border-rule bg-paper font-mono text-ink placeholder:italic placeholder:text-ink-faint focus-visible:border-accent-terracotta focus-visible:outline-none transition-[border-color] duration-[140ms]"
          style={{ minHeight: 200, padding: '12px 14px', fontSize: 14, lineHeight: 1.6, resize: 'vertical' }}
          placeholder="9780140446388, 9780140447934, …"
          value={isbnText}
          onChange={(e) => setIsbnText(e.target.value)}
          disabled={phase === 'running'}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {phase === 'idle' || phase === 'done' ? (
            <Button type="button" onClick={handleGo} disabled={!isbnText.trim()}>
              <Upload className="size-[15px]" />
              Go
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleStop}>
              Stop import
            </Button>
          )}

          {phase === 'done' && (
            <Button type="button" variant="ghost" onClick={() => setPhase('idle')}>
              Import more
            </Button>
          )}

          {progressLabel && (
            <span className="font-serif text-ink-mute tabular-nums" style={{ fontSize: 14 }}>
              {phase === 'running' && isLookingUp && !activeEntry && (
                <Loader2 className="mr-2 inline size-4 animate-spin align-[-2px] text-accent-terracotta" />
              )}
              {progressLabel}
            </span>
          )}
        </div>

        {phase === 'done' && queue.length > 0 && (
          <p className="mt-6 font-serif text-ink-mute" style={{ fontSize: 14 }}>
            Processed {queue.length} ISBN{queue.length === 1 ? '' : 's'}.
          </p>
        )}

        {skippedLog.length > 0 && (
          <section className="mt-8 border border-rule bg-paper" style={{ borderRadius: 8, padding: '16px 18px' }}>
            <p className="t-eyebrow" style={{ marginBottom: 10 }}>
              Skipped ({skippedLog.length})
            </p>
            <ul className="space-y-2 font-mono text-ink" style={{ fontSize: 13, lineHeight: 1.5 }}>
              {skippedLog.map((entry) => (
                <li key={entry.isbn} className="border-b border-rule-soft pb-2 last:border-0 last:pb-0">
                  <span className="tabular-nums">{entry.isbn}</span>
                  {entry.title && (
                    <span className="ml-2 font-serif text-ink-mute">— {formatBookTitle(entry.title)}</span>
                  )}
                  {entry.reason && (
                    <span className="block font-serif italic text-ink-faint" style={{ fontSize: 12, marginTop: 2 }}>
                      {entry.reason}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open && activeEntry) handleSkip('Closed without saving');
        }}
      >
        <DialogContent
          className="max-h-[90vh] max-w-lg overflow-hidden border-rule bg-cream p-0 sm:max-w-xl"
          style={{ display: 'flex', flexDirection: 'column' }}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          {activeEntry && (
            <>
              <div className="border-b border-rule-soft px-6 pb-4 pt-6 pr-12">
                <div className="mb-3 flex items-start justify-between gap-3 pr-2">
                  <p className="t-eyebrow">
                    {activeEntry.index + 1} of {activeEntry.total}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSkip()}
                    disabled={createMutation.isPending}
                  >
                    Skip
                  </Button>
                </div>
                <DialogTitle
                  className="font-display font-semibold text-ink text-left"
                  style={{ fontSize: 22, lineHeight: 1.2, letterSpacing: '-0.01em' }}
                >
                  {title ? formatBookTitle(title) : `ISBN ${activeEntry.isbn}`}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Review looked-up metadata and save or skip this volume
                </DialogDescription>
                {activeEntry.lookupError && (
                  <p
                    className="mt-3 font-serif italic text-accent-terracotta"
                    style={{ fontSize: 14, lineHeight: 1.4 }}
                  >
                    {activeEntry.lookupError}
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <BookForm
                  key={activeEntry.isbn}
                  defaultValues={activeEntry.defaultValues}
                  onSubmit={handleSave}
                  onCancel={() => handleSkip()}
                  cancelLabel="Skip"
                  submitLabel="Save & next"
                  isPending={createMutation.isPending}
                  skipHaikuOnCreate
                  hideLookup
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
