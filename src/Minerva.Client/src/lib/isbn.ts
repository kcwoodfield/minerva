/**
 * Strip spaces, dashes, and other separators.
 * Accepts e.g. `978-0-140-44924-2` and `9780140449242` → `9780140449242`.
 */
export function normalizeIsbn(isbn: string): string | null {
  const digits = isbn.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (digits.length === 13 || digits.length === 10) return digits;
  return null;
}
