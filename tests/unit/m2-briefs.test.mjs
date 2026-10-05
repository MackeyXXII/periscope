// M2 Persona and scanning brief: unit tests M2-U1 to M2-U5.
// Written from docs/04-module-design.md (M2, and its "Markdown conventions the tests parse") before
// the Cowork briefs exist (test-first rule).
//
// Status at G2 (B): every test reads pipeline/briefs/*.md, which do not exist until the Cowork
// Persona and Brief Researcher delivers them (D-2). Under Node each test fails naming the missing
// file; in the browser runner each test is skipped, because reading raw file text needs Node or
// DM-11. Each test first runs its parser on small in-memory samples (a guard), so that a parser that
// accepts everything is caught even before the briefs exist.
//
// M2-U2 is "B, G3": its fixture part checks the synthetic content against the Named entities table
// of tests/fixtures/briefs/scanning-brief.md (the publishers there are invented, so they can never
// belong in the real briefs); its data/ part checks data/ against pipeline/briefs/ from G3.
//
// INTERPRETATIONS, reported to the Orchestrator:
//   - M2-U1: a Source URL cell may be written bare, as <url> or as [text](url); the URL inside must
//     match ^https://\S+$. A Date must be a real calendar date. A section whose table has no data
//     rows passes M2-U1 (the specification names only missing sections and fields).
//   - M2-U2: names are compared case-insensitively after trimming; "Dynatrace" and "OpenTelemetry"
//     are searched as whole words, case-insensitively, in every string of every content module.
//   - M2-U3: "the paragraph that first names Tracewell" is the first block of consecutive non-blank
//     lines, not counting headings (lines beginning with #), that contains "Tracewell". The Jöhnk
//     citation is the first such block containing "Jöhnk" (Unicode NFC) and "2021"; it must hold an
//     https:// URL and an ISO date.
//   - M2-U5: each candidate must have exactly one Outcome line ("one line Outcome:").

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { importUnderTest, repoUrl } from '../lib/env.mjs';
import { loadContent } from '../lib/content.mjs';
import { BRIEF_FILES, ENTITY_KINDS, readBrief, namedEntities, windowLine, replayCandidates, extractUrl } from '../lib/briefs-md.mjs';
import { isIsoDate, stringLeaves, wholeWordHits } from '../lib/text-rules.mjs';
import { allKeys } from '../lib/contract-rules.mjs';

const CONSTANTS = repoUrl('assets/js/contracts/constants.js');
const MISSING = 'the Cowork briefs are not yet delivered to pipeline/briefs/ (D-2)';
const HTTPS = /^https:\/\/\S+$/;
const OUTCOME_LATEST = '2026-09-30';

function briefUrl(name) {
  return repoUrl(`pipeline/briefs/${name}`);
}

async function readBriefFile(name) {
  return readBrief(briefUrl(name), MISSING);
}

// ------------------------------------------------------------------------------------------ M2-U1

function entityProblems(markdown, file) {
  const parsed = namedEntities(markdown);
  if (!parsed.found) return [`${file}: no section headed "## Named entities"`];
  if (!parsed.table) return [`${file}: the Named entities section has no table with columns Name, Kind, Source URL, Date`, ...parsed.problems];
  const problems = [];
  for (const row of parsed.rows) {
    const at = `${file} line ${row.line}`;
    if (!row.Name.trim()) problems.push(`${at}: empty Name`);
    if (!ENTITY_KINDS.includes(row.Kind.trim())) problems.push(`${at}: Kind ${JSON.stringify(row.Kind)} is not one of ${ENTITY_KINDS.join(', ')}`);
    if (!HTTPS.test(extractUrl(row['Source URL']))) problems.push(`${at}: Source URL ${JSON.stringify(row['Source URL'])} is not an https:// URL`);
    if (!isIsoDate(row.Date.trim())) problems.push(`${at}: Date ${JSON.stringify(row.Date)} is not an ISO date`);
  }
  return problems;
}

test('M2-U1 every Named entities row in the three briefs has a name, a kind, an https URL and an ISO date', async () => {
  // Guard: the check finds each defect in a synthetic table, and accepts a good one.
  const good = '## Named entities\n\n| Name | Kind | Source URL | Date |\n|---|---|---|---|\n| Zebra Corp | competitor | https://example.org/z | 2026-01-05 |\n';
  assert.deepEqual(entityProblems(good, 'guard'), []);
  const bad = '## Named entities\n\n| Name | Kind | Source URL | Date |\n|---|---|---|---|\n|  | rival | http://example.org/z | 2026-02-30 |\n';
  assert.equal(entityProblems(bad, 'guard').length, 4, 'guard: four defects in one row');
  assert.equal(entityProblems('# No entities here\n', 'guard').length, 1, 'guard: missing section');

  const problems = [];
  for (const name of BRIEF_FILES) {
    const text = await readBriefFile(name);
    problems.push(...entityProblems(text, `pipeline/briefs/${name}`));
  }
  assert.none(problems, 'Named entities defects');
});

