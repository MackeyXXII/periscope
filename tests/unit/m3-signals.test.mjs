// M3 Scan pipeline: unit tests M3-U1 to M3-U6.
// Written from docs/04-module-design.md (M3) before the pipeline has run (test-first rule).
//
// Every test is split as tests/lib/content.mjs recommends: a fixture part on the synthetic signals
// (runs now and keeps running after G3, so the fixtures stay valid) and a data/ part with
// needs: ['data'], skipped with "needs data/ (G3)" until CONTENT_FROZEN and failing afterwards if
// data/ is missing or wrong.
//
// Status at G2: M3-U1, U2, U5 and U6 (fixture parts) pass. M3-U4 fails until
// assets/js/contracts/constants.js exists. M3-U3 reads the scanning brief's raw Markdown, so it runs
// under Node only and is skipped in the browser ("needs Node or DM-11").
//
// INTERPRETATIONS, reported to the Orchestrator:
//   - M3-U2: "frozenOn" is the Signal's own provenance.frozenOn.
//   - M3-U3: the window is inclusive of both dates.
//   - M3-U6: "listed in the output for Red-team review": the quotes are written to the console
//     (console.log), one line each, because the harness has no other output channel.

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { importUnderTest, repoUrl } from '../lib/env.mjs';
import { loadContent } from '../lib/content.mjs';
import { readBrief, windowLine } from '../lib/briefs-md.mjs';
import { C6_TERMS, RELEVANCE_LEVELS, wholeWordHits, isIsoDate } from '../lib/text-rules.mjs';

const CONSTANTS = repoUrl('assets/js/contracts/constants.js');
const HTTPS = /^https:\/\/\S+$/;

function nonEmpty(s) {
  return typeof s === 'string' && /\S/.test(s);
}

function signalsOf(content) {
  assert.ok(Array.isArray(content.signals), `${content.from}: the signals module is an array`);
  return content.signals;
}

// ------------------------------------------------------------------------------------------ M3-U1

function sourcingProblems(signals) {
  const problems = [];
  signals.forEach((s, i) => {
    const at = `signal [${i}] ${s && s.id}`;
    const p = (s && s.provenance) || {};
    if (!(typeof p.sourceUrl === 'string' && HTTPS.test(p.sourceUrl))) problems.push(`${at}: no https:// provenance.sourceUrl`);
    if (!nonEmpty(p.publisher)) problems.push(`${at}: no publisher`);
    if (!isIsoDate(p.publishedOn)) problems.push(`${at}: no publishedOn`);
    if (!isIsoDate(p.retrievedOn)) problems.push(`${at}: no retrievedOn`);
    if (!(s && s.summary && nonEmpty(s.summary.text))) problems.push(`${at}: empty summary.text`);
  });
  return problems;
}

test('M3-U1 every synthetic signal has an https URL, a publisher, both dates and a summary', async () => {
  const signals = signalsOf(await loadContent({ from: 'fixtures' }));
  assert.ok(signals.length > 0, 'the fixture has signals');
  // Guard: each missing element is caught.
  const s = JSON.parse(JSON.stringify(signals[0]));
  s.provenance.sourceUrl = 'http://example.org/x';
  s.provenance.publisher = ' ';
  delete s.provenance.publishedOn;
  s.provenance.retrievedOn = null;
  s.summary.text = '\n';
  assert.equal(sourcingProblems([s]).length, 5, 'guard');
  assert.none(sourcingProblems(signals), 'unsourced signals');
});

test('M3-U1 every signal in data/ has an https URL, a publisher, both dates and a summary', { needs: ['data'] }, async () => {
  assert.none(sourcingProblems(signalsOf(await loadContent({ from: 'data' }))), 'unsourced signals in data/');
});

// ------------------------------------------------------------------------------------------ M3-U2

function dateOrderProblems(signals) {
  const problems = [];
  for (const s of signals) {
    const p = s.provenance || {};
    const dates = [p.publishedOn, p.retrievedOn, p.frozenOn];
    if (!dates.every(isIsoDate)) {
      problems.push(`${s.id}: publishedOn, retrievedOn and frozenOn are not all ISO dates (${dates.join(', ')})`);
    } else if (!(p.publishedOn <= p.retrievedOn && p.retrievedOn <= p.frozenOn)) {
      problems.push(`${s.id}: dates out of order: publishedOn ${p.publishedOn}, retrievedOn ${p.retrievedOn}, frozenOn ${p.frozenOn}`);
    }
  }
  return problems;
}

