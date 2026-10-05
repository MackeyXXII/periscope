// Test tooling for Periscope. Never imported by the page.
//
// Lexical rules shared by the content tests of M3 and M4 (docs/04-module-design.md): the C-6 term
// list (M3-U6, M4-U9, M4-U10), the relevance levels (M3-U6), the lens words (M4-U5, M4-U10), the
// advice words (M4-U10), whole-word matching, and the six-word shared-run check (M4-U6, M4-U11).
// Added by the Test Engineer on 5 October 2026 for the M3 and M4 tests, so that the lists have one
// home in the test tooling.

/** C-6 terms, exactly as listed in M3-U6. */
export const C6_TERMS = Object.freeze([
  'best', 'better option', 'recommended', 'recommendation', 'top', 'priority', 'prioritise', 'rank',
  'ranking', 'score', 'confidence', 'most important', 'most likely', 'key signal', 'must-read', 'winner',
]);

/** Relevance levels, exactly as listed in M3-U6. */
export const RELEVANCE_LEVELS = Object.freeze(['high', 'medium', 'low', 'critical', 'minor']);

/** Lens words, exactly as listed in M4-U5. */
export const LENS_WORDS = Object.freeze([
  'opportunity', 'opportunities', 'threat', 'threats', 'threatening', 'noise', 'noisy', 'risk', 'risky',
  'danger', 'dangerous', 'promising', 'overhyped', 'hype',
]);

/** Advice words, exactly as listed in M4-U10. */
export const ADVICE_WORDS = Object.freeze(['should', 'must', 'need to', 'recommend', 'advise', 'advice']);

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const cache = new Map();
function wholeWordRegex(term) {
  if (!cache.has(term)) {
    // A whole word: not preceded or followed by a letter or digit (Unicode-aware). A hyphen or any
    // punctuation is a boundary, as with \b. Spaces inside a phrase match any run of whitespace.
    const body = term.split(/\s+/).map(escape).join('\\s+');
    cache.set(term, new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, 'iu'));
  }
  return cache.get(term);
}

/** The terms of `terms` that occur in `text` as whole words, case-insensitively. */
export function wholeWordHits(text, terms) {
  if (typeof text !== 'string') return [];
  return terms.filter((t) => wholeWordRegex(t).test(text));
}

/** Words of a text: case-folded, NFC, punctuation stripped (removed), split on whitespace. */
export function runWords(text) {
  return String(text)
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean);
}

/** The first run of `n` or more consecutive words shared by `a` and `b`, as a string, or null. */
export function sharedRun(a, b, n = 6) {
  const wa = runWords(a);
  const wb = runWords(b);
  if (wa.length < n || wb.length < n) return null;
  const grams = new Set();
  for (let i = 0; i + n <= wb.length; i += 1) grams.add(wb.slice(i, i + n).join(' '));
  for (let i = 0; i + n <= wa.length; i += 1) {
    const g = wa.slice(i, i + n).join(' ');
    if (grams.has(g)) return g;
  }
  return null;
}

/** Every string leaf of a JSON value, as [{ text, path }]. */
export function stringLeaves(value, path = '') {
  const out = [];
  (function visit(v, p) {
    if (typeof v === 'string') out.push({ text: v, path: p || '/' });
    else if (Array.isArray(v)) v.forEach((item, i) => visit(item, `${p}/${i}`));
    else if (v !== null && typeof v === 'object') for (const [k, c] of Object.entries(v)) visit(c, `${p}/${k}`);
  })(value, path);
  return out;
}

/** Whether a string is an ISO calendar date YYYY-MM-DD that exists in the calendar. */
export function isIsoDate(s) {
  if (typeof s !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