// ------------------------------------------------------------------------------------------ M2-U2

function entityNames(markdowns) {
  const names = new Set();
  for (const md of markdowns) for (const row of namedEntities(md).rows) names.add(row.Name.trim().toLowerCase());
  return names;
}

function unlistedNames(content, names, where) {
  const problems = [];
  for (const [dataPath, value] of content.modules) {
    for (const { key, path } of allKeys(value)) {
      if (key !== 'publisher') continue;
      const v = path.split('/').slice(1).reduce((o, k) => o[k], value);
      if (typeof v === 'string' && !names.has(v.trim().toLowerCase())) {
        problems.push(`${dataPath}${path}: publisher ${JSON.stringify(v)} is not a Name in any Named entities table of ${where}`);
      }
    }
    for (const { text, path } of stringLeaves(value)) {
      for (const word of wholeWordHits(text, ['Dynatrace', 'OpenTelemetry'])) {
        if (!names.has(word.toLowerCase())) {
          problems.push(`${dataPath}${path}: mentions ${word}, which is not a Name in any Named entities table of ${where}`);
        }
      }
    }
  }
  return problems;
}

test('M2-U2 every publisher in the synthetic content is a named entity of the fixture scanning brief', async () => {
  // Guard: an unlisted publisher and an unlisted mention of Dynatrace are both reported.
  const guardContent = { modules: new Map([['data/x.js', [{ provenance: { publisher: 'Zebra Unlisted' }, text: 'About Dynatrace.' }]]]) };
  assert.equal(unlistedNames(guardContent, new Set(['example gazette']), 'guard').length, 2, 'guard');
  assert.equal(unlistedNames(guardContent, new Set(['zebra unlisted', 'dynatrace']), 'guard').length, 0, 'guard');

  const md = await readBrief(repoUrl('tests/fixtures/briefs/scanning-brief.md'), 'the fixture scanning brief is missing');
  const content = await loadContent({ from: 'fixtures' });
  assert.none(unlistedNames(content, entityNames([md]), 'tests/fixtures/briefs/'), 'unlisted names in the synthetic content');
});

test('M2-U2 every publisher, Dynatrace and OpenTelemetry in data/ is a named entity of the briefs', { needs: ['data'] }, async () => {
  const mds = [];
  for (const name of BRIEF_FILES) mds.push(await readBriefFile(name));
  const content = await loadContent({ from: 'data' });
  assert.none(unlistedNames(content, entityNames(mds), 'pipeline/briefs/'), 'unlisted names in data/');
});

// ------------------------------------------------------------------------------------------ M2-U3

const CATEGORIES = ['strategic alignment', 'resources', 'knowledge', 'culture', 'data'];

function paragraphs(markdown) {
  const out = [];
  let current = [];
  for (const line of String(markdown).normalize('NFC').split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line)) {
      if (current.length) out.push(current.join('\n'));
      current = [];
      continue;
    }
    current.push(line);
  }
  if (current.length) out.push(current.join('\n'));
  return out;
}

function dossierProblems(markdown) {
  const problems = [];
  const paras = paragraphs(markdown);
  const first = paras.find((p) => p.includes('Tracewell'));
  if (!first) problems.push('Tracewell is never named outside a heading');
  else if (!/fictional/i.test(first)) problems.push(`the paragraph that first names Tracewell does not say it is fictional: ${JSON.stringify(first.slice(0, 200))}`);
  for (const c of CATEGORIES) {
    if (wholeWordHits(markdown, [c]).length === 0) problems.push(`readiness category "${c}" is not named`);
  }
  const johnk = paras.find((p) => p.includes('Jöhnk') && p.includes('2021'));
  if (!johnk) problems.push('no citation of Jöhnk et al. (2021)');
  else {
    if (!/https:\/\/[^\s)>\]|]+/.test(johnk)) problems.push('the Jöhnk et al. (2021) citation has no https:// URL');
    const dates = johnk.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/g) || [];
    if (!dates.some(isIsoDate)) problems.push('the Jöhnk et al. (2021) citation has no ISO date');
  }
  return problems;
}

test('M2-U3 the persona dossier calls Tracewell fictional, names the five categories and cites Jöhnk et al. (2021)', async () => {
  // Guard: a complete sample passes; a sample missing each element fails on each.
  const good = '# Dossier\n\nTracewell is a fictional four-person team.\n\nStrategic alignment, resources, knowledge, culture and data.\n\n' +
    'Jöhnk et al. (2021), https://example.org/johnk, retrieved 2026-09-01.\n';
  assert.deepEqual(dossierProblems(good), []);
  assert.equal(dossierProblems('# Tracewell\n\nTracewell is a team.\n\nNothing else. Later: Tracewell is fictional.\n').length, 1 + 5 + 1, 'guard');

  const text = await readBriefFile('persona-dossier.md');
  assert.none(dossierProblems(text), 'persona dossier defects', 'pipeline/briefs/persona-dossier.md');
});

