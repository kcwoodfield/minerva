import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { libraryApi } from '../api/libraryApi';
import {
  bookNoteTypes,
  createNoteSchema,
  updateNoteSchema,
  type BookNote,
  type BookNoteType,
} from '../types/library.types';

interface Props {
  bookId: string;
}

const TYPE_LABELS: Record<BookNoteType, string> = {
  note: 'Note',
  quote: 'Quote',
  highlight: 'Highlight',
};

function parseOptionalPage(value: string): { page?: number; error?: string } {
  if (!value.trim()) return { page: undefined };
  const page = Number.parseInt(value, 10);
  if (!page || page < 1) return { error: 'Page must be a positive number.' };
  return { page };
}

const noteFieldClass =
  'w-full resize-y rounded-sm border border-rule bg-cream px-3 py-2 font-serif text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-ink/20';

export function BookNotesPanel({ bookId }: Props) {
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editPage, setEditPage] = useState('');
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

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setEditPage('');
  };

  const startEdit = (note: BookNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditPage(note.pageNumber ? String(note.pageNumber) : '');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const { page, error } = parseOptionalPage(pageNumber);
    if (error) {
      toast.error(error);
      return;
    }

    const parsed = createNoteSchema.safeParse({
      type,
      content: content.trim(),
      ...(page ? { pageNumber: page } : {}),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid note.');
      return;
    }

    setSaving(true);
    try {
      const created = await libraryApi.createNote(bookId, parsed.data);
      setNotes((prev) => [...prev, created]);
      setContent('');
      setPageNumber('');
    } catch {
      toast.error('Could not save note.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (noteId: string) => {
    const { page, error } = parseOptionalPage(editPage);
    if (error) {
      toast.error(error);
      return;
    }

    const parsed = updateNoteSchema.safeParse({
      content: editContent.trim(),
      pageNumber: page ?? null,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid note.');
      return;
    }

    setSaving(true);
    try {
      const updated = await libraryApi.updateNote(bookId, noteId, parsed.data);
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      cancelEdit();
    } catch {
      toast.error('Could not update note.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (editingId === noteId) cancelEdit();
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
          {notes.map((note) => {
            const isEditing = editingId === note.id;

            return (
              <li
                key={note.id}
                className="border border-rule-soft rounded-sm bg-paper p-3"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <p className="t-meta">{TYPE_LABELS[note.type]}</p>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      maxLength={10_000}
                      autoFocus
                      className={noteFieldClass}
                      style={{ fontSize: 14, lineHeight: 1.5 }}
                    />
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <label className="t-meta block mb-1" htmlFor={`edit-page-${note.id}`}>
                          Page (optional)
                        </label>
                        <Input
                          id={`edit-page-${note.id}`}
                          type="number"
                          min={1}
                          value={editPage}
                          onChange={(e) => setEditPage(e.target.value)}
                          className="w-24"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          <X className="size-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={saving || !editContent.trim()}
                          onClick={() => void handleSaveEdit(note.id)}
                        >
                          {saving ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
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
                    <div className="flex shrink-0 gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-ink-mute hover:text-ink"
                        aria-label="Edit note"
                        disabled={editingId !== null && !isEditing}
                        onClick={() => startEdit(note)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-ink-mute hover:text-destructive"
                        aria-label="Delete note"
                        disabled={editingId !== null}
                        onClick={() => void handleDelete(note.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={(e) => void handleAdd(e)}
        className="space-y-3 border-t border-rule-soft pt-4"
      >
        <div className="flex flex-wrap gap-2">
          {bookNoteTypes.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              disabled={editingId !== null}
              className={`rounded-sm border px-3 py-1 font-serif text-[13px] transition-colors disabled:opacity-50 ${
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
          disabled={editingId !== null}
          className={noteFieldClass}
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
              disabled={editingId !== null}
              className="w-24"
            />
          </div>
          <Button type="submit" disabled={saving || editingId !== null || !content.trim()}>
            {saving && !editingId ? <Loader2 className="size-4 animate-spin" /> : 'Add note'}
          </Button>
        </div>
      </form>
    </section>
  );
}
