// M8 Decision log and replay: the decision log, F4 (docs/02-system-requirements.md, F4;
// docs/04-module-design.md, M8).
//
// A retrospective replay, labelled as one wherever it appears. The replay statement is the first
// content on the screen in every state (F4-S1, F4-S0, F4-W1, F4-E1): it is interface copy, not
// content, so it carries no label (C-5 rule 6). It says what the replay is, who wrote the
// judgements and when, and names the limit of "outcomes withheld" (Red-team finding B5): the
// outcomes were withheld from the agents' inputs, not from the model.
//
// Invariant 4: an entry that fails checkLogEntry (for example an outcome without a dated source) is
// withheld by the loader and not rendered at all; F4-W1 counts it. Invariant 1: no aggregate, no
// tally of judgements that held, no verdict icon; the statement says "some", never a number; every
// entry has one template.
//
// R7 is designed for, not built: nothing here reads a role from an entry (M8-U8).

import { renderLabel } from '../honesty/labels.js';
import { renderSource, formatDate } from '../honesty/sources.js';

const LENS_NAME = Object.freeze({ opportunity: 'Opportunity', threat: 'Threat', noise: 'Noise' });

const AUTHOR_NAME = Object.freeze({
  'rival-reader': 'Rival Reader',
  interrogator: 'Interrogator',
  verifier: 'Verifier',
  'trend-analyst': 'Trend Analyst',
});

const TEXT = Object.freeze({
  heading: 'Decision log',
  orderNote: 'Listed by the date of the original signal.',
  empty: 'This build contains no replay entries.',
  invalid: 'The decision log could not be shown because its content failed validation.',
  withheldOne: '1 entry was withheld because it lacked a dated outcome source or failed validation.',
  withheldMany: (n) => `${n} entries were withheld because they lacked a dated outcome source or failed validation.`,
  entryHeading: (asOf) => `Replay as of ${asOf}`,
  signalOne: 'Original signal',
  signalMany: 'Original signals',
  pastJudgement: 'Past judgement',
  reading: 'Reading:',
  outcome: 'What happened',
  calibration: 'Calibration note',
});

// ------------------------------------------------------------------------------------------ pure

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** The earliest publication date among an entry's original signals. */
function earliestSignalDate(entry) {
  return entry.originalSignals.map((s) => s.source.publishedOn).sort()[0];
}

/**
 * The entries in the C-4 order: earliest original-signal publication date, oldest first; ties by
 * entry id ascending. Returns a new frozen array; the input order never matters.
 */
export function orderEntries(entries) {
  if (!Array.isArray(entries)) throw new TypeError('orderEntries: expected an array of log entries');
  return Object.freeze(
    entries.slice().sort((a, b) => compareStrings(earliestSignalDate(a), earliestSignalDate(b)) || compareStrings(a.id, b.id)),
  );
}

/**
 * The dates the past judgements were written: one ISO date when all were written on the same day,
 * otherwise the first and the last. Empty for no entries. Returns a frozen array.
 */
