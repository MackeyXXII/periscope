// M7 Readiness and maturity: the browser-only unit tests, M7-U1 (screen part), M7-U2 to M7-U5,
// M7-U7, M7-U8 and M7-U11. The content tests are in m7-readiness.test.mjs.
// Written from docs/04-module-design.md (M7) and docs/02-system-requirements.md (F3, C-5) before
// assets/js/screens/readiness.js and governance.js exist (test-first rule).
//
// Interface under test: renderReadiness(root, ctx, { levelNames }) and renderGovernance(root, ctx),
// with ctx = { loader, routes, manifest } (the screen context defined under M5). The loader is the
// real M1 loader over the synthetic fixtures (fixtureLoader in tests/lib/screens.mjs).
//
// The verified view (M7-U8, and the verified half of M7-U1 and M7-U3) needs the fixture level
// names injected at the one injection point the module design fixes: the same list is passed to
// createLoader({ importer, levelNames }) (so checkReadiness accepts the verified fixture) and to
// renderReadiness's levelNames option.
//
// DOM hooks (docs/04-module-design.md): the maturity view is data-area="maturity", the next-level
// area within it data-area="next-level"; each practice is data-practice="<key>", each readiness
// category data-category="<key>".
//
// Status at G2: every test fails, naming the missing screen or M1 module (test-first rule).

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { mount, settle, smallestContaining, labelChain, precedes, textOf, appFrame, waitFor } from '../lib/dom.mjs';
import { load, fixtureLoader, routesObject, fixtureManifest, fixtureModule } from '../lib/screens.mjs';
import { loadContent } from '../lib/content.mjs';
import { contractValidator } from '../lib/schemas.mjs';
import { candidatesIn } from '../lib/candidate-level-names.mjs';

const FIXTURE_LEVEL_NAMES = Object.freeze(['Fixture level one', 'Fixture level two', 'Fixture level three']);
const REPORT_DOI = 'https://doi.org/10.1787/aa573076-en';
const PLACEHOLDER = 'LEVEL_NAME_UNVERIFIED';
const PENDING_LEVELS = 'Level names pending verification against the WEF/OECD report.';
const PENDING_NEXT = 'Pending: the next complement depends on the verified level definitions.';
const NEXT_HEADING = 'What the WEF/OECD report describes for the next level';
const NO_LEVEL_ABOVE = 'The report describes no level above this one.';
const NOT_ADVICE = "These are the report's descriptions of the next level. They are not advice from this demo.";
const WITHHELD = 'The readiness profile was withheld because its content failed validation.';
const GOVERNANCE_MISSING = 'The governance statement could not be shown.';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** An ISO date as M9's formatDate renders it ("5 October 2026"). */
function formatIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

async function context({ overrides, fail, verified = false } = {}) {
  const { loader } = await fixtureLoader({
    overrides: verified ? { 'data/readiness.js': (await loadContent({ from: 'fixtures' })).readinessVerified, ...overrides } : overrides,
    fail,
    ...(verified ? { levelNames: FIXTURE_LEVEL_NAMES } : {}),
  });
  return { loader, routes: await routesObject(), manifest: await fixtureManifest() };
}

const CATEGORY_ORDER = Object.freeze(['strategic-alignment', 'resources', 'knowledge', 'culture', 'data']);
const PRACTICE_ORDER = Object.freeze(['scanning', 'trend-analysis', 'scenario-work']);

/** The one element with data-area="<name>" under `root`, or null. */
function theArea(root, name) {
  const found = root.querySelectorAll(`[data-area="${name}"]`);
  return found.length === 1 ? found[0] : null;
}

async function showReadiness(root, { verified = false, overrides } = {}) {
  const screen = await load('readiness');
  const ctx = await context({ verified, overrides });
  const m = await mount(root);
  await screen.renderReadiness(m.root, ctx, verified ? { levelNames: FIXTURE_LEVEL_NAMES } : {});
  await settle(4);
  return m;
}

