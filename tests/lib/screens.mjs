// Test tooling for Periscope. Never imported by the page.
//
// Wiring for the screen tests of M6, M8 and M9: a loader over the synthetic fixtures with spies,
// the screen context `ctx`, an injectable clock, the DOM hooks the tests rely on, and a driver for
// the F1 and F5 walks. Added by the Test Engineer on 5 October 2026.
//
// THE LOADER. fixtureLoader() builds the real M1 loader, createLoader({ importer }) from
// assets/js/contracts/load.js, with an importer that serves tests/fixtures/content/ in place of
// data/ (and named overrides in place of single modules), then wraps every loader function in a
// spy that records its calls. `fail: ['loadTrends']` makes that function resolve to
// { ok: false } without calling the real one (the "stubbed to fail" of M6-U15, M7-U11, M10-U6).
// Using the real loader means the tests see exactly the validation the page sees: a reveal bundle
// that fails checkRevealBundle comes back as { ok: false } from loadReveal, as in the page.
//
// THE DOM HOOKS. The tests find elements only by the attributes of the "DOM hooks" table in
// docs/04-module-design.md (ratified by the Architect on 5 October 2026) and by the exact visible
// texts Level 2 fixes, never by class names or position:
//
//   data-content, data-label     a content element and its honesty label (same element, only there)
//   data-badge="<value>"         the visible badge renderLabel returns; never carries data-label
//   data-area="<region>"         readings, interrogation, judgement, what-you-wrote,
//                                conversation-questions, signals, entries, maturity, next-level,
//                                governance-implemented, governance-not-implemented,
//                                governance-argument
//   data-control="gut-call" | "judgement"
//                                a lens control: <input type="radio" value="<lens>"> options
//   data-reading="<lens>"        one reading element
//   data-question="<questionId>" one interrogation question (F1) or conversation question (F5)
//   data-field="reason" | "answer" | "rationale" | "heard" | "playout" | "note"
//                                the viewer's text fields (answer and note fields also carry
//                                data-question-id="<questionId>")
//   data-echo="gut-call" | "reason" | "answer" | "committed-lens" | "rationale" | "heard" | "playout"
//                                a read-only echo of what the viewer entered (F1-S4, F5)
//   data-hint="commit" | "scenario"
//                                the line that says what is still missing
//   data-signal, data-entry, data-practice, data-category
//                                one signal (brief), log entry, practice, readiness category
//
// Buttons and links are found by their exact visible text, which the specification fixes.

import { importUnderTest, repoUrl } from './env.mjs';
import { fixturePathFor } from './content.mjs';
import { seededRandom } from './seeded-random.mjs';
import { settle, waitFor, click, type, choose, buttonsByText, linksByText } from './dom.mjs';

export const PATHS = Object.freeze({
  load: 'assets/js/contracts/load.js',
  validate: 'assets/js/contracts/validate.js',
  vocabulary: 'assets/js/contracts/vocabulary.js',
  constants: 'assets/js/contracts/constants.js',
  session: 'assets/js/state/session.js',
  lensOrder: 'assets/js/state/lens-order.js',
  scenarioState: 'assets/js/state/scenario.js',
  trendIndex: 'assets/js/screens/trend-index.js',
  trend: 'assets/js/screens/trend.js',
  scenario: 'assets/js/screens/scenario.js',
  brief: 'assets/js/screens/brief.js',
  readiness: 'assets/js/screens/readiness.js',
  governance: 'assets/js/screens/governance.js',
  log: 'assets/js/screens/log.js',
  routes: 'assets/js/shell/routes.js',
  labels: 'assets/js/honesty/labels.js',
  sources: 'assets/js/honesty/sources.js',
  statement: 'assets/js/honesty/statement.js',
});

/** Imports a module under test by its key in PATHS. */
export function load(key) {
  return importUnderTest(repoUrl(PATHS[key]));
}

/** Which M9 file exports which function (docs/04-module-design.md, M9 Outputs). */
export const HONESTY_EXPORTS = Object.freeze({
  labels: Object.freeze(['renderLabel']),
  sources: Object.freeze(['renderSource', 'renderQuote', 'formatDate']),
  statement: Object.freeze(['renderDemoStatement']),
});

/**
 * M9's exports, each taken from the file the module design places it in: labels.js renderLabel;
 * sources.js renderSource, renderQuote, formatDate; statement.js renderDemoStatement. Fails,
 * naming the file, if a file lacks its function.
 */
export async function honesty() {
  const out = {};
  for (const [file, names] of Object.entries(HONESTY_EXPORTS)) {
    const mod = await load(file);
    for (const name of names) {
      if (typeof mod[name] !== 'function') throw new Error(`${PATHS[file]} does not export ${name}() (M9 Outputs)`);
      out[name] = mod[name];
    }
  }
  return out;
}

