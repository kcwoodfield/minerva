const LOCAL_COVER_PREFIXES = ['/assets/images/', '/uploads/covers/'] as const;

export function isLocalCoverUrl(coverImageUrl?: string): boolean {
  if (!coverImageUrl?.trim()) return false;
  const url = coverImageUrl.trim();
  return LOCAL_COVER_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export function hasCoverData(coverImageUrl?: string, coverSourceUrl?: string): boolean {
  return !!(coverImageUrl?.trim() || coverSourceUrl?.trim());
}

/** Same-origin cover URL — API serves upload or fetches from Open Library / Google. */
export function resolveBookCoverEndpoint(bookId: string, cacheKey?: string): string {
  if (!cacheKey) return `/api/books/${bookId}/cover`;
  return `/api/books/${bookId}/cover?v=${encodeURIComponent(cacheKey)}`;
}

function withCacheBust(url: string, cacheKey?: string): string {
  if (!cacheKey) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${encodeURIComponent(cacheKey)}`;
}

/** Preview URL for edit form — local uploads hit static path; others use cover API. */
export function resolveCoverDisplaySrc(
  bookId: string,
  coverUrl?: string,
  coverSourceUrl?: string,
  cacheKey?: string,
): string | undefined {
  const local = coverUrl?.trim();
  if (local && isLocalCoverUrl(local)) {
    return withCacheBust(local, cacheKey);
  }
  if (!hasCoverData(coverUrl, coverSourceUrl)) return undefined;
  return resolveBookCoverEndpoint(bookId, cacheKey);
}
