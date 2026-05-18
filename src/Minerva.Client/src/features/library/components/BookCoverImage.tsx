import { useState } from 'react';
import { cn } from '@/lib/utils';
import { resolveCoverSrc } from '../lib/resolveCoverSrc';

interface Props {
  coverImageUrl?: string;
  cacheKey?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  placeholderClassName?: string;
}

export function BookCoverImage({
  coverImageUrl,
  cacheKey,
  alt = '',
  className,
  style,
  placeholderClassName,
}: Props) {
  const [failed, setFailed] = useState(false);
  const src = resolveCoverSrc(coverImageUrl, cacheKey);

  if (!src || failed) {
    return (
      <div className={cn('m-cover-ph', placeholderClassName, className)} style={style}>
        cover
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