/** A clock that returns an ISO timestamp one second later on every call. */
export function makeClock(start = '2026-10-05T09:00:00.000Z', stepMs = 1000) {
  let t = Date.parse(start) - stepMs;
  const clock = () => {
    t += stepMs;
    return new Date(t).toISOString();
  };
  return clock;
}

/** The synthetic freeze manifest. */
export async function fixtureManifest() {
  return (await import(repoUrl(fixturePathFor('data/freeze.js')).href)).default;
}

/** A module from tests/fixtures/ (for example 'invalid/log-empty.js'), its default export. */
export async function fixtureModule(relative) {
  return (await import(repoUrl(`tests/fixtures/${relative}`).href)).default;
}

const LOADER_FUNCTIONS = [
  'loadFreeze', 'loadSignals', 'loadTrends', 'loadBrief', 'loadReadiness', 'loadGovernance', 'loadLog',
  'loadReveal', 'loadConversation',
];

/**
 * The M1 loader over the fixtures, with spies.
 *   overrides: { 'data/<path>.js': value } served instead of the fixture for that path
 *   fail:      loader function names that resolve to { ok: false } without loading anything
 *   levelNames passed to createLoader (and so to checkReadiness) when given; omitted otherwise, so
 *              that the loader uses MATURITY_LEVEL_NAMES as the page does
 * Resolves to { loader, calls, importerCalls }: calls[name] is the list of argument arrays.
 */
export async function fixtureLoader({ overrides = {}, fail = [], levelNames } = {}) {
  const L = await load('load');
  const importerCalls = [];
  const importer = async (path) => {
    const p = String(path);
    importerCalls.push(p);
    const m = /data\/(.+\.js)$/.exec(p);
    if (!m) throw new Error(`fixture importer: not a data/ module path: ${p}`);
    const key = `data/${m[1]}`;
    if (Object.prototype.hasOwnProperty.call(overrides, key)) return { default: overrides[key] };
    return import(repoUrl(fixturePathFor(key)).href);
  };
  const real = L.createLoader(levelNames === undefined ? { importer } : { importer, levelNames });
  const calls = {};
  const loader = {};
  for (const name of LOADER_FUNCTIONS) {
    calls[name] = [];
    loader[name] = (...args) => {
      calls[name].push(args);
      if (fail.includes(name)) return Promise.resolve({ ok: false, reason: `${name} stubbed to fail by the test`, withheld: 0 });
      if (typeof real[name] !== 'function') return Promise.reject(new Error(`createLoader() returned no ${name}`));
      return real[name](...args);
    };
  }
  return { loader, calls, importerCalls };
}

/** The routes object from M10's leaf routes.js (exported as `routes`, as default, or as functions). */
export async function routesObject() {
  const R = await load('routes');
  return R.routes || R.default || R;
}

/**
 * A screen context as docs/04-module-design.md describes it: { session, loader, routes, manifest,
 * flow, now } (M6's full context; screens outside M6 ignore session, flow and now). `random` is
 * handed to createSession; `now` is a clock function; `levelNames`, when given, goes to
 * createLoader (see fixtureLoader), for the verified readiness view.
 */
export async function screenContext({ random = seededRandom(1), flow = 'static', overrides, fail, now, session, levelNames } = {}) {
  const S = await load('session');
  const { loader, calls, importerCalls } = await fixtureLoader({ overrides, fail, levelNames });
  const ctx = {
    session: session || S.createSession({ random }),
    loader,
    routes: await routesObject(),
    manifest: await fixtureManifest(),
    flow,
    now: now || makeClock(),
  };
  return { ctx, calls, importerCalls };
}

// ------------------------------------------------------------------------------------------ F1 and F5

export const RECORD_GUT = 'Record my gut reading';
export const COMMIT = 'Commit judgement';
export const SKIP = 'Skip the questions';
export const RECORD_SCENARIO = 'Record my scenario';
export const TO_SCENARIO = 'Take this trend into your conversations';
export const READINGS_PLACEHOLDER = 'The three readings appear once you have recorded your gut reading.';
export const ORDER_NOTE = 'The three readings are peers. Their order is random and means nothing.';

export function lensOptions(root, control) {
  return Array.from(root.querySelectorAll(`[data-control="${control}"] input[type="radio"]`));
}

export function optionFor(root, control, lens) {
  return lensOptions(root, control).find((o) => o.value === lens) || null;
}

export function readingElements(root) {
  return Array.from(root.querySelectorAll('[data-reading]'));
}

