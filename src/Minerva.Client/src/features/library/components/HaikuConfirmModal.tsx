import { Loader2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  haiku: string;
  isGenerating: boolean;
  isSaving?: boolean;
  mode: 'create' | 'edit';
  onConfirm: () => void;
  onRegenerate: () => void;
  onCancel: () => void;
  onSaveWithoutHaiku?: () => void;
}

export function HaikuConfirmModal({
  open,
  haiku,
  isGenerating,
  isSaving,
  mode,
  onConfirm,
  onRegenerate,
  onCancel,
  onSaveWithoutHaiku,
}: Props) {
  const lines = haiku.split('\n').filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isSaving && onCancel()}>
      <DialogContent className="max-w-md border-rule bg-cream">
        <p className="t-eyebrow" style={{ marginBottom: 8 }}>Volume haiku</p>
        <DialogTitle
          className="font-display font-semibold text-ink text-left"
          style={{ fontSize: 22, lineHeight: 1.2, letterSpacing: '-0.01em' }}
        >
          Confirm your haiku
        </DialogTitle>
        <DialogDescription className="font-serif italic text-ink-mute" style={{ fontSize: 14, marginTop: 6 }}>
          {mode === 'create'
            ? 'Save this haiku with your new volume, or try another.'
            : 'Add this haiku to the volume, or try another.'}
        </DialogDescription>

        <div className="flex justify-center" style={{ marginTop: 20 }}>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isSaving || isGenerating}
            className="flex items-center gap-2 font-sans text-sm text-ink-mute bg-transparent border border-transparent rounded px-3 py-1.5 transition-colors hover:border-white hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
            Regenerate
          </button>
        </div>

        <div
          className="border border-rule bg-paper text-center"
          style={{ borderRadius: 6, padding: '28px 24px', marginTop: 12, marginBottom: 20 }}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2 font-serif italic text-ink-mute">
              <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
              Composing…
            </div>
          ) : (
            <div className="space-y-2">
              {lines.map((line, i) => (
                <p
                  key={i}
                  className="font-serif text-ink"
                  style={{ fontSize: 18, lineHeight: 1.5, letterSpacing: '0.01em' }}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving || isGenerating}>
            Cancel
          </Button>
          {mode === 'create' && onSaveWithoutHaiku && (
            <Button
              type="button"
              variant="outline"
              onClick={onSaveWithoutHaiku}
              disabled={isSaving || isGenerating}
            >
              Save without haiku
            </Button>
          )}
          <Button type="button" onClick={onConfirm} disabled={isSaving || isGenerating || !haiku.trim()}>
            {isSaving ? 'Saving…' : mode === 'create' ? 'Save book' : 'Use this haiku'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
