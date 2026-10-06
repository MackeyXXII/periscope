// M5 Brief composer: the weekly brief, F2 (docs/02-system-requirements.md, F2;
// docs/04-module-design.md, M5). The entry screen of the demo (DM-7).
//
// No ranking (invariant 1). A digest is the format most easily read as "the important things,
// most important first", so three things keep this one a list of peers: the order rule
// (publication date, newest first, ties by identifier; orderSignals), the ordering note beside the
// list, and one template for every signal element, built by one function. No signal is marked,
// pinned, highlighted or numbered, and nothing on the screen states a level of relevance.
//
// Fail closed (C-3). A brief that fails its check shows F2-E1 and no signal. A brief signal that is
// missing from the valid signals (the loader withholds a signal that fails checkSignal) is not
// rendered at all, and F2-W1 counts it. A trend that fails checkTrend gives no trend link, so a
// withheld trend's title never appears here; if the trend list cannot be loaded, every signal says
// so in place of its links (F1-E0 in F2).
//
// Labels (C-5): the brief header is the one `frozen` element of the demo (the assembled
// container), with the freeze date; each signal is `real`; its summary and relevance note each carry
// their own `ai-generated` label, as does each trend title used as a link. Headings, the ordering
// note and notices are interface copy and carry no label.

import { checkTrend } from '../contracts/validate.js';
import { renderLabel } from '../honesty/labels.js';
import { renderSource, renderQuote, formatDate } from '../honesty/sources.js';

const TEXT = Object.freeze({
  heading: 'Weekly brief',
  period: (start, end, frozen) => `Brief period: ${start} to ${end}. Frozen on ${frozen}.`,
  orderNote: 'Listed by publication date. The order says nothing about importance.',
  empty: 'This brief contains no signals.',
  invalid: 'The weekly brief could not be shown because its content failed validation.',
  withheldOne: '1 signal was withheld because it failed the provenance check.',
  withheldMany: (n) => `${n} signals were withheld because they failed the provenance check.`,
  noTrend: 'No trend card for this signal in this build.',
  trendCaptionOne: 'Trend card:',
  trendCaptionMany: 'Trend cards:',
});

// ------------------------------------------------------------------------------------------ pure

