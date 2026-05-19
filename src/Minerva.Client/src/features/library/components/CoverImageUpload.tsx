import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteCover, useUploadCover } from '../hooks/useLibrary';
import { isLocalCoverUrl, resolveCoverDisplaySrc } from '../lib/resolveCoverSrc';

interface Props {
  bookId: string;
  coverUrl?: string;
  coverSourceUrl?: string;
  cacheKey?: string;
  onCoverChange: (url: string | undefined) => void;
  disabled?: boolean;
}

export function CoverImageUpload({
  bookId,
  coverUrl,
  coverSourceUrl,
  cacheKey,
  onCoverChange,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [coverVersion, setCoverVersion] = useState(cacheKey);
  const uploadMutation = useUploadCover();
  const deleteMutation = useDeleteCover();

  useEffect(() => {
    setCoverVersion(cacheKey);
  }, [cacheKey]);

  const displaySrc =
    localPreview
    ?? resolveCoverDisplaySrc(bookId, coverUrl, coverSourceUrl, coverVersion);

  const isUploaded = isLocalCoverUrl(coverUrl);
  const busy = uploadMutation.isPending || deleteMutation.isPending;

  const handleFile = async (file: File) => {
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    try {
      const { url } = await uploadMutation.mutateAsync({ id: bookId, file });
      onCoverChange(url);
      setCoverVersion(String(Date.now()));
    } catch {
      setLocalPreview(null);
    } finally {
      URL.revokeObjectURL(preview);
      setLocalPreview(null);
    }
  };

  const handleRemove = async () => {
    if (!isUploaded) {
      onCoverChange(undefined);
      setCoverVersion(String(Date.now()));
      return;
    }
    await deleteMutation.mutateAsync(bookId);
    onCoverChange(coverSourceUrl);
    setCoverVersion(String(Date.now()));
  };

  return (
    <div className="space-y-3">
      <MLabel>Cover image</MLabel>
      <div className="flex gap-4 items-start">
        <div
          className="m-cover-ph rounded-sm shadow-minerva-cover overflow-hidden flex-shrink-0 flex items-center justify-center bg-ink/5"
          style={{ width: 72, height: 108 }}
        >
          {displaySrc ? (
            <img
              key={displaySrc}
              src={displaySrc}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="t-meta text-center px-1" style={{ fontSize: 11 }}>No cover</span>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={disabled || busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void handleFile(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {displaySrc ? 'Replace image' : 'Upload image'}
          </Button>
          {displaySrc && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-ink-mute"
              disabled={disabled || busy}
              onClick={() => void handleRemove()}
            >
              <Trash2 className="size-4" />
              Remove {isUploaded ? 'uploaded' : ''} cover
            </Button>
          )}
          <p className="t-meta" style={{ fontSize: 12 }}>
            JPEG, PNG, WebP, or GIF · max 5 MB. Without an upload, the ISBN lookup cover is used.
          </p>
        </div>
      </div>
    </div>
  );
}

function MLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-serif italic text-ink-mute" style={{ display: 'block', fontSize: 13 }}>
      {children}
    </span>
  );
}
