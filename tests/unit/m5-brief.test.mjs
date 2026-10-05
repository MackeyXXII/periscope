// M5 Brief composer, pure part: unit tests M5-U1, M5-U3 and M5-U4.
// The DOM tests (M5-U2, M5-U5 to M5-U11) are in m5-brief.browser.mjs.
// Written from docs/04-module-design.md (M5) before assets/js/screens/brief.js exists (test-first
// rule).
//
// Status at G2: M5-U4 (fixture part) passes. M5-U1 fails until assets/js/contracts/constants.js and
// validate.js exist; M5-U3 fails until assets/js/screens/brief.js exists. data/ parts are skipped
// with "needs data/ (G3)".
//
// Note on M5-U1: besides the six-signal rejection the specification names, the test also requires
// checkBrief to accept the valid content brief, because a checkBrief that rejects everything would
// otherwise pass.

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { importUnderTest, repoUrl } from '../lib/env.mjs';
import { loadContent } from '../lib/content.mjs';
import { seededRandom, permute } from '../lib/seeded-random.mjs';

const CONSTANTS = repoUrl('assets/js/contracts/constants.js');
const VALIDATE = repoUrl('assets/js/contracts/validate.js');
const BRIEF_SCREEN = repoUrl('assets/js/screens/brief.js');

/** Calls a runtime check and classifies its verdict without ever letting it throw. */
function verdict(fn) {
  try {
    const r = fn();
    if (r && r.ok === true) return 'accepted';
    if (r && r.ok === false) return 'rejected';
    return `returned neither { ok: true } nor { ok: false } (${JSON.stringify(r)})`;
  } catch (error) {
    return `threw ${error && error.name}: ${error && error.message} (checks must never throw)`;
  }
}

// ------------------------------------------------------------------------------------------ M5-U1

async function capCheck(content) {
  const { BRIEF_SIGNAL_CAP } = await importUnderTest(CONSTANTS);
  assert.ok(Number.isInteger(BRIEF_SIGNAL_CAP) && BRIEF_SIGNAL_CAP > 0, 'BRIEF_SIGNAL_CAP is a positive integer');
  const count = content.brief.signalIds.length;
  assert.ok(count <= BRIEF_SIGNAL_CAP, `the brief holds ${count} signals, more than BRIEF_SIGNAL_CAP (${BRIEF_SIGNAL_CAP})`, content.from);
  const { checkBrief } = await importUnderTest(VALIDATE);
  assert.equal(typeof checkBrief, 'function', 'validate.js exports checkBrief');
  assert.equal(verdict(() => checkBrief(content.brief)), 'accepted', `checkBrief on the ${content.from} brief`);
  const six = (await import(repoUrl('tests/fixtures/invalid/brief-six-signals.js').href)).default;
  assert.equal(six.signalIds.length, 6, 'the invalid fixture holds six signals');
  assert.equal(verdict(() => checkBrief(six)), 'rejected', 'checkBrief on tests/fixtures/invalid/brief-six-signals.js');
}

test('M5-U1 the synthetic brief holds at most BRIEF_SIGNAL_CAP signals and checkBrief rejects a brief of six', async () => {
  await capCheck(await loadContent({ from: 'fixtures' }));
});

test('M5-U1 the brief in data/ holds at most BRIEF_SIGNAL_CAP signals', { needs: ['data'] }, async () => {
  await capCheck(await loadContent({ from: 'data' }));
});

// ------------------------------------------------------------------------------------------ M5-U3

test('M5-U3 orderSignals sorts newest first, ties by id, for ten seeded permutations', async () => {
  const content = await loadContent({ from: 'fixtures' });
  const byId = new Map(content.signals.map((s) => [s.id, s]));
  const briefSignals = content.brief.signalIds.map((id) => byId.get(id));
  assert.ok(briefSignals.every(Boolean), 'every brief signal resolves in the fixture');
  // The fixture's two signals of 2026-02-10 make the tie rule observable.
  const expected = [
    'sig-2026-06-15-zebra-epsilon',
    'sig-2026-05-20-zebra-delta',
    'sig-2026-03-04-zebra-gamma',
    'sig-2026-02-10-zebra-alpha',
    'sig-2026-02-10-zebra-beta',
  ];
  assert.deepEqual(briefSignals.map((s) => s.id).sort(), expected.slice().sort(), 'the fixture brief holds the expected five signals');

  const { orderSignals } = await importUnderTest(BRIEF_SCREEN);
  assert.equal(typeof orderSignals, 'function', 'brief.js exports orderSignals');
  const problems = [];
  const inputs = new Set();
  for (let seed = 1; seed <= 10; seed += 1) {
    const input = permute(briefSignals, seededRandom(seed));
    inputs.add(input.map((s) => s.id).join());
    const result = orderSignals(input);
    const ids = Array.isArray(result) ? result.map((s) => s && s.id) : result;
    if (JSON.stringify(ids) !== JSON.stringify(expected)) problems.push(`seed ${seed}: got ${JSON.stringify(ids)}`);
  }
  // Guard: the seeds produce more than one input order, so the test exercises the sort.
  assert.ok(inputs.size > 1, 'seeds 1 to 10 produce different input orders');
  assert.none(problems, `orders differing from ${JSON.stringify(expected)}`);
});

// ------------------------------------------------------------------------------------------ M5-U4

function orphans(content) {
  const inTrends = new Set(content.trends.flatMap((t) => t.signalIds || []));
  return content.brief.signalIds.filter((id) => !inTrends.has(id)).map((id) => `${id} belongs to no Trend`);
}

test('M5-U4 every signal in the synthetic brief belongs to at least one trend', async () => {
  const content = await loadContent({ from: 'fixtures' });
  const guard = { brief: { signalIds: [...content.brief.signalIds, 'sig-2026-01-01-zebra-orphan'] }, trends: content.trends };
  assert.deepEqual(orphans(guard), ['sig-2026-01-01-zebra-orphan belongs to no Trend'], 'guard');
  assert.none(orphans(content), 'orphan signals in the brief');
});

test('M5-U4 every signal in the brief in data/ belongs to at least one trend', { needs: ['data'] }, async () => {
  assert.none(orphans(await loadContent({ from: 'data' })), 'orphan signals in the brief in data/');
});
