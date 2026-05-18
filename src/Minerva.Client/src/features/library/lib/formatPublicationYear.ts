/** Year from Open Library `first_publish_year` or Google `publishedDate` stored as `publicationDate`. */
export function formatPublicationYear(publicationDate?: string | null): string | null {
  if (!publicationDate?.trim()) return null;

  const value = publicationDate.trim();
  const yearPrefix = value.match(/^(\d{4})/);
  if (yearPrefix) return yearPrefix[1];

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return String(parsed.getFullYear());

  return null;
}
