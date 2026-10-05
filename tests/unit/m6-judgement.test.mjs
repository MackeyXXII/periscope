// M6 Judgement and scenario capture, F1: the pure parts of M6-U3, M6-U5 to M6-U8 and M6-U13,
// including the state-level refusals of Red-team finding B4 (M6-U3, M6-U5).
// The page parts, and M6-U1, U2, U4, U9 to U12 and U14 to U17, are in m6-judgement.browser.mjs.
// Written from docs/04-module-design.md (M6) and docs/03-architecture.md (sections 6.3, 7) before
// any M6 module exists (test-first rule). At G2 every test here fails with "module under test could
// not be imported" (assets/js/state/*.js not implemented).
//
// The interface is the M6 drafts and return-shape table of docs/04-module-design.md (revised
// 5 October 2026): drafts use the Judgement's field names (canRecord({ gutCall, reason }),
// canCommit({ committedLens, rationale }), "no lens" is null); recordIntuition returns the frozen
// intuition record; markReadingsRevealed(session, trendId, now) stamps readingsRevealedAt and
// throws without an intuition record or when called twice; commitJudgement returns the frozen
// Judgement and throws if markReadingsRevealed has not been called; whatIsMissing returns one of
// the four hint texts; stageOf returns the trend's stage. `now` is an ISO timestamp string.
// The pure walks below therefore go recordIntuition -> markReadingsRevealed -> commitJudgement.

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { loadContent, loadSession, clone } from '../lib/content.mjs';
import { seededRandom, permutations } from '../lib/seeded-random.mjs';
import { load, makeClock } from '../lib/screens.mjs';

const ALPHA = 'trend-fixture-alpha';
const BETA = 'trend-fixture-beta';
const ORDERS = Object.freeze([
  ['opportunity', 'threat', 'noise'],
  ['threat', 'opportunity', 'noise'],
  ['threat', 'noise', 'opportunity'],
  ['noise', 'threat', 'opportunity'],
  ['opportunity', 'noise', 'threat'],
  ['noise', 'opportunity', 'threat'],
]);
const STUBS = Object.freeze([[0, 0], [0, 0.5], [0.34, 0], [0.34, 0.5], [0.67, 0], [0.67, 0.5]]);

/** A random source returning the given values in turn, counting its calls. */
function stub(values) {
  const fn = () => {
    fn.calls += 1;
    return values[(fn.calls - 1) % values.length];
  };
  fn.calls = 0;
  return fn;
}

/** Records and commits on one trend through the pure interface; returns { intuition, judgement }. */
function pureWalk(S, session, trendId, clock, { gutCall = 'threat', reason = 'zebra-test-reason', committedLens = 'noise', rationale = 'zebra-test-rationale' } = {}) {
  S.lensOrderFor(session, trendId);
  const intuition = S.recordIntuition(session, trendId, { gutCall, reason }, clock());
  S.markReadingsRevealed(session, trendId, clock());
  const judgement = S.commitJudgement(session, trendId, { committedLens, rationale, promptAnswers: [] }, clock());
  return { intuition, judgement };
}

// ------------------------------------------------------------------------------------------ M6-U3

test('M6-U3 canCommit is false without a lens or with a whitespace-only rationale, true with both', async () => {
  const S = await load('session');
  const cases = [
    { draft: { committedLens: 'threat', rationale: '' }, want: false },
    { draft: { committedLens: 'threat', rationale: ' ' }, want: false },
    { draft: { committedLens: 'threat', rationale: '\n\t ' }, want: false },
    { draft: { committedLens: null, rationale: 'x' }, want: false },
    { draft: { committedLens: 'threat', rationale: 'x' }, want: true },
  ];
  const problems = [];
  for (const { draft, want } of cases) {
    let got;
    try {
      got = S.canCommit(draft);
    } catch (error) {
      problems.push(`canCommit(${JSON.stringify(draft)}) threw: ${error.message}`);
      continue;
    }
    if (got !== want) problems.push(`canCommit(${JSON.stringify(draft)}) returned ${JSON.stringify(got)}, expected ${want}`);
  }
  assert.none(problems, 'canCommit errors');
});

