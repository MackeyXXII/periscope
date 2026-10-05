// M7 Readiness and maturity: the unit tests that run in both runners, M7-U1 (content part), M7-U6,
// M7-U9 and M7-U10. The screen tests (M7-U1 screen part, M7-U2 to M7-U5, M7-U7, M7-U8, M7-U11) are
// in m7-readiness.browser.mjs.
// Written from docs/04-module-design.md (M7) and docs/02-system-requirements.md (F3) before the
// readiness and governance screens exist (test-first rule).
//
// Status at G2: every fixture part passes (status T); the data/ parts are skipped with "needs data/
// (G3)" and the verified data/ parts also with "maturity unverified (D-1)"; M7-U6's check of
// verifiedBy against the module design reads that document as raw text, so in the browser it is
// skipped with "needs Node".

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { readText, repoUrl } from '../lib/env.mjs';
import { loadContent, clone } from '../lib/content.mjs';
import { C6_TERMS, wholeWordHits } from '../lib/text-rules.mjs';

const CATEGORY_ORDER = Object.freeze(['strategic-alignment', 'resources', 'knowledge', 'culture', 'data']);
const PRACTICE_ORDER = Object.freeze(['scanning', 'trend-analysis', 'scenario-work']);
const REPORT_DOI = 'https://doi.org/10.1787/aa573076-en';

// ------------------------------------------------------------------------------------------ M7-U1

export function readinessStructureProblems(profile, file) {
  const problems = [];
  const categories = Array.isArray(profile && profile.categories) ? profile.categories : [];
  const keys = categories.map((c) => c.key);
  if (JSON.stringify(keys) !== JSON.stringify(CATEGORY_ORDER)) {
    problems.push(`${file}: categories ${JSON.stringify(keys)}, expected exactly ${JSON.stringify(CATEGORY_ORDER)} in that order`);
  }
  categories.forEach((c, i) => {
    if (!Array.isArray(c.answers) || c.answers.length < 1) problems.push(`${file} /categories/${i}: no answer`);
    if (typeof c.finding !== 'string' || c.finding.trim() === '') problems.push(`${file} /categories/${i}: empty finding`);
  });
  const practices = profile && profile.maturity && Array.isArray(profile.maturity.practices) ? profile.maturity.practices : [];
  const pkeys = practices.map((p) => p.key);
  if (JSON.stringify(pkeys) !== JSON.stringify(PRACTICE_ORDER)) {
    problems.push(`${file}: practices ${JSON.stringify(pkeys)}, expected exactly ${JSON.stringify(PRACTICE_ORDER)} in that order`);
  }
  return problems;
}

test('M7-U1 both readiness fixtures hold the five categories and three practices in the fixed orders', async () => {
  const c = await loadContent({ from: 'fixtures' });
  // Guard: a swapped order and a missing finding are detected.
  const swapped = clone(c.readiness);
  [swapped.categories[0], swapped.categories[1]] = [swapped.categories[1], swapped.categories[0]];
  swapped.categories[2].finding = ' ';
  assert.ok(readinessStructureProblems(swapped, 'guard').length >= 2, 'the check detects a swapped order and an empty finding');
  assert.none(
    [
      ...readinessStructureProblems(c.readiness, 'tests/fixtures/content/readiness-unverified.js'),
      ...readinessStructureProblems(c.readinessVerified, 'tests/fixtures/content/readiness-verified.js'),
    ],
    'readiness structure problems',
  );
});

test('M7-U1 the readiness profile in data/ holds the five categories and three practices in the fixed orders', { needs: ['data'] }, async () => {
  const c = await loadContent({ from: 'data' });
  assert.none(readinessStructureProblems(c.readiness, 'data/readiness.js'), 'readiness structure problems in data/');
});

// ------------------------------------------------------------------------------------------ M7-U6

const REQUIRED_IMPLEMENTED = Object.freeze([
  'open-web-sources-frozen', 'no-viewer-data-stored-or-sent', 'no-live-ai', 'no-accounts-cookies-analytics',
]);
const REQUIRED_NOT_IMPLEMENTED = Object.freeze(['own-data-ingestion', 'cross-session-persistence', 'role-aware-model']);

export function governanceItemProblems(g, file) {
  const problems = [];
  const ids = (list) => (Array.isArray(list) ? list.map((i) => i && i.id) : []);
  for (const id of REQUIRED_IMPLEMENTED) if (!ids(g.implemented).includes(id)) problems.push(`${file}: implemented item ${id} missing`);
  for (const id of REQUIRED_NOT_IMPLEMENTED) if (!ids(g.notImplemented).includes(id)) problems.push(`${file}: not-implemented item ${id} missing`);
  // N5: every item of both lists names the tests that verify it.
  for (const [name, list] of [['implemented', g.implemented], ['notImplemented', g.notImplemented]]) {
    for (const item of list || []) {
      if (!Array.isArray(item.verifiedBy) || item.verifiedBy.length === 0) problems.push(`${file}: ${name} item ${item.id} has no verifiedBy`);
    }
  }
  return problems;
}

