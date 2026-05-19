import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { libraryApi } from '../api/libraryApi';
import { bookNoteTypes, type BookNote, type BookNoteType } from '../types/library.types';

interface Props {
  bookId: string;
}

const TYPE_LABELS: Record<BookNoteType, string> = {
  note: 'Note',
  quote: 'Quote',
  highlight: 'Highlight',
};

export function BookNotesPanel({ bookId }: Props) {
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<BookNoteType>('note');
  const [content, setContent] = useState('');
  const [pageNumber, setPageNumber] = useState('');

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await libraryApi.getNotes(bookId);
      setNotes(data);
    } catch {
      toast.error('Could not load notes for this volume.');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    const page = pageNumber.trim() ? Number.parseInt(pageNumber, 10) : undefined;
    if (pageNumber.trim() && (!page || page < 1)) {
      toast.error('Page must be a positive number.');
      return;
    }

    setSaving(true);
    try {
      const created = await libraryApi.createNote(bookId, {
        type,
        content: trimmed,
        ...(page ? { pageNumber: page } : {}),
      });
      setNotes((prev) => [...prev, created]);
      setContent('');
      setPageNumber('');
    } catch {
      toast.error('Could not save note.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await libraryApi.deleteNote(bookId, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      toast.error('Could not delete note.');
    }
  };

  return (
    <section className="space-y-4">
      <p className="t-eyebrow">Notes &amp; excerpts</p>

      {loading ? (
        <div className="flex items-center gap-2 text-ink-mute">
          <Loader2 className="size-4 animate-spin" />
          <span className="t-meta">Loading notes…</span>
        </div>
      ) : notes.length === 0 ? (
        <p className="font-serif italic text-ink-mute" style={{ fontSize: 14 }}>
          No notes yet for this volume.
        </p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="border border-rule-soft rounded-sm bg-paper p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="t-meta">
                    {TYPE_LABELS[note.type]}
                    {note.pageNumber ? ` · p. ${note.pageNumber}` : ''}
                    {' · '}
                    {format(new Date(note.createdAt), 'MMM d, yyyy')}
                  </p>
                  <p
                    className="font-serif text-ink-soft whitespace-pre-wrap"
                    style={{ fontSize: 14, lineHeight: 1.5 }}
                  >
                    {note.content}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-ink-mute hover:text-destructive"
                  aria-label="Delete note"
                  onClick={() => void handleDelete(note.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={(e) => void handleAdd(e)} className="space-y-3 border-t border-rule-soft pt-4">
        <div className="flex flex-wrap gap-2">
          {bookNoteTypes.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`rounded-sm border px-3 py-1 font-serif text-[13px] transition-colors ${
                type === value
                  ? 'border-ink bg-ink text-cream'
                  : 'border-rule-soft text-ink-mute hover:border-rule'
              }`}
            >
              {TYPE_LABELS[value]}
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note, quote, or highlight…"
          rows={3}
          maxLength={10_000}
          className="w-full resize-y rounded-sm border border-rule bg-cream px-3 py-2 font-serif text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-ink/20"
          style={{ fontSize: 14, lineHeight: 1.5 }}
        />

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="t-meta block mb-1" htmlFor={`note-page-${bookId}`}>
              Page (optional)
            </label>
            <Input
              id={`note-page-${bookId}`}
              type="number"
              min={1}
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              className="w-24"
            />
          </div>
          <Button type="submit" disabled={saving || !content.trim()}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : 'Add note'}
          </Button>
        </div>
      </form>
    </section>
  );
}
