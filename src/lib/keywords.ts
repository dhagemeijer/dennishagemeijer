export const MIN_KEYWORDS = 2;
export const MAX_KEYWORDS = 10;

/** Trim and collapse whitespace; keywords are stored lowercase for consistency. */
export function normalizeKeyword(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 40);
}

export function normalizeKeywords(values: string[]): string[] {
  const out: string[] = [];
  for (const value of values) {
    const keyword = normalizeKeyword(value);
    if (keyword && !out.includes(keyword)) out.push(keyword);
  }
  return out.slice(0, MAX_KEYWORDS);
}

/** Returns a Dutch validation message, or null when the list is valid. */
export function keywordsError(values: string[]): string | null {
  const list = normalizeKeywords(values);
  if (list.length < MIN_KEYWORDS) {
    return `Voeg minimaal ${MIN_KEYWORDS} trefwoorden toe.`;
  }
  if (values.length > MAX_KEYWORDS) {
    return `Maximaal ${MAX_KEYWORDS} trefwoorden toegestaan.`;
  }
  return null;
}