async function showGovernance(root) {
  const screen = await load('governance');
  const ctx = await context();
  const m = await mount(root);
  await screen.renderGovernance(m.root, ctx);
  await settle(4);
  return m;
}

function count(text, needle) {
  return text.split(needle).length - 1;
}

/** Problems if the needles do not each appear, first occurrences in the given order. */
function orderProblems(text, needles, what) {
  const positions = needles.map((n) => text.indexOf(n));
  const problems = needles.filter((n, i) => positions[i] < 0).map((n) => `${what}: "${n}" not shown`);
  if (problems.length === 0) {
    for (let i = 1; i < positions.length; i += 1) {
      if (positions[i] < positions[i - 1]) problems.push(`${what}: "${needles[i]}" is shown before "${needles[i - 1]}"`);
    }
  }
  return problems;
}

// ------------------------------------------------------------------------------------------ M7-U1

test('M7-U1 the screen renders the five categories and three practices in the fixed orders', { needs: ['dom'] }, async ({ root }) => {
  const c = await loadContent({ from: 'fixtures' });
  const problems = [];
  for (const verified of [false, true]) {
    const profile = verified ? c.readinessVerified : c.readiness;
    const m = await showReadiness(root, { verified });
    const text = m.root.textContent;
    const findings = profile.categories.map((x) => x.finding);
    problems.push(...orderProblems(text, findings, `${verified ? 'verified' : 'unverified'} categories`));
    for (const f of findings) if (count(text, f) > 1) problems.push(`finding repeated: ${f}`);
    problems.push(...orderProblems(text, profile.maturity.practices.map((p) => p.name), `${verified ? 'verified' : 'unverified'} practices`));
    const where = verified ? 'verified' : 'unverified';
    const cats = Array.from(m.root.querySelectorAll('[data-category]')).map((el) => el.getAttribute('data-category'));
    if (JSON.stringify(cats) !== JSON.stringify(CATEGORY_ORDER)) problems.push(`${where}: data-category elements ${JSON.stringify(cats)}, expected ${JSON.stringify(CATEGORY_ORDER)}`);
    const pracs = Array.from(m.root.querySelectorAll('[data-practice]')).map((el) => el.getAttribute('data-practice'));
    if (JSON.stringify(pracs) !== JSON.stringify(PRACTICE_ORDER)) problems.push(`${where}: data-practice elements ${JSON.stringify(pracs)}, expected ${JSON.stringify(PRACTICE_ORDER)}`);
    m.frame.remove();
  }
  assert.none(problems, 'order problems on screen');
});

// ------------------------------------------------------------------------------------------ M7-U2

test('M7-U2 the unverified maturity view shows the placeholder per practice and the pending sentence once', { needs: ['dom'] }, async ({ root }) => {
  const c = await loadContent({ from: 'fixtures' });
  const m = await showReadiness(root);
  const text = m.root.textContent;
  const problems = [];
  const maturity = theArea(m.root, 'maturity');
  if (!maturity) problems.push('no single maturity view (data-area="maturity")');
  for (const p of c.readiness.maturity.practices) {
    const els = maturity ? Array.from(maturity.querySelectorAll('[data-practice]')).filter((el) => el.getAttribute('data-practice') === p.key) : [];
    if (els.length !== 1) {
      problems.push(`${p.key}: ${els.length} elements data-practice="${p.key}" in the maturity view, expected 1`);
      continue;
    }
    const t = els[0].textContent;
    if (!t.includes(p.name)) problems.push(`${p.key}: its name "${p.name}" is not shown`);
    if (!t.includes(PLACEHOLDER)) problems.push(`${p.key}: ${PLACEHOLDER} is not shown`);
  }
  if (count(text, PENDING_LEVELS) !== 1) problems.push(`the pending sentence appears ${count(text, PENDING_LEVELS)} times, expected once`);
  const html = m.html();
  if (html.includes(REPORT_DOI) || html.includes('doi.org')) problems.push('a report citation is in the page');
  if (/zebra-[a-z-]*explanation/.test(html)) problems.push('an explanation is in the page');
  const hits = candidatesIn(html);
  if (hits.length) problems.push(`candidate level names in the page: ${hits.join('; ')}`);
  assert.none(problems, 'unverified view problems');
});

