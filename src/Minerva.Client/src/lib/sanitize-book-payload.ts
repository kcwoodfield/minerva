/** Omit empty strings so the API receives null/absent instead of "" for optional fields. */
export function sanitizeBookPayload<T extends object>(data: T): T {
  const out = { ...data } as Record<string, unknown>;
  for (const key of Object.keys(out)) {
    const value = out[key];
    if (value === '' || value === null || value === undefined) {
      delete out[key];
    }
  }
  return out as T;
}
