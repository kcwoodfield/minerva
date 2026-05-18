import { useState } from 'react';
import { cn } from '@/lib/utils';
import { hasCoverData, resolveBookCoverEndpoint } from '../lib/resolveCoverSrc';

interface Props {
  bookId: string;
  coverImageUrl?: string;
  coverSourceUrl?: string;
  cacheKey?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  placeholderClassName?: string;
}

export function BookCoverImage({
  bookId,
  coverImageUrl,
  coverSourceUrl,
  cacheKey,
  alt = '',
  className,
  style,
  placeholderClassName,
}: Props) {
  const [failed, setFailed] = useState(false);

  if (!hasCoverData(coverImageUrl, coverSourceUrl) || failed) {
    return (
      <div className={cn('m-cover-ph', placeholderClassName, className)} style={style}>
        cover
      </div>
    );
  }

  return (
    <img
      key={`${bookId}-${cacheKey ?? ''}`}
      src={resolveBookCoverEndpoint(bookId, cacheKey)}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
