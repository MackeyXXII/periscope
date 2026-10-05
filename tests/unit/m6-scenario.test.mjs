// M6 Judgement and scenario capture, F5: the pure parts of M6-U19, M6-U21 and M6-U24, and the
// G3/Q part of M6-U24. The page parts, and M6-U18, U20, U22, U23, U25 and U26, are in
// m6-scenario.browser.mjs. Written from docs/04-module-design.md (M6), docs/02-system-requirements.md
// (F5) and docs/03-architecture.md (section 6.4) before any M6 module exists (test-first rule).
// At G2 every test here fails with "module under test could not be imported"; the data part of
// M6-U24 is skipped with "needs data/ (G3); SCENARIO_FLOW is static (O-1)".
//
// The interface is the M6 drafts and return-shape table of docs/04-module-design.md (revised
// 5 October 2026): the session functions (createSession, lensOrderFor, recordIntuition,
// markReadingsRevealed, commitJudgement) come from assets/js/state/session.js; canRecordScenario,
// whatIsMissingScenario, recordScenario, setQuestionNote, snapshotScenario and scenarioMode from
// assets/js/state/scenario.js. Drafts are { whatWasHeard, howItCouldPlayOut }; recordScenario
// returns the frozen { trendId, whatWasHeard, howItCouldPlayOut, recordedAt }; `now` is an ISO
// timestamp string. The committed Judgement comes from
// recordIntuition -> markReadingsRevealed -> commitJudgement.

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { loadContent, clone } from '../lib/content.mjs';
import { seededRandom } from '../lib/seeded-random.mjs';
import { importUnderTest, repoUrl } from '../lib/env.mjs';
import { load, makeClock } from '../lib/screens.mjs';

const ALPHA = 'trend-fixture-alpha';

const SESSION_FUNCTIONS = ['createSession', 'lensOrderFor', 'recordIntuition', 'markReadingsRevealed', 'commitJudgement'];
const SCENARIO_FUNCTIONS = ['canRecordScenario', 'whatIsMissingScenario', 'recordScenario', 'setQuestionNote', 'snapshotScenario', 'scenarioMode'];

/** Each function from the file the M6 interface table places it in. */
async function scenarioApi() {
  const [S, Sc] = await Promise.all([load('session'), load('scenarioState')]);
  const api = {};
  for (const name of SESSION_FUNCTIONS) {
    assert.equal(typeof S[name], 'function', `state/session.js exports ${name}`);
    api[name] = S[name];
  }
  for (const name of SCENARIO_FUNCTIONS) {
    assert.equal(typeof Sc[name], 'function', `state/scenario.js exports ${name}`);
    api[name] = Sc[name];
  }
  return api;
}

function committedSession(api, clock) {
  const session = api.createSession({ random: seededRandom(21) });
  api.lensOrderFor(session, ALPHA);
  api.recordIntuition(session, ALPHA, { gutCall: 'threat', reason: null }, clock());
  api.markReadingsRevealed(session, ALPHA, clock());
  const judgement = api.commitJudgement(session, ALPHA, { committedLens: 'noise', rationale: 'zebra-test-rationale', promptAnswers: [] }, clock());
  return { session, judgement };
}

// ------------------------------------------------------------------------------------------ M6-U19

test('M6-U19 canRecordScenario is false while either field is blank and true when both hold text', async () => {
  const api = await scenarioApi();
  const blanks = ['', ' ', '\n\t'];
  const problems = [];
  const check = (draft, want) => {
    let got;
    try {
      got = api.canRecordScenario(draft);
    } catch (error) {
      problems.push(`canRecordScenario(${JSON.stringify(draft)}) threw: ${error.message}`);
      return;
    }
    if (got !== want) problems.push(`canRecordScenario(${JSON.stringify(draft)}) returned ${JSON.stringify(got)}, expected ${want}`);
  };
  for (const blank of blanks) {
    check({ whatWasHeard: blank, howItCouldPlayOut: 'zebra-test-playout' }, false);
    check({ whatWasHeard: 'zebra-test-heard', howItCouldPlayOut: blank }, false);
    check({ whatWasHeard: blank, howItCouldPlayOut: blank }, false);
  }
  check({ whatWasHeard: 'zebra-test-heard', howItCouldPlayOut: 'zebra-test-playout' }, true);
  assert.none(problems, 'canRecordScenario errors');
});