test('M6-U3 whatIsMissing names exactly what is missing, in the specified words', async () => {
  const S = await load('session');
  const cases = [
    { draft: { committedLens: null, rationale: '' }, want: 'Choose a reading and write a rationale to commit your judgement.' },
    { draft: { committedLens: null, rationale: ' \n' }, want: 'Choose a reading and write a rationale to commit your judgement.' },
    { draft: { committedLens: null, rationale: 'x' }, want: 'Choose a reading to commit your judgement.' },
    { draft: { committedLens: 'threat', rationale: '' }, want: 'Write a rationale to commit your judgement.' },
    { draft: { committedLens: 'threat', rationale: '\n\t ' }, want: 'Write a rationale to commit your judgement.' },
    { draft: { committedLens: 'threat', rationale: 'x' }, want: '' },
  ];
  const problems = [];
  for (const { draft, want } of cases) {
    let got;
    try {
      got = S.whatIsMissing(draft);
    } catch (error) {
      problems.push(`whatIsMissing(${JSON.stringify(draft)}) threw: ${error.message}`);
      continue;
    }
    if (got !== want) problems.push(`whatIsMissing(${JSON.stringify(draft)}) returned ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
  }
  assert.none(problems, 'whatIsMissing errors');
});

test('M6-U3 below the UI, commitJudgement refuses every draft the gate refuses and leaves the stage unchanged (B4)', async () => {
  const S = await load('session');
  const session = S.createSession({ random: seededRandom(3) });
  const clock = makeClock();
  S.lensOrderFor(session, ALPHA);
  S.recordIntuition(session, ALPHA, { gutCall: 'threat', reason: 'zebra-test-reason' }, clock());
  const revealedAt = S.markReadingsRevealed(session, ALPHA, clock());
  assert.equal(S.stageOf(session, ALPHA), 'intuition-recorded', 'stage before the refused calls');
  const refused = [
    { label: 'rationale ""', draft: { committedLens: 'threat', rationale: '', promptAnswers: [] }, now: clock() },
    { label: 'rationale " "', draft: { committedLens: 'threat', rationale: ' ', promptAnswers: [] }, now: clock() },
    { label: 'rationale of a newline, a tab and a space', draft: { committedLens: 'threat', rationale: '\n\t ', promptAnswers: [] }, now: clock() },
    { label: 'no lens', draft: { committedLens: null, rationale: 'x', promptAnswers: [] }, now: clock() },
    // Passes canCommit, but the Judgement it assembles fails checkJudgement: committedAt earlier
    // than readingsRevealedAt.
    {
      label: 'now earlier than readingsRevealedAt',
      draft: { committedLens: 'threat', rationale: 'zebra-test-rationale', promptAnswers: [] },
      now: new Date(Date.parse(revealedAt || '2026-10-05T09:00:01.000Z') - 60000).toISOString(),
    },
  ];
  assert.ok(S.canCommit(refused[4].draft), 'the last refused draft passes canCommit, so only checkJudgement can refuse it');
  const problems = [];
  for (const { label, draft, now } of refused) {
    let committed = false;
    try {
      S.commitJudgement(session, ALPHA, draft, now);
      committed = true;
    } catch {
      // refused, as specified
    }
    if (committed) {
      problems.push(`${label}: commitJudgement did not throw`);
      break; // the session is now committed; later cases would not test what they say
    }
    const stage = S.stageOf(session, ALPHA);
    if (stage !== 'intuition-recorded') problems.push(`${label}: the refused call changed the stage to ${JSON.stringify(stage)}`);
  }
  assert.none(problems, 'refused drafts that were committed or changed the session');
  const judgement = S.commitJudgement(session, ALPHA, { committedLens: 'noise', rationale: 'zebra-test-rationale', promptAnswers: [] }, clock());
  assert.equal(judgement.committedLens, 'noise', 'a following valid commit succeeds');
  assert.equal(S.stageOf(session, ALPHA), 'committed', 'stage after the valid commit');
});

// ------------------------------------------------------------------------------------------ M6-U5

test('M6-U5 recordIntuition refuses a draft canRecord refuses and leaves the trend awaiting intuition (B4)', async () => {
  const S = await load('session');
  const session = S.createSession({ random: seededRandom(5) });
  const clock = makeClock();
  S.lensOrderFor(session, ALPHA);
  const refused = [
    { gutCall: null, reason: 'x' },
    { gutCall: null, reason: null },
    { gutCall: 'verified', reason: 'x' },
  ];
  const problems = [];
  for (const draft of refused) {
    if (S.canRecord(draft) !== false) problems.push(`canRecord(${JSON.stringify(draft)}) is not false`);
    let recorded = false;
    try {
      S.recordIntuition(session, ALPHA, draft, clock());
      recorded = true;
    } catch {
      // refused, as specified
    }
    if (recorded) {
      problems.push(`recordIntuition(${JSON.stringify(draft)}) did not throw`);
      break;
    }
    const stage = S.stageOf(session, ALPHA);
    if (stage !== 'awaiting-intuition') problems.push(`${JSON.stringify(draft)}: the refused call changed the stage to ${JSON.stringify(stage)}`);
  }
  assert.none(problems, 'refused drafts that were recorded or changed the session');
  // No intuition record exists: the reveal stamp, which requires one, still throws.
  assert.throws(() => S.markReadingsRevealed(session, ALPHA, clock()), undefined, 'no intuition record exists after the refused calls');
  const record = S.recordIntuition(session, ALPHA, { gutCall: 'threat', reason: null }, clock());
  assert.equal(record.gutCall, 'threat', 'a following valid record succeeds');
});

test('M6-U5 the recorded intuition is frozen and a second record for the trend throws', async () => {
  const S = await load('session');
  const session = S.createSession({ random: seededRandom(5) });
  const clock = makeClock();
  S.lensOrderFor(session, ALPHA);
  const record = S.recordIntuition(session, ALPHA, { gutCall: 'threat', reason: 'zebra-test-reason' }, clock());
  assert.ok(record && typeof record === 'object', 'recordIntuition returns the intuition record');
  assert.ok(Object.isFrozen(record), 'the intuition record satisfies Object.isFrozen');
  assert.equal(record.gutCall, 'threat', 'the record holds the gut call');
  try {
    record.gutCall = 'noise';
  } catch {
    // strict mode: assigning to a frozen property throws, which is also a pass
  }
  assert.equal(record.gutCall, 'threat', 'assigning to gutCall leaves it unchanged');
  assert.throws(
    () => S.recordIntuition(session, ALPHA, { gutCall: 'noise', reason: null }, clock()),
    undefined,
    'a second recordIntuition for the same trend must throw',
  );
});

// ------------------------------------------------------------------------------------------ M6-U6

test('M6-U6 the committed Judgement is frozen and a second commit throws', async () => {
  const S = await load('session');
  const session = S.createSession({ random: seededRandom(6) });
  const clock = makeClock();
  const { judgement } = pureWalk(S, session, ALPHA, clock);
  assert.ok(judgement && typeof judgement === 'object', 'commitJudgement returns the Judgement');
  assert.ok(Object.isFrozen(judgement), 'the Judgement satisfies Object.isFrozen');
  try {
    judgement.rationale = 'changed';
  } catch {
    // strict mode: throws on a frozen object
  }
  assert.equal(judgement.rationale, 'zebra-test-rationale', 'the rationale cannot be changed');
  assert.throws(
    () => S.commitJudgement(session, ALPHA, { committedLens: 'threat', rationale: 'again', promptAnswers: [] }, clock()),
    undefined,
    'a second commitJudgement for the same trend must throw',
  );
});

// ------------------------------------------------------------------------------------------ M6-U7

test('M6-U7 drawLensOrder maps the six stub sequences to the six orders, twice-called and frozen', async () => {
  const LO = await load('lensOrder');
  const problems = [];
  STUBS.forEach((values, i) => {
    const random = stub(values);
    let order;
    try {
      order = LO.drawLensOrder(random);
    } catch (error) {
      problems.push(`stub ${JSON.stringify(values)}: threw ${error.message}`);
      return;
    }
    if (JSON.stringify(Array.from(order || [])) !== JSON.stringify(ORDERS[i])) {
      problems.push(`stub ${JSON.stringify(values)}: got ${JSON.stringify(order)}, expected ${JSON.stringify(ORDERS[i])}`);
    }
    if (random.calls !== 2) problems.push(`stub ${JSON.stringify(values)}: random called ${random.calls} times, expected exactly 2`);
    if (!Object.isFrozen(order)) problems.push(`stub ${JSON.stringify(values)}: the returned array is not frozen`);
  });
  assert.none(problems, 'drawLensOrder errors');
});

test('M6-U7 drawLensOrder throws RangeError for a random value of 1, -0.1 or NaN', async () => {
  const LO = await load('lensOrder');
  for (const bad of [1, -0.1, NaN]) {
    assert.throws(() => LO.drawLensOrder(() => bad), RangeError, `random() returning ${bad}`);
  }
  // A value outside [0, 1) on the second call must be caught as well.
  assert.throws(() => LO.drawLensOrder(stub([0.5, 1])), RangeError, 'random() returning 1 on its second call');
});

test('M6-U7 with seededRandom seeds 1 to 200 all six orders occur', async () => {
  const LO = await load('lensOrder');
  const seen = new Set();
  for (let seed = 1; seed <= 200; seed += 1) seen.add(JSON.stringify(Array.from(LO.drawLensOrder(seededRandom(seed)))));
  const missing = ORDERS.map((o) => JSON.stringify(o)).filter((o) => !seen.has(o));
  assert.none(missing, 'orders never drawn with seeds 1 to 200');
  assert.equal(seen.size, 6, 'exactly the six orders of the three lenses are drawn');
});

test('M6-U7 orderReadings follows lensOrder for every permutation of the input and throws for two readings', async () => {
  const LO = await load('lensOrder');
  const content = await loadContent({ from: 'fixtures' });
  const readings = clone(content.reveal[ALPHA].readings);
  const problems = [];
  for (const lensOrder of ORDERS) {
    for (const input of permutations(readings)) {
      let out;
      try {
        out = LO.orderReadings(input, Object.freeze(lensOrder.slice()));
      } catch (error) {
        problems.push(`lensOrder ${lensOrder}, input ${input.map((r) => r.lens)}: threw ${error.message}`);
        continue;
      }
      const got = Array.from(out).map((r) => r.lens);
      if (JSON.stringify(got) !== JSON.stringify(lensOrder)) {
        problems.push(`lensOrder ${lensOrder}, input ${input.map((r) => r.lens)}: got ${got}`);
      }
      if (out === input) problems.push('orderReadings returned its input array instead of a new array');
    }
  }
  assert.none(problems, 'orderReadings errors');
  assert.throws(() => LO.orderReadings(readings.slice(0, 2), ORDERS[0]), undefined, 'orderReadings with two readings must throw');
});

// ------------------------------------------------------------------------------------------ M6-U8

test('M6-U8 one lens order per trend per session; trend B untouched by work on trend A', async () => {
  const S = await load('session');
  const LO = await load('lensOrder');
  const session = S.createSession({ random: stub([0, 0]) });
  const clock = makeClock();
  const first = S.lensOrderFor(session, ALPHA);
  const second = S.lensOrderFor(session, ALPHA);
  assert.ok(first === second, 'lensOrderFor returns the same array (===) on a second call');
  assert.deepEqual(Array.from(first), ORDERS[0], 'the order is the one the session random source draws');
  assert.equal(S.stageOf(session, BETA), 'awaiting-intuition', 'B before any work');
  pureWalk(S, session, ALPHA, clock);
  assert.ok(S.lensOrderFor(session, ALPHA) === first, 'the order of A is unchanged after recording and committing');
  assert.equal(S.stageOf(session, ALPHA), 'committed', 'A after recording and committing');
  assert.equal(S.stageOf(session, BETA), 'awaiting-intuition', 'B after recording and committing on A');
  // B is still awaiting its intuition: its first record succeeds and is B's own.
  const bRecord = S.recordIntuition(session, BETA, { gutCall: 'opportunity', reason: null }, clock());
  assert.equal(bRecord.gutCall, 'opportunity', 'trend B accepts its own first intuition record after A was committed');
  // A new session with a different source draws a different order.
  const other = S.createSession({ random: stub([0.67, 0.5]) });
  assert.deepEqual(Array.from(S.lensOrderFor(other, ALPHA)), ORDERS[5], 'a new session draws with its own source');
  assert.deepEqual(Array.from(LO.drawLensOrder(stub([0.67, 0.5]))), ORDERS[5], 'and agrees with drawLensOrder');
});

// ------------------------------------------------------------------------------------------ M6-U13

test('M6-U13 the Judgement of a full walk passes checkJudgement with ordered timestamps and viewer provenance', async () => {
  const S = await load('session');
  const V = await load('validate');
  const session = S.createSession({ random: seededRandom(13) });
  const clock = makeClock();
  // Stage order (the M6 interface): no reveal stamp without an intuition record, and no commit
  // before the readings were revealed; a second stamp throws.
  assert.throws(() => S.markReadingsRevealed(session, ALPHA, clock()), undefined, 'markReadingsRevealed before recordIntuition must throw');
  S.recordIntuition(session, BETA, { gutCall: 'threat', reason: null }, clock());
  assert.throws(
    () => S.commitJudgement(session, BETA, { committedLens: 'noise', rationale: 'zebra-test-rationale', promptAnswers: [] }, clock()),
    undefined,
    'commitJudgement before markReadingsRevealed must throw',
  );
  S.markReadingsRevealed(session, BETA, clock());
  assert.throws(() => S.markReadingsRevealed(session, BETA, clock()), undefined, 'a second markReadingsRevealed must throw');
  const { judgement } = pureWalk(S, session, ALPHA, clock);
  const verdict = V.checkJudgement(judgement);
  assert.ok(verdict && verdict.ok === true, `checkJudgement accepts the Judgement (${JSON.stringify(verdict && verdict.errors)})`);
  assert.equal(judgement.trendId, ALPHA, 'trendId');
  assert.ok(judgement.intuition && typeof judgement.intuition.recordedAt === 'string', 'intuition.recordedAt is set');
  assert.ok(typeof judgement.readingsRevealedAt === 'string', 'readingsRevealedAt is set');
  const t1 = Date.parse(judgement.intuition.recordedAt);
  const t2 = Date.parse(judgement.readingsRevealedAt);
  const t3 = Date.parse(judgement.committedAt);
  assert.ok(t1 <= t2 && t2 <= t3, `recordedAt ${judgement.intuition.recordedAt} <= readingsRevealedAt ${judgement.readingsRevealedAt} <= committedAt ${judgement.committedAt}`);
  assert.equal(judgement.label, 'yours', 'label');
  assert.deepEqual(Array.from(judgement.provenance.producedBy), ['viewer'], 'provenance.producedBy');
  assert.equal(judgement.provenance.frozenOn, null, 'provenance.frozenOn');
  // The session sample has the same shape, so the two agree on what a Judgement is.
  const { judgement: sample } = await loadSession();
  assert.deepEqual(Object.keys(judgement).sort(), Object.keys(sample).sort(), 'the Judgement has exactly the fields of the contract sample');
});