// ------------------------------------------------------------------------------------------ M7-U3

test('M7-U3 the readiness screen has no meter, progress, svg, canvas or percentage width', { needs: ['dom'] }, async ({ root }) => {
  const problems = [];
  for (const verified of [false, true]) {
    const m = await showReadiness(root, { verified });
    const where = verified ? 'verified' : 'unverified';
    for (const el of m.root.querySelectorAll('meter, progress, svg, canvas, [role="meter"], [role="progressbar"]')) {
      problems.push(`${where}: <${el.tagName.toLowerCase()}${el.getAttribute('role') ? ` role="${el.getAttribute('role')}"` : ''}>`);
    }
    for (const el of m.root.querySelectorAll('[style]')) {
      if (/(^|[;\s])width\s*:[^;]*%/i.test(el.getAttribute('style'))) problems.push(`${where}: inline style "${el.getAttribute('style')}"`);
    }
    m.frame.remove();
  }
  assert.none(problems, 'score-like elements');
});

// ------------------------------------------------------------------------------------------ M7-U4

test('M7-U4 a profile with four categories or two practices is withheld whole (F3-E1)', { needs: ['dom'] }, async ({ root }) => {
  const c = await loadContent({ from: 'fixtures' });
  const forbidden = [
    ...c.readiness.categories.flatMap((x) => [x.name, x.finding, ...x.answers.flatMap((a) => [a.question, a.answer])]),
    ...c.readiness.maturity.practices.map((p) => p.name),
  ];
  const problems = [];
  for (const file of ['invalid/readiness-four-categories.js', 'invalid/readiness-two-practices.js']) {
    const value = await fixtureModule(file);
    // Guard: the fixture really is invalid, so F3-E1 is the only correct state.
    assert.ok(!contractValidator().validate('readiness-profile.schema.json', value).ok, `${file} fails its schema`);
    const m = await showReadiness(root, { overrides: { 'data/readiness.js': value } });
    const text = m.root.textContent;
    if (!text.includes(WITHHELD)) problems.push(`${file}: the withheld notice is missing`);
    for (const s of forbidden) if (text.includes(s)) problems.push(`${file}: "${s}" is rendered`);
    m.frame.remove();
  }
  assert.none(problems, 'partial rendering');
});

// ------------------------------------------------------------------------------------------ M7-U5

