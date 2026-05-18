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