function verifiedByIds(g) {
  const out = [];
  for (const list of [g.implemented, g.notImplemented]) {
    for (const item of list || []) for (const id of item.verifiedBy || []) out.push({ item: item.id, id });
  }
  return out;
}

/**
 * Problems with verifiedBy identifiers: an audit outside 1 to 6, a unit test not in `rowIds`, or a
 * unit test in `deferredIds` (a deferred test verifies nothing in this release).
 */
export function testIdProblems(entries, rowIds, file, deferredIds = new Set()) {
  const problems = [];
  for (const { item, id } of entries) {
    const audit = /^AUDIT-(\d+)$/.exec(id);
    if (audit) {
      const n = Number(audit[1]);
      if (!(n >= 1 && n <= 6) || audit[1] !== String(n)) problems.push(`${file} ${item}: ${id} is not an audit AUDIT-1 to AUDIT-6`);
    } else if (/^M\d+-U\d+$/.test(id)) {
      if (rowIds && !rowIds.has(id)) problems.push(`${file} ${item}: ${id} is not a unit-test row in docs/04-module-design.md`);
      else if (deferredIds.has(id)) problems.push(`${file} ${item}: ${id} is Deferred (F5 static, decision of 5 Oct 2026) and verifies nothing in this release`);
    } else {
      problems.push(`${file} ${item}: ${id} is neither a unit test nor an audit`);
    }
  }
  return problems;
}

/**
 * The unit-test rows of docs/04-module-design.md: every identifier, and those whose status (the last
 * cell of the row) is Deferred as a whole. A row with only a deferred part (status "I; … part:
 * Deferred …") is not a deferred test.
 */
async function moduleDesignRows() {
  const text = await readText(repoUrl('docs/04-module-design.md'));
  const ids = new Set();
  const deferred = new Set();
  for (const m of text.matchAll(/^\|\s*(M\d+-U\d+)\b.*$/gm)) {
    ids.add(m[1]);
    const cells = m[0].split('|').map((c) => c.trim()).filter((c) => c !== '');
    if (/^Deferred\b/.test(cells[cells.length - 1])) deferred.add(m[1]);
  }
  return { ids, deferred };
}

async function governanceIdCheck(g, file) {
  const problems = governanceItemProblems(g, file);
  // The audit range does not need the design document, so it is checked before the raw-text read.
  problems.push(...testIdProblems(verifiedByIds(g), null, file));
  assert.none(problems, 'governance item problems');
  const { ids: rows, deferred } = await moduleDesignRows(); // skips in the browser: "needs Node"
  assert.ok(rows.has('M7-U6') && rows.has('M10-U9') && rows.has('M1-U1'), 'the row identifiers were read from the module design');
  assert.ok(deferred.has('M6-U18') && deferred.has('M1-U19') && !deferred.has('M1-U12') && !deferred.has('M6-U24'), 'the deferred rows were read from the status column');
  // Guard: unknown and deferred identifiers are detected.
  const guard = testIdProblems(
    [{ item: 'g', id: 'M99-U1' }, { item: 'g', id: 'AUDIT-7' }, { item: 'g', id: 'AUDIT-0' }, { item: 'g', id: 'T-1' }, { item: 'g', id: 'M6-U25' }],
    rows, 'guard', deferred,
  );
  assert.equal(guard.length, 5, 'every unknown or deferred identifier in the guard is detected');
  assert.none(testIdProblems(verifiedByIds(g), rows, file, deferred), 'unknown or deferred verifiedBy identifiers');
}

test('M7-U6 the synthetic governance content holds the required items and only known test identifiers', async () => {
  const c = await loadContent({ from: 'fixtures' });
  // Guard (N5): a not-implemented item without verifiedBy, or with an empty one, is detected.
  const bad = clone(c.governance);
  delete bad.notImplemented[0].verifiedBy;
  bad.notImplemented[1].verifiedBy = [];
  assert.equal(governanceItemProblems(bad, 'guard').length, 2, 'missing and empty verifiedBy are detected');
  await governanceIdCheck(c.governance, 'tests/fixtures/content/governance.js');
});

test('M7-U6 the governance content in data/ holds the required items and only known test identifiers', { needs: ['data'] }, async () => {
  const c = await loadContent({ from: 'data' });
  await governanceIdCheck(c.governance, 'data/governance.js');
});

// ------------------------------------------------------------------------------------------ M7-U9

const K2_WORDS = Object.freeze([
  'you', 'your', 'we', 'our', 'should', 'must', 'need', 'needs', 'recommend', 'recommended', 'recommendation',
  'advise', 'advice', 'Tracewell', 'team',
]);

