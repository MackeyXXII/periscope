// M7 Readiness and maturity: the browser-only unit tests, M7-U1 (screen part), M7-U2 to M7-U5,
// M7-U7, M7-U8 and M7-U11. The content tests are in m7-readiness.test.mjs.
// Written from docs/04-module-design.md (M7) and docs/02-system-requirements.md (F3, C-5) before
// assets/js/screens/readiness.js and governance.js exist (test-first rule).
//
// Interface under test: renderReadiness(root, ctx, { levelNames }) and renderGovernance(root, ctx).
// The module design does not say what ctx holds for M7; these tests pass what it fixes for M5:
// { loader, routes, manifest } (reported to the Orchestrator). The loader is the real M1 loader
// over the synthetic fixtures (fixtureLoader in tests/lib/screens.mjs).
//
// The verified view (M7-U8, and the verified half of M7-U1 and M7-U3) needs the fixture level
// names injected. The M1 loader has no such injection: it checks a profile against
// MATURITY_LEVEL_NAMES, which is empty until D-1 is closed, so it withholds the verified fixture.
// Those tests therefore replace loadReadiness by a stub resolving to { ok: true, value } with the
// deep-frozen verified fixture, and inject the names through renderReadiness's levelNames option
// (reported to the Orchestrator as a specification gap).
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

function deepFreeze(v) {
  if (v && typeof v === 'object' && !Object.isFrozen(v)) {
    Object.freeze(v);
    Object.values(v).forEach(deepFreeze);
  }
  return v;
}

async function context({ overrides, fail, verified = false } = {}) {
  const { loader } = await fixtureLoader({ overrides, fail });
  if (verified) {
    const value = deepFreeze(JSON.parse(JSON.stringify((await loadContent({ from: 'fixtures' })).readinessVerified)));
    loader.loadReadiness = async () => ({ ok: true, value });
  }
  return { loader, routes: await routesObject(), manifest: await fixtureManifest() };
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
  const names = c.readiness.maturity.practices.map((p) => p.name);
  problems.push(...orderProblems(text, names, 'practices'));
  names.forEach((name, i) => {
    const from = text.indexOf(name);
    const to = i + 1 < names.length ? text.indexOf(names[i + 1]) : text.length;
    if (from >= 0 && !text.slice(from, to).includes(PLACEHOLDER)) problems.push(`${name}: no ${PLACEHOLDER} after its name`);
  });
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
  const allItemTexts = [...g.implemented, ...g.notImplemented].map((i) => i.text);
  for (const item of [...g.implemented, ...g.notImplemented]) {
    const [el] = smallestContaining(m.root, item.text);
    if (!el) {
      problems.push(`item ${item.id} not shown`);
      continue;
    }
    if (labelChain(el)[0] !== 'real') problems.push(`item ${item.id}: covered by label ${JSON.stringify(labelChain(el)[0])}, expected "real"`);
    const ids = item.verifiedBy || [];
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
  assert.equal(count(text, PENDING_NEXT), 1, 'the pending sentence appears once');
  const [el] = smallestContaining(m.root, PENDING_NEXT);
  assert.equal(textOf(el), PENDING_NEXT, 'the element holding it holds nothing else');
  // The design names no hook for "the next-level area"; nothing of the verified block may appear.
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

  for (const p of v.maturity.practices) {
    if (!text.includes(p.levelName)) problems.push(`${p.key}: level name not shown`);
    const [ex] = smallestContaining(m.root, p.explanation.text);
    if (!ex) problems.push(`${p.key}: explanation not shown`);
    else if (!citedAfter(ex, p.explanation.citation.page)) problems.push(`${p.key}: explanation has no report citation with page ${p.explanation.citation.page}`);
  }
  const [heading] = Array.from(m.root.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter((h) => textOf(h) === NEXT_HEADING);
  if (!heading) problems.push(`no heading "${NEXT_HEADING}"`);
  const blockParts = [];
  for (const p of v.maturity.practices) {
    if (p.nextLevel.description) {
      const [d] = smallestContaining(m.root, p.nextLevel.description.text);
      if (!d) {
        problems.push(`${p.key}: next-level description not shown`);
        continue;
      }
      blockParts.push(d);
      if (heading && !precedes(heading, d)) problems.push(`${p.key}: description is not under the next-level heading`);
      if (labelChain(d)[0] !== 'ai-generated') problems.push(`${p.key}: description label ${JSON.stringify(labelChain(d)[0])}`);
      const after = heading ? text.slice(text.indexOf(NEXT_HEADING)) : text;
      if (!after.includes(p.nextLevel.levelName)) problems.push(`${p.key}: next level name not shown in the block`);
      if (!citedAfter(d, p.nextLevel.citation.page, '2025')) problems.push(`${p.key}: description has no DOI citation with 2025 and page ${p.nextLevel.citation.page}`);
    } else {
      const exact = Array.from(m.root.querySelectorAll('*')).filter((el) => textOf(el) === NO_LEVEL_ABOVE);
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

test('M7-U11 with loadGovernance failing, governance shows F3-E2 and readiness still renders', { needs: ['dom'], timeout: 15000 }, async ({ root }) => {
  const { loader } = await fixtureLoader({ fail: ['loadGovernance'] });
  const app = await appFrame(root, { hash: '#/governance', options: { loader } });
  if (app.error) throw app.error;
  await waitFor(() => app.doc.body.textContent.includes(GOVERNANCE_MISSING), `"${GOVERNANCE_MISSING}" on #/governance`, 3000);
  await app.navigate('#/readiness');
  await waitFor(() => app.doc.body.textContent.includes('zebra-strategic-alignment-finding'), 'F3-S1 on #/readiness', 3000);
});