// ------------------------------------------------------------------------------------------ M2-U4

function windowProblems(markdown) {
  const w = windowLine(markdown);
  if (!w) return ['no line "Window: YYYY-MM-DD to YYYY-MM-DD"'];
  const problems = [];
  if (!isIsoDate(w.start)) problems.push(`window start ${JSON.stringify(w.start)} is not an ISO date`);
  if (!isIsoDate(w.end)) problems.push(`window end ${JSON.stringify(w.end)} is not an ISO date`);
  if (!problems.length && !(w.start < w.end)) problems.push(`window start ${w.start} is not before its end ${w.end}`);
  return problems;
}

test('M2-U4 the scanning brief has a Window line with two ISO dates, start before end', async () => {
  assert.deepEqual(windowProblems('Window: 2026-01-01 to 2026-03-31\n'), [], 'guard');
  assert.equal(windowProblems('Window: 2026-03-31 to 2026-01-01\n').length, 1, 'guard: reversed');
  assert.equal(windowProblems('Window: 2026-13-01 to 2026-03-31\n').length, 1, 'guard: malformed');
  assert.equal(windowProblems('Period: 2026-01-01 to 2026-03-31\n').length, 1, 'guard: missing');

  const text = await readBriefFile('scanning-brief.md');
  assert.none(windowProblems(text), 'Window line defects', 'pipeline/briefs/scanning-brief.md');
});

// ------------------------------------------------------------------------------------------ M2-U5

function replayProblems(markdown, windowStart, windowEnd) {
  const candidates = replayCandidates(markdown);
  if (!candidates.length) return ['no replay candidate (no ### heading)'];
  const problems = [];
  for (const c of candidates) {
    const at = `candidate "${c.heading}"`;
    for (const line of c.malformed) problems.push(`${at}: malformed line ${JSON.stringify(line)}`);
    if (!c.originals.length) problems.push(`${at}: no Original: line`);
    if (c.outcomes.length !== 1) problems.push(`${at}: ${c.outcomes.length} Outcome: lines, expected exactly one`);
    for (const item of [...c.originals, ...c.outcomes]) {
      if (!HTTPS.test(item.url)) problems.push(`${at}: ${JSON.stringify(item.line)} has no https:// URL`);
      if (!isIsoDate(item.date)) problems.push(`${at}: ${JSON.stringify(item.line)} has no ISO date`);
    }
    for (const o of c.originals) {
      if (isIsoDate(o.date) && (o.date < windowStart || o.date > windowEnd)) {
        problems.push(`${at}: original dated ${o.date} lies outside ${windowStart} to ${windowEnd}`);
      }
    }
    for (const out of c.outcomes) {
      if (!isIsoDate(out.date)) continue;
      if (out.date > OUTCOME_LATEST) problems.push(`${at}: outcome dated ${out.date} is later than ${OUTCOME_LATEST}`);
      for (const o of c.originals) {
        if (isIsoDate(o.date) && !(out.date > o.date)) problems.push(`${at}: outcome ${out.date} is not later than original ${o.date}`);
      }
    }
  }
  return problems;
}

test('M2-U5 every replay candidate has dated originals in the replay window and a later dated outcome', async () => {
  const W = ['2026-01-01', '2026-03-31'];
  const good = '### Zebra one\nOriginal: https://example.org/a (2026-01-01)\nOriginal: https://example.org/b (2026-03-31)\nOutcome: https://example.org/c (2026-09-30)\n';
  assert.deepEqual(replayProblems(good, ...W), [], 'guard');
  const bad = '### Zebra two\nOriginal: https://example.org/a (2025-12-31)\nOutcome: https://example.org/c (2026-10-01)\n' +
    '### Zebra three\nOriginal: https://example.org/a (2026-02-01)\nOutcome: https://example.org/c (2026-02-01)\n' +
    '### Zebra four\nOutcome: https://example.org/c\n';
  assert.equal(replayProblems(bad, ...W).length, 2 + 1 + 3, 'guard');

  const text = await readBriefFile('replay-candidates.md');
  const c = await importUnderTest(CONSTANTS);
  assert.ok(isIsoDate(c.REPLAY_WINDOW_START) && isIsoDate(c.REPLAY_WINDOW_END), 'constants.js holds the replay window as ISO dates');
  assert.none(replayProblems(text, c.REPLAY_WINDOW_START, c.REPLAY_WINDOW_END), 'replay candidate defects', 'pipeline/briefs/replay-candidates.md');
});
