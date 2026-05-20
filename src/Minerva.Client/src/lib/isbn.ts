/**
 * Strip spaces, dashes, and other separators.
 * Accepts e.g. `978-0-140-44924-2` and `9780140449242` → `9780140449242`.
 */
export function normalizeIsbn(isbn: string): string | null {
  const digits = isbn.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (digits.length === 13 || digits.length === 10) return digits;
  return null;
}

/** Parse comma-, space-, or newline-separated ISBNs; dedupe; normalize to 13 digits when possible. */
export function parseIsbnList(text: string): string[] {
  const tokens = text.split(/[\s,;]+/).map((t) => t.trim()).filter(Boolean);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const token of tokens) {
    const normalized = normalizeIsbn(token);
    if (!normalized) continue;

    const isbn13 =
      normalized.length === 10 ? isbn10ToIsbn13(normalized) ?? normalized : normalized;
    if (seen.has(isbn13)) continue;
    seen.add(isbn13);
    result.push(isbn13);
  }

  return result;
}

/** Convert a 10-digit ISBN to its 13-digit (978-prefixed) equivalent. */
export function isbn10ToIsbn13(isbn10: string): string | null {
  const digits = isbn10.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (digits.length !== 10) return null;
  const base = '978' + digits.slice(0, 9);
  const sum = base.split('').reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return base + check;
}
