const SMALL_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by',
  'in', 'of', 'as', 'vs', 'via', 'with', 'yet', 'so', 'if', 'up', 'out', 'off', 'over',
]);

const ROMAN_NUMERAL = /^(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv)$/i;

function capitalizeToken(token: string): string {
  if (!token) return token;
  if (ROMAN_NUMERAL.test(token)) return token.toUpperCase();
  if (token.length <= 4 && token === token.toUpperCase() && /^[A-Z0-9]+$/.test(token)) {
    return token;
  }
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function formatWord(word: string, isEdge: boolean): string {
  const match = word.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9'.-]+)([^a-zA-Z0-9]*)$/);
  if (!match) return word;

  const [, pre, core, post] = match;
  const lower = core.toLowerCase();
  let formatted: string;

  if (!isEdge && SMALL_WORDS.has(lower)) {
    formatted = lower;
  } else if (core.includes('-')) {
    formatted = core.split('-').map(capitalizeToken).join('-');
  } else {
    formatted = capitalizeToken(core);
  }

  return pre + formatted + post;
}

function titleCaseSegment(segment: string): string {
  const words = segment.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return segment;

  return words
    .map((word, index) => formatWord(word, index === 0 || index === words.length - 1))
    .join(' ');
}

/** Display title in English title case (e.g. "the great gatsby" → "The Great Gatsby"). */
export function formatBookTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return title;

  return trimmed
    .split(':')
    .map((segment) => titleCaseSegment(segment))
    .join(': ');
}