test('M6-U19 whatIsMissingScenario names exactly the empty field, in the specified words', async () => {
  const api = await scenarioApi();
  const BOTH = 'Write what you have heard and how the trend could play out to record your scenario.';
  const HEARD = 'Write what you have heard to record your scenario.';
  const PLAYOUT = 'Write how the trend could play out to record your scenario.';
  const problems = [];
  const check = (draft, want) => {
    let got;
    try {
      got = api.whatIsMissingScenario(draft);
    } catch (error) {
      problems.push(`whatIsMissingScenario(${JSON.stringify(draft)}) threw: ${error.message}`);
      return;
    }
    if (got !== want) problems.push(`whatIsMissingScenario(${JSON.stringify(draft)}) returned ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
  };
  for (const blank of ['', ' ', '\n\t']) {
    check({ whatWasHeard: blank, howItCouldPlayOut: blank }, BOTH);
    check({ whatWasHeard: blank, howItCouldPlayOut: 'zebra-test-playout' }, HEARD);
    check({ whatWasHeard: 'zebra-test-heard', howItCouldPlayOut: blank }, PLAYOUT);
  }
  check({ whatWasHeard: 'zebra-test-heard', howItCouldPlayOut: 'zebra-test-playout' }, '');
  assert.none(problems, 'whatIsMissingScenario errors');
});

// ------------------------------------------------------------------------------------------ M6-U21

test('M6-U21 recordScenario freezes the fields, refuses a second record and a non-later time; notes stay editable', async () => {
  const api = await scenarioApi();
  const V = await load('validate');
  const clock = makeClock();
  const { session, judgement } = committedSession(api, clock);

  // A record at the very instant of the commit is refused (recordedAt must be later).
  {
    const c2 = makeClock();
    const other = committedSession(api, c2);
    assert.throws(
      () => api.recordScenario(other.session, ALPHA, { whatWasHeard: 'zebra-test-heard', howItCouldPlayOut: 'zebra-test-playout' }, other.judgement.committedAt),
      undefined,
      'recordScenario with now equal to the Judgement committedAt must throw',
    );
  }

  const recorded = api.recordScenario(session, ALPHA, { whatWasHeard: 'zebra-test-heard', howItCouldPlayOut: 'zebra-test-playout' }, clock());
  assert.ok(recorded && typeof recorded === 'object', 'recordScenario returns the record');
  assert.equal(recorded.trendId, ALPHA, 'the record names its trend');
  const before = { whatWasHeard: recorded.whatWasHeard, howItCouldPlayOut: recorded.howItCouldPlayOut, recordedAt: recorded.recordedAt };
  assert.equal(before.whatWasHeard, 'zebra-test-heard', 'whatWasHeard recorded');
  assert.equal(before.howItCouldPlayOut, 'zebra-test-playout', 'howItCouldPlayOut recorded');
  assert.ok(typeof before.recordedAt === 'string', 'recordedAt recorded');
  for (const key of Object.keys(before)) {
    try {
      recorded[key] = 'changed';
    } catch {
      // strict mode: assigning to a frozen property throws, which is also a pass
    }
  }
  assert.deepEqual(
    { whatWasHeard: recorded.whatWasHeard, howItCouldPlayOut: recorded.howItCouldPlayOut, recordedAt: recorded.recordedAt },
    before,
    'the two fields and recordedAt cannot be changed',
  );
  assert.throws(
    () => api.recordScenario(session, ALPHA, { whatWasHeard: 'again', howItCouldPlayOut: 'again' }, clock()),
    undefined,
    'a second recordScenario for the trend must throw',
  );

  // Notes stay editable after recording.
  const content = await loadContent({ from: 'fixtures' });
  const qid = content.conversation[ALPHA].questions[0].id;
  api.setQuestionNote(session, ALPHA, qid, 'zebra-test-note');
  api.setQuestionNote(session, ALPHA, qid, 'zebra-test-note-changed');
  const snapshot = api.snapshotScenario(session, ALPHA);
  const notes = Array.from(snapshot.questionNotes || []);
  assert.deepEqual(notes.map((n) => ({ ...n })), [{ questionId: qid, note: 'zebra-test-note-changed' }], 'setQuestionNote changes the note after recording');
  assert.equal(snapshot.whatWasHeard, 'zebra-test-heard', 'the snapshot holds the recorded field');
  const verdict = V.checkScenarioRecord(clone(snapshot), judgement);
  assert.ok(verdict && verdict.ok === true, `the snapshot passes checkScenarioRecord with the session's Judgement (${JSON.stringify(verdict && verdict.errors)})`);
});

// ------------------------------------------------------------------------------------------ M6-U24

test('M6-U24 scenarioMode: interactive only with the switch on and a conversation module for every trend', async () => {
  const api = await scenarioApi();
  const content = await loadContent({ from: 'fixtures' });
  const all = clone(content.freeze);
  const none = { ...clone(all), modules: all.modules.filter((p) => !p.startsWith('data/conversation/')) };
  const some = { ...clone(all), modules: all.modules.filter((p) => p !== 'data/conversation/trend-fixture-beta.js') };
  const trends = content.trends;
  assert.equal(api.scenarioMode(all, trends, 'interactive'), 'interactive', 'flow interactive, a module for every trend');
  assert.equal(api.scenarioMode(none, trends, 'interactive'), 'static', 'flow interactive, no module listed');
  assert.equal(api.scenarioMode(all, trends, 'static'), 'static', 'flow static, every module listed');
  assert.throws(() => api.scenarioMode(some, trends, 'interactive'), undefined, 'some trends with a module and others without must throw');
});

test('M6-U24 from G3, with SCENARIO_FLOW interactive, every trend in data/ has a conversation module', { needs: ['questions'] }, async () => {
  const constants = await importUnderTest(repoUrl('assets/js/contracts/constants.js'));
  assert.equal(constants.SCENARIO_FLOW, 'interactive', 'SCENARIO_FLOW');
  const content = await loadContent({ from: 'data' });
  const missing = content.trends
    .map((t) => `data/conversation/${t.id}.js`)
    .filter((p) => !content.freeze.modules.includes(p));
  assert.none(missing, 'trends without a conversation module in data/');
});