/** K-2 wording problems of every next-level description in a profile. Returns { problems, checked }. */
export function nextLevelWordingProblems(profile, file) {
  const problems = [];
  let checked = 0;
  const practices = (profile.maturity && profile.maturity.practices) || [];
  practices.forEach((p, i) => {
    const nl = p.nextLevel;
    if (!nl || !nl.description) return;
    checked += 1;
    const where = `${file} /maturity/practices/${i} (${p.key})`;
    const text = String(nl.description.text || '');
    if (!text.startsWith('The report describes')) problems.push(`${where}: does not begin with "The report describes"`);
    const words = wholeWordHits(text, K2_WORDS);
    if (words.length) problems.push(`${where}: contains ${words.join(', ')}`);
    if (wholeWordHits(text, ['next step']).length) problems.push(`${where}: contains "next step"`);
    const c6 = wholeWordHits(text, C6_TERMS);
    if (c6.length) problems.push(`${where}: contains C-6 term(s) ${c6.join(', ')}`);
    const cite = nl.citation || {};
    if (cite.url !== REPORT_DOI) problems.push(`${where}: citation url ${JSON.stringify(cite.url)}, expected ${REPORT_DOI}`);
    if (typeof cite.publishedOn !== 'string' || cite.publishedOn.slice(0, 4) !== '2025') problems.push(`${where}: citation year is not 2025 (${JSON.stringify(cite.publishedOn)})`);
    if (typeof cite.title !== 'string' || cite.title.trim() === '') problems.push(`${where}: citation has no title`);
    if (typeof cite.page !== 'string' || cite.page.trim() === '') problems.push(`${where}: citation has no page`);
  });
  return { problems, checked };
}

test('M7-U9 every next-level description in the verified fixture meets the K-2 wording constraints', async () => {
  const c = await loadContent({ from: 'fixtures' });
  // Guard: each constraint can fail.
  const bad = clone(c.readinessVerified);
  const nl = bad.maturity.practices[0].nextLevel;
  nl.description.text = 'Your team should take the best next step.';
  nl.citation.url = 'https://example.org/fixture/not-the-report';
  nl.citation.publishedOn = '2024-01-01';
  delete nl.citation.page;
  assert.ok(nextLevelWordingProblems(bad, 'guard').problems.length >= 7, 'the guard description fails every constraint');
  const { problems, checked } = nextLevelWordingProblems(c.readinessVerified, 'tests/fixtures/content/readiness-verified.js');
  assert.ok(checked >= 2, `next-level descriptions were checked (${checked})`);
  assert.none(problems, 'K-2 wording violations');
});

test('M7-U9 every next-level description in data/ meets the K-2 wording constraints', { needs: ['data', 'verified'] }, async () => {
  const c = await loadContent({ from: 'data' });
  const { problems, checked } = nextLevelWordingProblems(c.readiness, 'data/readiness.js');
  assert.ok(checked >= 1, 'at least one next-level description exists in the verified data');
  assert.none(problems, 'K-2 wording violations in data/');
});

// ------------------------------------------------------------------------------------------ M7-U10

export function lowerLevelRuleProblems(profile, file) {
  const problems = [];
  if (!profile.maturity || profile.maturity.status !== 'verified') return problems;
  profile.maturity.practices.forEach((p, i) => {
    const where = `${file} /maturity/practices/${i} (${p.key})`;
    const ex = p.explanation || {};
    // B1: the explanation's text is generatedText, so the prose is explanation.text.text.
    const prose = ex.text && typeof ex.text === 'object' ? ex.text.text : undefined;
    if (p.betweenLevels && !/lower level/i.test(String(prose || ''))) problems.push(`${where}: between two levels, but the explanation does not state the lower-level rule`);
    const cite = ex.citation || {};
    if (cite.url !== REPORT_DOI) problems.push(`${where}: explanation does not cite ${REPORT_DOI}`);
    if (typeof cite.page !== 'string' || cite.page.trim() === '') problems.push(`${where}: explanation citation has no page`);
  });
  return problems;
}

test('M7-U10 the verified fixture states the lower-level rule and cites the report with a page', async () => {
  const c = await loadContent({ from: 'fixtures' });
  const v = c.readinessVerified;
  assert.ok(v.maturity.practices.some((p) => p.betweenLevels), 'the fixture has a practice between two levels');
  const bad = clone(v);
  const between = bad.maturity.practices.find((p) => p.betweenLevels);
  between.explanation.text.text = 'zebra-guard: an explanation that omits the rule.';
  delete bad.maturity.practices[1].explanation.citation.page;
  assert.equal(lowerLevelRuleProblems(bad, 'guard').length, 2, 'the guard omissions are detected');
  assert.none(lowerLevelRuleProblems(v, 'tests/fixtures/content/readiness-verified.js'), 'lower-level rule omissions');
});

test('M7-U10 the verified profile in data/ states the lower-level rule and cites the report with a page', { needs: ['data', 'verified'] }, async () => {
  const c = await loadContent({ from: 'data' });
  assert.none(lowerLevelRuleProblems(c.readiness, 'data/readiness.js'), 'lower-level rule omissions in data/');
});