export function writingDates(entries) {
  const dates = [...new Set((entries || []).map((e) => e.pastJudgement.authoredOn))].sort();
  if (dates.length <= 1) return Object.freeze(dates);
  return Object.freeze([dates[0], dates[dates.length - 1]]);
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

function listOfNames(names) {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function authorName(producer) {
  return AUTHOR_NAME[producer] || producer.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ------------------------------------------------------------------------------------------ the replay statement

/** The replay statement (interface copy, no label), with the writing date or dates when entries exist. */
function replayStatement(doc, dates) {
  let when = '';
  if (dates.length === 1) when = ` on ${formatDate(dates[0])}`;
  else if (dates.length === 2) when = ` between ${formatDate(dates[0])} and ${formatDate(dates[1])}`;
  const text =
    'This is a retrospective replay. The signals are real, published between 1 January and 31 March 2026. ' +
    `The demo's Rival Reader and Interrogator agents wrote the judgements${when} for the fictional Tracewell team, from those signals; ` +
    "the outcomes were withheld from the agents' inputs, but the agents run on a language model, and the model's general knowledge extends to mid-2026 and may include some of these outcomes. " +
    'The Verifier agent attached the real, dated outcomes afterwards. ' +
    'Some judgements did not hold; they are shown as written. The calibration notes are AI-generated. ' +
    'These judgements are not yours: judgements you commit in this session are not stored and do not appear here.';
  return el(doc, 'p', 'replay-statement', text);
}

// ------------------------------------------------------------------------------------------ one entry

function signalPart(doc, signal) {
  const item = el(doc, 'li', 'replay-signal');
  const title = el(doc, 'p', 'replay-signal-title', signal.title);
  const summary = labelled(el(doc, 'p', '', signal.summary.text), signal.summary.label);
  const source = el(doc, 'p', 'meta');
  source.appendChild(renderSource(signal.source));
  item.append(title, summary, source);
  return labelled(item, signal.label, title);
}

function pastJudgementPart(doc, j) {
  const box = el(doc, 'div', 'past-judgement');
  const heading = el(doc, 'h3', '', TEXT.pastJudgement);
  const line = el(
    doc,
    'p',
    'meta',
    `As of ${formatDate(j.asOfDate)}, written for the fictional Tracewell team by the ${listOfNames(j.authoredBy.map(authorName))} ${
      j.authoredBy.length > 1 ? 'agents' : 'agent'
    } on ${formatDate(j.authoredOn)}.`,
  );
  const lens = el(doc, 'p', '', `${TEXT.reading} ${LENS_NAME[j.lens] || j.lens}`);
  const rationale = el(doc, 'p', 'past-rationale', j.rationale);
  box.append(heading, line, lens, rationale);
  return labelled(box, j.label, line);
}

function outcomePart(doc, outcome) {
  const box = el(doc, 'div', 'outcome');
  const heading = el(doc, 'h3', '', TEXT.outcome);
  const summary = labelled(el(doc, 'p', '', outcome.summary.text), outcome.summary.label);
  const source = el(doc, 'p', 'meta');
  source.appendChild(renderSource(outcome.source));
  box.append(heading, summary, source);
  return labelled(box, outcome.label, source);
}

function entryElement(doc, entry) {
  const item = el(doc, 'li', 'card entry');
  item.setAttribute('data-entry', entry.id);
  const heading = el(doc, 'h2', 'entry-heading', TEXT.entryHeading(formatDate(entry.pastJudgement.asOfDate)));

  const signals = el(doc, 'div', 'replay-signals');
  signals.appendChild(el(doc, 'h3', '', entry.originalSignals.length === 1 ? TEXT.signalOne : TEXT.signalMany));
  const list = el(doc, 'ul', 'replay-signal-list');
  for (const s of entry.originalSignals.slice().sort((a, b) => compareStrings(a.source.publishedOn, b.source.publishedOn))) {
    list.appendChild(signalPart(doc, s));
  }
  signals.appendChild(list);

  const note = el(doc, 'div', 'calibration');
  note.append(el(doc, 'h3', '', TEXT.calibration), labelled(el(doc, 'p', '', entry.calibrationNote.text), entry.calibrationNote.label));

  item.append(heading, signals, pastJudgementPart(doc, entry.pastJudgement), outcomePart(doc, entry.outcome), note);
  return labelled(item, entry.label, heading);
}

// ------------------------------------------------------------------------------------------ the screen

/** renderLog(root, ctx): F4-S1, F4-S0, F4-W1 or F4-E1. Resolves when the screen has rendered. */
export async function renderLog(root, ctx) {
  const doc = root.ownerDocument;
  root.appendChild(el(doc, 'h1', '', TEXT.heading));
  const loaded = await ctx.loader.loadLog();

  if (!loaded || loaded.ok !== true) {
    root.append(replayStatement(doc, []), el(doc, 'p', 'notice', TEXT.invalid));
    return;
  }

  const entries = orderEntries(loaded.value);
  const withheld = loaded.withheld || 0;
  root.appendChild(replayStatement(doc, writingDates(entries)));

  if (entries.length === 0 && withheld === 0) {
    root.appendChild(el(doc, 'p', 'notice', TEXT.empty));
    return;
  }

  if (entries.length > 0) {
    root.appendChild(el(doc, 'p', 'note', TEXT.orderNote));
    const list = el(doc, 'ul', 'card-list entry-list');
    list.setAttribute('data-area', 'entries');
    for (const e of entries) list.appendChild(entryElement(doc, e));
    root.appendChild(list);
  }

  if (withheld > 0) {
    root.appendChild(el(doc, 'p', 'notice', withheld === 1 ? TEXT.withheldOne : TEXT.withheldMany(withheld)));
  }
}
