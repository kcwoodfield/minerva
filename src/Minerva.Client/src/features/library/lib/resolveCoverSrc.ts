const LOCAL_COVER_PREFIXES = ['/assets/images/', '/uploads/covers/'] as const;

function isLocalCover(url: string): boolean {
  return LOCAL_COVER_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function normalizeCoverUrl(coverImageUrl: string): string {
  let url = coverImageUrl.trim();

  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return url;
  if (/^https?:\/\//i.test(url)) {
    // Prefer HTTPS for common cover CDNs (avoids mixed content / redirects).
    if (url.startsWith('http://covers.openlibrary.org')) {
      return url.replace(/^http:\/\//i, 'https://');
    }
    return url;
  }

  return `https://${url}`;
}

/** Resolve cover src for display; cache-bust locally hosted uploads after re-upload. */
export function resolveCoverSrc(coverImageUrl?: string, cacheKey?: string): string | undefined {
  if (!coverImageUrl?.trim()) return undefined;

  const url = normalizeCoverUrl(coverImageUrl);
  if (isLocalCover(url) && cacheKey) {
    return `${url}?v=${encodeURIComponent(cacheKey)}`;
  }
  return url;
}

export function isLocalCoverUrl(coverImageUrl?: string): boolean {
  if (!coverImageUrl?.trim()) return false;
  return isLocalCover(normalizeCoverUrl(coverImageUrl));
}