test('M3-U2 every synthetic signal has publishedOn <= retrievedOn <= frozenOn', async () => {
  const signals = signalsOf(await loadContent({ from: 'fixtures' }));
  const s = JSON.parse(JSON.stringify(signals[0]));
  s.provenance.retrievedOn = '2026-10-06';
  assert.equal(dateOrderProblems([s]).length, 1, 'guard: retrieved after frozen');
  assert.none(dateOrderProblems(signals), 'signals with dates out of order');
});

test('M3-U2 every signal in data/ has publishedOn <= retrievedOn <= frozenOn', { needs: ['data'] }, async () => {
  assert.none(dateOrderProblems(signalsOf(await loadContent({ from: 'data' }))), 'signals in data/ with dates out of order');
});

// ------------------------------------------------------------------------------------------ M3-U3

function windowNoteProblems(signals, window) {
  const problems = [];
  for (const s of signals) {
    const d = s.provenance && s.provenance.publishedOn;
    const inside = d >= window.start && d <= window.end;
    const hasNote = Object.prototype.hasOwnProperty.call(s, 'windowNote');
    if (!inside && !hasNote) problems.push(`${s.id}: published ${d}, outside the window ${window.start} to ${window.end}, and has no windowNote`);
    if (inside && hasNote) problems.push(`${s.id}: published ${d}, inside the window ${window.start} to ${window.end}, yet has a windowNote`);
  }
  return problems;
}

async function windowOf(url, missingCause) {
  const md = await readBrief(url, missingCause);
  const w = windowLine(md);
  assert.ok(w && isIsoDate(w.start) && isIsoDate(w.end), `the scanning brief has a Window line with two ISO dates (${url})`);
  return w;
}

test('M3-U3 synthetic signals outside the fixture brief window carry a windowNote, and only they do', async () => {
  const w = await windowOf(repoUrl('tests/fixtures/briefs/scanning-brief.md'), 'the fixture scanning brief is missing');
  const signals = signalsOf(await loadContent({ from: 'fixtures' }));
  // Guard: the fixture holds signals on both sides of the window, so both failure kinds are reachable.
  assert.ok(signals.some((s) => s.provenance.publishedOn < w.start || s.provenance.publishedOn > w.end), 'fixture has a signal outside the window');
  assert.ok(signals.some((s) => s.provenance.publishedOn >= w.start && s.provenance.publishedOn <= w.end), 'fixture has a signal inside the window');
  const flipped = signals.map((s) => {
    const c = JSON.parse(JSON.stringify(s));
    if (c.windowNote) delete c.windowNote;
    else c.windowNote = 'zebra superfluous note';
    return c;
  });
  assert.equal(windowNoteProblems(flipped, w).length, signals.length, 'guard: every flipped signal is reported');
  assert.none(windowNoteProblems(signals, w), 'window note defects');
});

test('M3-U3 signals in data/ outside the scanning brief window carry a windowNote, and only they do', { needs: ['data'] }, async () => {
  const w = await windowOf(repoUrl('pipeline/briefs/scanning-brief.md'), 'the Cowork briefs are not yet delivered to pipeline/briefs/ (D-2)');
  assert.none(windowNoteProblems(signalsOf(await loadContent({ from: 'data' })), w), 'window note defects in data/');
});

// ------------------------------------------------------------------------------------------ M3-U4

function quoteWords(q) {
  return q.split(/\s+/).filter(Boolean).length;
}

function longQuotes(signals, max) {
  return signals
    .filter((s) => typeof s.quote === 'string' && quoteWords(s.quote) > max)
    .map((s) => `${s.id}: quote has ${quoteWords(s.quote)} words, more than ${max}`);
}

