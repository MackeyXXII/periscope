// M9 Honesty and provenance layer: source citations, quotes and dates (docs/04-module-design.md,
// M9; NF2, invariant 4). Every dated source in the page is rendered by renderSource, every quote by
// renderQuote and every date by formatDate, so that a citation looks the same on every screen and
// an undated source or an over-long quote cannot render at all.
//
// formatDate is pure and runs under Node (M9-U2). The render functions read `document` only when
// called, never at import time.

import { QUOTE_MAX_WORDS } from '../contracts/constants.js';

const MONTHS = Object.freeze([
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]);

const ISO_DATE = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
const PAGE = /^[0-9]{1,4}(-[0-9]{1,4})?$/;

/**
 * An ISO calendar date as English text: formatDate('2026-10-05') is "5 October 2026".
 * Throws a TypeError for anything that is not a real calendar date written YYYY-MM-DD.
 */
export function formatDate(isoDate) {
  const m = typeof isoDate === 'string' ? ISO_DATE.exec(isoDate) : null;
  if (!m) throw new TypeError(`formatDate: ${JSON.stringify(isoDate)} is not an ISO date (YYYY-MM-DD)`);
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new TypeError(`formatDate: ${JSON.stringify(isoDate)} is not a calendar date`);
  }
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * A citation: <span class="source"> holding the outbound link (title, or "Source" when the
 * reference has no title), then the publisher, the formatted publication date and, for a report
 * citation, "p. <page>". The link opens in a new tab with rel="noopener noreferrer"; following it is
 * navigation the viewer chooses, not a request by the demo.
 * Accepts a sourceRef or a reportCitation (common.schema.json). Throws a TypeError for a reference
 * without an https:// URL, a publisher or a valid publishedOn, or with a malformed page.
 */
export function renderSource(ref) {
  if (ref === null || typeof ref !== 'object') throw new TypeError('renderSource: the reference is not an object');
  if (typeof ref.url !== 'string' || !ref.url.startsWith('https://')) {
    throw new TypeError(`renderSource: ${JSON.stringify(ref.url)} is not an https:// URL`);
  }
  if (!nonEmpty(ref.publisher)) throw new TypeError('renderSource: the reference has no publisher');
  if (ref.publishedOn === undefined || ref.publishedOn === null) throw new TypeError('renderSource: the reference has no publishedOn date');
  const date = formatDate(ref.publishedOn);
  const hasPage = ref.page !== undefined && ref.page !== null;
  if (hasPage && (typeof ref.page !== 'string' || !PAGE.test(ref.page))) {
    throw new TypeError(`renderSource: ${JSON.stringify(ref.page)} is not a page reference`);
  }

  const box = document.createElement('span');
  box.className = 'source';
  const link = document.createElement('a');
  link.setAttribute('href', ref.url);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
  link.textContent = nonEmpty(ref.title) ? ref.title : 'Source';
  box.appendChild(link);
  const parts = [ref.publisher, date];
  if (hasPage) parts.push(`p. ${ref.page}`);
  box.appendChild(document.createTextNode(`, ${parts.join(', ')}`));
  return box;
}

/**
 * A short quote in its original language: <span class="quote"> holding <q lang="<sourceLanguage>">
 * and then the publisher. Paraphrase is preferred (invariant 4); a quote is at most QUOTE_MAX_WORDS
 * words, split on whitespace. Throws a TypeError for an empty or over-long quote, or a missing
 * language or publisher.
 */
export function renderQuote(text, sourceLanguage, publisher) {
  if (!nonEmpty(text)) throw new TypeError('renderQuote: the quote is empty');
  const words = text.trim().split(/\s+/).length;
  if (words > QUOTE_MAX_WORDS) {
    throw new TypeError(`renderQuote: the quote has ${words} words; at most ${QUOTE_MAX_WORDS} are allowed`);
  }
  if (!nonEmpty(sourceLanguage)) throw new TypeError('renderQuote: the quote has no source language');
  if (!nonEmpty(publisher)) throw new TypeError('renderQuote: the quote has no publisher');

  const box = document.createElement('span');
  box.className = 'quote';
  const q = document.createElement('q');
  q.setAttribute('lang', sourceLanguage);
  q.textContent = text;
  box.appendChild(q);
  box.appendChild(document.createTextNode(` (${publisher})`));
  return box;
}