test('M7-U5 the governance screen shows both lists, verifying tests, sourced and labelled argument', { needs: ['dom'] }, async ({ root }) => {
  const { governance: g } = await loadContent({ from: 'fixtures' });
  const m = await showGovernance(root);
  const problems = [];
  const headings = Array.from(m.root.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(textOf);
  for (const h of ['Implemented in this demo', 'Not implemented']) if (!headings.includes(h)) problems.push(`no heading "${h}"`);
  // Each list and the argument sit in their own region (DOM hooks: data-area).
  for (const [name, items] of [['governance-implemented', g.implemented], ['governance-not-implemented', g.notImplemented], ['governance-argument', g.argument]]) {
    const region = theArea(m.root, name);
    if (!region) {
      problems.push(`no single region data-area="${name}"`);
      continue;
    }
    for (const item of items) if (!region.textContent.includes(item.text)) problems.push(`${item.id} is not inside data-area="${name}"`);
  }
  const allItemTexts = [...g.implemented, ...g.notImplemented].map((i) => i.text);
  for (const item of [...g.implemented, ...g.notImplemented]) {
    const [el] = smallestContaining(m.root, item.text);
    if (!el) {
      problems.push(`item ${item.id} not shown`);
      continue;
    }
    if (labelChain(el)[0] !== 'real') problems.push(`item ${item.id}: covered by label ${JSON.stringify(labelChain(el)[0])}, expected "real"`);
    const ids = item.verifiedBy || [];
    // N5: every item of either list names its verifying tests.
    if (ids.length === 0) problems.push(`item ${item.id}: no verifiedBy in the content to show`);
    let scope = el;
    while (scope && !ids.every((id) => scope.textContent.includes(id))) {
      const parent = scope.parentElement;
      if (!parent || allItemTexts.some((t) => t !== item.text && parent.textContent.includes(t))) {
        scope = null;
        break;
      }
      scope = parent;
    }
    if (!scope) problems.push(`item ${item.id}: its test identifiers ${ids.join(', ')} are not shown with it`);
  }
  for (const arg of g.argument) {
    const [el] = smallestContaining(m.root, arg.text);
    if (!el) {
      problems.push(`argument ${arg.id} not shown`);
      continue;
    }
    if (labelChain(el)[0] !== 'ai-generated') problems.push(`argument ${arg.id}: label ${JSON.stringify(labelChain(el)[0])}, expected "ai-generated"`);
    const dated = arg.sources.some((s) =>
      Array.from(m.root.querySelectorAll('a')).some(
        (a) => a.getAttribute('href') === s.url && a.parentElement && a.parentElement.textContent.includes(formatIso(s.publishedOn)),
      ),
    );
    if (!dated) problems.push(`argument ${arg.id}: no source link shown with its date`);
  }
  assert.none(problems, 'governance screen problems');
});

// ------------------------------------------------------------------------------------------ M7-U7

test('M7-U7 while unverified, the next-level area holds only the pending sentence', { needs: ['dom'] }, async ({ root }) => {
  const m = await showReadiness(root);
  const text = m.root.textContent;
  const maturity = theArea(m.root, 'maturity');
  assert.ok(maturity, 'a single maturity view (data-area="maturity")');
  const next = theArea(maturity, 'next-level');
  assert.ok(next, 'a single next-level area (data-area="next-level") within the maturity view');
  assert.equal(textOf(next), PENDING_NEXT, 'the next-level area renders exactly the pending sentence and nothing else');
  assert.equal(count(text, PENDING_NEXT), 1, 'the pending sentence appears once');
  for (const s of [NEXT_HEADING, 'The report describes', NOT_ADVICE]) assert.notIncludes(text, s);
});

// ------------------------------------------------------------------------------------------ M7-U8

test('M7-U8 the verified view shows levels, explanations, the next-level block and the not-advice sentence', { needs: ['dom'] }, async ({ root }) => {
  const { readinessVerified: v } = await loadContent({ from: 'fixtures' });
  const m = await showReadiness(root, { verified: true });
  const text = m.root.textContent;
  const problems = [];
  const doiLinks = Array.from(m.root.querySelectorAll('a')).filter((a) => a.getAttribute('href') === REPORT_DOI);
  const citedAfter = (el, page, year) =>
    doiLinks.some((a) => (a === el || precedes(el, a)) && a.parentElement.textContent.includes(page) && (!year || a.parentElement.textContent.includes(year)));

  const maturity = theArea(m.root, 'maturity');
  const next = maturity ? theArea(maturity, 'next-level') : null;
  if (!maturity) problems.push('no single maturity view (data-area="maturity")');
  if (!next) problems.push('no single next-level area (data-area="next-level") within the maturity view');
  const scope = maturity || m.root;
  const nextScope = next || m.root;
  for (const p of v.maturity.practices) {
    const els = Array.from(scope.querySelectorAll('[data-practice]')).filter((el) => el.getAttribute('data-practice') === p.key && !(next && next.contains(el)));
    const own = els.length === 1 ? els[0] : null;
    if (!own) problems.push(`${p.key}: ${els.length} elements data-practice="${p.key}" in the maturity view outside the next-level area, expected 1`);
    const pScope = own || scope;
    if (!pScope.textContent.includes(p.levelName)) problems.push(`${p.key}: level name not shown`);
    // B1: the explanation's prose is explanation.text.text and carries its own ai-generated label.
    const [ex] = smallestContaining(pScope, p.explanation.text.text);
    if (!ex) problems.push(`${p.key}: explanation not shown`);
    else {
      if (labelChain(ex)[0] !== 'ai-generated') problems.push(`${p.key}: explanation label ${JSON.stringify(labelChain(ex)[0])}, expected its own "ai-generated"`);
      if (!citedAfter(ex, p.explanation.citation.page)) problems.push(`${p.key}: explanation has no report citation with page ${p.explanation.citation.page}`);
    }
  }
  const [heading] = Array.from(nextScope.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter((h) => textOf(h) === NEXT_HEADING);
  if (!heading) problems.push(`no heading "${NEXT_HEADING}" in the next-level area`);
  const blockParts = [];
  for (const p of v.maturity.practices) {
    if (p.nextLevel.description) {
      const [d] = smallestContaining(nextScope, p.nextLevel.description.text);
      if (!d) {
        problems.push(`${p.key}: next-level description not shown`);
        continue;
      }
      blockParts.push(d);
      if (heading && !precedes(heading, d)) problems.push(`${p.key}: description is not under the next-level heading`);
      if (labelChain(d)[0] !== 'ai-generated') problems.push(`${p.key}: description label ${JSON.stringify(labelChain(d)[0])}`);
      if (!nextScope.textContent.includes(p.nextLevel.levelName)) problems.push(`${p.key}: next level name not shown in the next-level area`);
      if (!citedAfter(d, p.nextLevel.citation.page, '2025')) problems.push(`${p.key}: description has no DOI citation with 2025 and page ${p.nextLevel.citation.page}`);
    } else {
      const exact = Array.from(nextScope.querySelectorAll('*')).filter((el) => textOf(el) === NO_LEVEL_ABOVE);
      if (exact.length === 0) problems.push(`${p.key}: "${NO_LEVEL_ABOVE}" is not shown as an element of its own`);
      else blockParts.push(exact[exact.length - 1]);
    }
  }
  const [closing] = smallestContaining(m.root, NOT_ADVICE);
  if (!closing) problems.push('the not-advice sentence is missing');
  else for (const part of blockParts) if (!precedes(part, closing)) problems.push('the not-advice sentence does not follow every practice');
  for (const s of [PENDING_LEVELS, PENDING_NEXT]) if (text.includes(s)) problems.push(`pending sentence shown: ${s}`);
  assert.none(problems, 'verified view problems');
});

// ------------------------------------------------------------------------------------------ M7-U11
// F3-E2 is a defence, not a shipping state: under the default proposed for Miguel to confirm at G2
// (Red-team finding N6), a build whose governance content cannot be frozen is a G4 no-go. This test
// proves the defence works; it does not make F3-E2 acceptable in a shipped build.

test('M7-U11 with loadGovernance failing, governance shows F3-E2 and readiness still renders', { needs: ['dom'], timeout: 15000 }, async ({ root }) => {
  const { loader } = await fixtureLoader({ fail: ['loadGovernance'] });
  const app = await appFrame(root, { hash: '#/governance', options: { loader } });
  if (app.error) throw app.error;
  await waitFor(() => app.doc.body.textContent.includes(GOVERNANCE_MISSING), `"${GOVERNANCE_MISSING}" on #/governance`, 3000);
  await app.navigate('#/readiness');
  await waitFor(() => app.doc.body.textContent.includes('zebra-strategic-alignment-finding'), 'F3-S1 on #/readiness', 3000);
});