test('M3-U4 every synthetic quote has at most QUOTE_MAX_WORDS words, and one has exactly that many', async () => {
  const signals = signalsOf(await loadContent({ from: 'fixtures' }));
  const { QUOTE_MAX_WORDS } = await importUnderTest(CONSTANTS);
  assert.ok(Number.isInteger(QUOTE_MAX_WORDS) && QUOTE_MAX_WORDS > 0, 'QUOTE_MAX_WORDS is a positive integer');
  assert.ok(
    signals.some((s) => typeof s.quote === 'string' && quoteWords(s.quote) === QUOTE_MAX_WORDS),
    `the fixture includes a quote of exactly QUOTE_MAX_WORDS (${QUOTE_MAX_WORDS}) words`,
  );
  assert.equal(longQuotes([{ id: 'guard', quote: 'w '.repeat(QUOTE_MAX_WORDS + 1) }], QUOTE_MAX_WORDS).length, 1, 'guard');
  assert.none(longQuotes(signals, QUOTE_MAX_WORDS), 'over-long quotes');
});

test('M3-U4 every quote in data/ has at most QUOTE_MAX_WORDS words', { needs: ['data'] }, async () => {
  const { QUOTE_MAX_WORDS } = await importUnderTest(CONSTANTS);
  assert.none(longQuotes(signalsOf(await loadContent({ from: 'data' })), QUOTE_MAX_WORDS), 'over-long quotes in data/');
});

// ------------------------------------------------------------------------------------------ M3-U5

function idDateProblems(signals) {
  const problems = [];
  for (const s of signals) {
    const m = /^sig-([0-9]{4}-[0-9]{2}-[0-9]{2})-/.exec(String(s.id));
    const published = s.provenance && s.provenance.publishedOn;
    if (!m) problems.push(`${s.id}: identifier holds no date`);
    else if (m[1] !== published) problems.push(`${s.id}: identifier date ${m[1]} differs from publishedOn ${published}`);
  }
  return problems;
}

test('M3-U5 the date in every synthetic signal identifier equals its publishedOn', async () => {
  const signals = signalsOf(await loadContent({ from: 'fixtures' }));
  assert.equal(idDateProblems([{ id: 'sig-2026-01-02-zebra', provenance: { publishedOn: '2026-01-03' } }]).length, 1, 'guard');
  assert.none(idDateProblems(signals), 'identifier dates that disagree');
});

test('M3-U5 the date in every signal identifier in data/ equals its publishedOn', { needs: ['data'] }, async () => {
  assert.none(idDateProblems(signalsOf(await loadContent({ from: 'data' }))), 'identifier dates that disagree in data/');
});

// ------------------------------------------------------------------------------------------ M3-U6

function rankingWordProblems(signals) {
  const problems = [];
  const quotes = [];
  for (const s of signals) {
    const fields = [
      ['summary.text', s.summary && s.summary.text],
      ['relevanceNote.text', s.relevanceNote && s.relevanceNote.text],
      ['windowNote', s.windowNote],
    ];
    for (const [name, text] of fields) {
      const hits = wholeWordHits(text, [...C6_TERMS, ...RELEVANCE_LEVELS]);
      if (hits.length) problems.push(`${s.id} ${name}: ${hits.join(', ')}`);
    }
    if (typeof s.quote === 'string') quotes.push(`${s.id}: ${s.quote}`);
  }
  return { problems, quotes };
}

function reportQuotes(where, quotes) {
  // C-6: quotes are excluded from the check and listed for Red-team review.
  for (const q of quotes) console.log(`M3-U6 quote for Red-team review (${where}): ${q}`);
}

test('M3-U6 no synthetic summary, relevance note or window note uses a C-6 term or a relevance level', async () => {
  const signals = signalsOf(await loadContent({ from: 'fixtures' }));
  // Guard: phrases, hyphenated terms and levels are caught as whole words; substrings are not.
  const guard = rankingWordProblems([
    { id: 'g1', summary: { text: 'A Must-Read item of HIGH interest.' }, relevanceNote: { text: 'The most  important one.' }, windowNote: 'Topical, follow-up, lowered.' },
  ]);
  assert.deepEqual(guard.problems, ['g1 summary.text: must-read, high', 'g1 relevanceNote.text: most important']);
  const { problems, quotes } = rankingWordProblems(signals);
  reportQuotes('fixtures', quotes);
  assert.none(problems, 'C-6 terms or relevance levels');
});

test('M3-U6 no summary, relevance note or window note in data/ uses a C-6 term or a relevance level', { needs: ['data'] }, async () => {
  const { problems, quotes } = rankingWordProblems(signalsOf(await loadContent({ from: 'data' })));
  reportQuotes('data/', quotes);
  assert.none(problems, 'C-6 terms or relevance levels in data/');
});
