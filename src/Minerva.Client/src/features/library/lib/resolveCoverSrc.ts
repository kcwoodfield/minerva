/** Cache-bust locally hosted covers after re-upload. */
export function resolveCoverSrc(coverImageUrl?: string, cacheKey?: string): string | undefined {
  if (!coverImageUrl) return undefined;
  if (coverImageUrl.startsWith('/assets/images/') && cacheKey) {
    return `${coverImageUrl}?v=${encodeURIComponent(cacheKey)}`;
  }
  return coverImageUrl;
}