function compareIds(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * The brief's signals in the C-4 order: provenance.publishedOn newest first, ties by id ascending.
 * Returns a new frozen array; the input is not changed. The order depends on the dates and
 * identifiers alone, never on the input order.
 */
export function orderSignals(signals) {
  if (!Array.isArray(signals)) throw new TypeError('orderSignals: expected an array of signals');
  return Object.freeze(
    signals.slice().sort((a, b) => {
      const da = a.provenance.publishedOn;
      const db = b.provenance.publishedOn;
      if (da !== db) return da < db ? 1 : -1;
      return compareIds(a.id, b.id);
    }),
  );
}

/**
 * The trends a signal belongs to, in alphabetical order of title (English collation), ties by id:
 * one link per trend (F2 step 3). Returns a new frozen array of the trend records.
 */
export function trendLinksFor(signalId, trends) {
  if (!Array.isArray(trends)) throw new TypeError('trendLinksFor: expected an array of trends');
  return Object.freeze(
    trends
      .filter((t) => t !== null && typeof t === 'object' && Array.isArray(t.signalIds) && t.signalIds.includes(signalId))
      .sort((a, b) => {
        const t = a.title.localeCompare(b.title, 'en', { sensitivity: 'base' });
        return t !== 0 ? t : compareIds(a.id, b.id);
      }),
  );
}

// ------------------------------------------------------------------------------------------ DOM helpers

function el(doc, tag, className, text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Marks `node` as a content element with its label and appends the visible badge to `badgeHost` (default: node). */
function labelled(node, label, badgeHost = node) {
  node.setAttribute('data-content', '');
  node.setAttribute('data-label', label);
  badgeHost.appendChild(renderLabel(label));
  return node;
}

// ------------------------------------------------------------------------------------------ parts

function briefHeader(doc, brief) {
  const header = el(doc, 'header', 'brief-head');
  const h1 = el(doc, 'h1', '', TEXT.heading);
  const period = el(
    doc,
    'p',
    'meta',
    TEXT.period(formatDate(brief.periodStart), formatDate(brief.periodEnd), formatDate(brief.provenance.frozenOn)),
  );
  header.append(h1, period);
  return labelled(header, brief.label, h1);
}

/** The trend links of one signal, or the F2-S2 / F1-E0 line in their place. One wrapper either way. */
function trendLinks(doc, ctx, signalId, trends) {
  const box = el(doc, 'div', 'signal-trends');
  const owners = trends === null ? [] : trendLinksFor(signalId, trends);
  if (owners.length === 0) {
    box.appendChild(el(doc, 'p', 'note', TEXT.noTrend));
    return box;
  }
  box.appendChild(el(doc, 'p', 'trends-caption', owners.length === 1 ? TEXT.trendCaptionOne : TEXT.trendCaptionMany));
  const list = el(doc, 'ul', 'trend-links');
  for (const t of owners) {
    const item = el(doc, 'li', 'trend-link-item');
    const a = el(doc, 'a', '', t.title);
    a.setAttribute('href', ctx.routes.trend(t.id));
    item.appendChild(a);
    list.appendChild(labelled(item, t.label));
  }
  box.appendChild(list);
  return box;
}

/** One signal element. The same function builds every signal, so all share one template (M5-U6). */
function signalElement(doc, ctx, signal, trends) {
  const item = el(doc, 'li', 'card signal');
  item.setAttribute('data-signal', signal.id);

  const title = el(doc, 'h2', 'signal-title');
  const titleText = el(doc, 'span', '', signal.title);
  titleText.setAttribute('lang', signal.sourceLanguage);
  title.appendChild(titleText);

  const source = el(doc, 'p', 'signal-source');
  source.appendChild(
    renderSource({
      url: signal.provenance.sourceUrl,
      publisher: signal.provenance.publisher,
      publishedOn: signal.provenance.publishedOn,
    }),
  );

  // The body holds the optional parts too, so every signal element has the same direct children.
  const body = el(doc, 'div', 'signal-body');
  body.appendChild(labelled(el(doc, 'p', 'signal-summary', signal.summary.text), signal.summary.label));
  if (typeof signal.quote === 'string' && signal.quote.trim() !== '') {
    const q = el(doc, 'p', 'signal-quote');
    q.appendChild(renderQuote(signal.quote, signal.sourceLanguage, signal.provenance.publisher));
    body.appendChild(q);
  }
  body.appendChild(labelled(el(doc, 'p', 'signal-relevance', signal.relevanceNote.text), signal.relevanceNote.label));
  if (typeof signal.windowNote === 'string' && signal.windowNote.trim() !== '') {
    body.appendChild(el(doc, 'p', 'meta', signal.windowNote));
  }

  item.append(title, source, body, trendLinks(doc, ctx, signal.id, trends));
  return labelled(item, signal.label, title);
}

// ------------------------------------------------------------------------------------------ the screen

/** renderBrief(root, ctx): F2-S1, F2-S0, F2-W1, F2-S2 or F2-E1. Resolves when the screen has rendered. */
export async function renderBrief(root, ctx) {
  const doc = root.ownerDocument;
  const [brief, signals, trends] = await Promise.all([
    ctx.loader.loadBrief(),
    ctx.loader.loadSignals(),
    ctx.loader.loadTrends(),
  ]);

  // F2-E1: the brief container, or the signal list as a whole, failed its check.
  if (!brief || brief.ok !== true || !signals || signals.ok !== true) {
    root.append(el(doc, 'h1', '', TEXT.heading), el(doc, 'p', 'notice', TEXT.invalid));
    return;
  }

  root.appendChild(briefHeader(doc, brief.value));

  if (brief.value.signalIds.length === 0) {
    root.appendChild(el(doc, 'p', 'notice', TEXT.empty));
    return;
  }

  // A brief signal that is not among the valid signals was withheld by the loader (checkSignal).
  const byId = new Map(signals.value.map((s) => [s.id, s]));
  const shown = brief.value.signalIds.map((id) => byId.get(id)).filter(Boolean);
  const withheld = brief.value.signalIds.length - shown.length;

  // Only trends that pass their record check give links (F1 precondition 2); null under F1-E0.
  const validTrends =
    trends && trends.ok === true
      ? trends.value.filter((t) => {
          const verdict = checkTrend(t, signals.value);
          return verdict && verdict.ok === true;
        })
      : null;

  if (shown.length > 0) {
    root.appendChild(el(doc, 'p', 'note', TEXT.orderNote));
    const list = el(doc, 'ul', 'card-list signal-list');
    list.setAttribute('data-area', 'signals');
    for (const s of orderSignals(shown)) list.appendChild(signalElement(doc, ctx, s, validTrends));
    root.appendChild(list);
  }

  if (withheld > 0) {
    root.appendChild(el(doc, 'p', 'notice', withheld === 1 ? TEXT.withheldOne : TEXT.withheldMany(withheld)));
  }
}