export function field(root, name) {
  return root.querySelector(`[data-field="${name}"]`);
}

export function fields(root, name) {
  return Array.from(root.querySelectorAll(`[data-field="${name}"]`));
}

/** The one button with this exact text; throws if there is none or more than one. */
export function theButton(root, text) {
  const found = buttonsByText(root, text);
  if (found.length !== 1) throw new Error(`expected exactly one "${text}" button, found ${found.length}`);
  return found[0];
}

export function theLink(root, text) {
  const found = linksByText(root, text);
  if (found.length !== 1) throw new Error(`expected exactly one "${text}" link, found ${found.length}`);
  return found[0];
}

/** Renders a screen into the mounted root, replacing what was there, and lets it settle. */
export async function show(mounted, renderFn, ...args) {
  mounted.clear();
  await renderFn(mounted.root, ...args);
  await settle(4);
}

/** Opens the trend card. */
export async function openTrend(mounted, T, ctx, trendId) {
  await show(mounted, T.renderTrend, ctx, trendId);
}

/** In F1-S1: chooses the gut call, optionally types a reason, records, and waits for F1-S2 or F1-E3. */
export async function recordGut(mounted, { lens = 'threat', reason = null } = {}) {
  const root = mounted.root;
  const option = optionFor(root, 'gut-call', lens);
  if (!option) throw new Error(`no gut-reading option for ${lens} ([data-control="gut-call"] input[type="radio"][value="${lens}"])`);
  await choose(option);
  if (reason !== null) await type(field(root, 'reason'), reason);
  await click(theButton(root, RECORD_GUT));
  await waitFor(
    () => readingElements(root).length === 3 || /were withheld because their content failed validation/.test(root.textContent),
    'the readings (F1-S2) or the withheld notice (F1-E3) after recording the gut reading',
  );
  await settle();
}

/** In F1-S2: optionally answers the first question, chooses the committed lens, writes the rationale. */
export async function fillJudgement(mounted, { lens = 'noise', rationale = 'zebra-test-rationale', answer = null } = {}) {
  const root = mounted.root;
  if (answer !== null) await type(fields(root, 'answer')[0], answer);
  const option = optionFor(root, 'judgement', lens);
  if (!option) throw new Error(`no judgement option for ${lens} ([data-control="judgement"] input[type="radio"][value="${lens}"])`);
  await choose(option);
  await type(field(root, 'rationale'), rationale);
}

/** In F1-S3: commits and waits for F1-S4. */
export async function commit(mounted) {
  await click(theButton(mounted.root, COMMIT));
  await waitFor(() => linksByText(mounted.root, TO_SCENARIO).length > 0, `F1-S4 (the "${TO_SCENARIO}" link)`);
}

/** The whole F1 walk on one trend, from opening the card to F1-S4. */
export async function walkToCommitted(mounted, T, ctx, trendId, entries = {}) {
  const {
    gut = 'threat', reason = 'zebra-test-reason', answer = 'zebra-test-answer', lens = 'noise', rationale = 'zebra-test-rationale',
  } = entries;
  await openTrend(mounted, T, ctx, trendId);
  await recordGut(mounted, { lens: gut, reason });
  await fillJudgement(mounted, { lens, rationale, answer });
  await commit(mounted);
}

/** In F5-S1: writes both fields and records; waits for F5-S2 or F5-E2. */
export async function recordScenarioInPage(mounted, { heard = 'zebra-test-heard', playout = 'zebra-test-playout' } = {}) {
  const root = mounted.root;
  await type(field(root, 'heard'), heard);
  await type(field(root, 'playout'), playout);
  await click(theButton(root, RECORD_SCENARIO));
  await waitFor(
    () => root.querySelector('[data-question]') || /questions for this trend were withheld/.test(root.textContent),
    'the conversation questions (F5-S2) or the withheld notice (F5-E2) after recording the scenario',
  );
  await settle();
}

/** Every string of a reveal bundle that must not be in the page before the gut reading is recorded. */
export function revealStrings(bundle) {
  const out = [];
  for (const r of bundle.readings) {
    out.push(r.text, r.disconfirmingCondition);
    for (const e of r.evidence) out.push(e.claim);
    for (const e of r.counterEvidence) out.push(e.claim);
  }
  const i = bundle.interrogation;
  for (const group of [i.provenanceChecks, i.assumptionProbes, i.preMortem]) for (const q of group) out.push(q.text);
  return out;
}

/** The distinctive marker at the start of a fixture string ("zebra-…:"), or the string itself. */
export function marker(text) {
  const m = /^(zebra-[a-z0-9-]+)/.exec(text);
  return m ? m[1] : text;
}
