// M10 UI shell and navigation: the browser-only unit tests, M10-U3 (start-up part) and M10-U5 to
// M10-U8. The static tests (M10-U1 to M10-U4, M10-U9) are in m10-shell.test.mjs.
// Written from docs/04-module-design.md (M10) before the shell is implemented (test-first rule).
//
// Every test here loads the whole application in tests/app-host.html through appFrame() from
// tests/lib/dom.mjs, with the real M1 loader serving the synthetic fixtures
// (fixtureLoader in tests/lib/screens.mjs), handed to start({ loader, random }). Screens are
// recognised by texts the specification fixes for them (docs/02-system-requirements.md, C-3, C-4,
// F1 to F5), listed in ROUTES below; controls and readings by the DOM hooks of
// docs/04-module-design.md (data-control, data-reading, data-echo).
//
// Status at G2: every test fails, naming assets/js/main.js (a placeholder without start()) or
// assets/js/contracts/load.js (not implemented): the test-first rule working.

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { importUnderTest, repoUrl } from '../lib/env.mjs';
import { fixtureLoader } from '../lib/screens.mjs';
import { seededRandom } from '../lib/seeded-random.mjs';
import {
  appFrame, waitFor, settle, click, choose, buttonsByText, smallestContaining, isVisible, precedes, shape, textOf,
} from '../lib/dom.mjs';

const ALPHA = 'trend-fixture-alpha';
const ALPHA_TITLE = 'Zebra alpha fixture movement in synthetic tooling';
const FREEZE_DATE_TEXT = '5 October 2026'; // tests/fixtures/content/freeze.js frozenOn, as M9's formatDate renders it
const LENSES = ['opportunity', 'threat', 'noise'];
const readingMarker = (lens) => `zebra-alpha-${lens}-text`;

/** Each route with texts, any one of which shows that its screen is displayed. */
const ROUTES = Object.freeze([
  ['#/brief', ['Listed by publication date. The order says nothing about importance.']],
  ['#/trends', ['Listed alphabetically.']],
  [`#/trend/${ALPHA}`, [ALPHA_TITLE]],
  [`#/scenario/${ALPHA}`, [
    'Scenario work from your own conversations', // F5-ST, the only F5 screen in this release (SCENARIO_FLOW 'static')
  ]],
  ['#/readiness', ['zebra-strategic-alignment-finding']],
  ['#/governance', ['Implemented in this demo']],
  ['#/log', ['Listed by the date of the original signal.']],
  ['#/nothing', ['This page does not exist in this build.']],
]);
const NAV_ITEMS = Object.freeze(['Brief', 'Trends', 'Readiness', 'Governance', 'Decision log']);
const VIEWPORTS = Object.freeze([[360, 640], [390, 844], [1280, 800], [1440, 900]]);

// ------------------------------------------------------------------------------------------ helpers

async function openApp(root, { width, height, hash = '', fail = [], random } = {}) {
  const options = { loader: (await fixtureLoader({ fail })).loader };
  if (random) options.random = random;
  const app = await appFrame(root, { width, height, hash, options });
  if (app.error && /could not be imported|does not export start/.test(app.error.message)) throw app.error;
  return app;
}

function bodyText(app) {
  return app.doc.body ? app.doc.body.textContent : '';
}

async function showsRoute(app, hash, markers) {
  return waitFor(
    () => markers.some((m) => bodyText(app).includes(m)),
    `${hash || 'the empty fragment'} to show one of ${JSON.stringify(markers)}`,
    3000,
  );
}

async function goTo(app, hash, markers) {
  await app.navigate(hash);
  await showsRoute(app, hash, markers);
}

function mainNav(doc) {
  return Array.from(doc.querySelectorAll('nav')).find((nav) =>
    Array.from(nav.querySelectorAll('a')).some((a) => textOf(a) === 'Brief'),
  );
}

/** Chooses `lens` in the gut-reading control (data-control="gut-call") and records it; waits for F1-S2. */
async function recordGutReading(app, lens = 'threat') {
  const option = await waitFor(
    () => app.doc.querySelector(`[data-control="gut-call"] input[type="radio"][value="${lens}"]`),
    `the gut-reading option ${lens} ([data-control="gut-call"] input[type="radio"][value="${lens}"])`,
  );
  await choose(option);
  const [button] = buttonsByText(app.doc.body, 'Record my gut reading');
  if (!button) throw new Error('no "Record my gut reading" button on the trend card');
  await click(button);
  await waitFor(() => app.doc.querySelectorAll('[data-reading]').length === 3, 'the three reading elements of F1-S2 ([data-reading])');
  return lens;
}

/** The reading element of each lens (data-reading="<lens>"). */
function readingElements(doc) {
  const out = {};
  for (const lens of LENSES) {
    const el = doc.querySelector(`[data-reading="${lens}"]`);
    if (!el) throw new Error(`no element data-reading="${lens}"`);
    out[lens] = el;
  }
  return out;
}

function lensOrderOnPage(doc) {
  return Array.from(doc.querySelectorAll('[data-reading]')).map((el) => el.getAttribute('data-reading'));
}

/** The recorded gut reading as the page shows it: the checked, locked gut-call option, or its echo. */
function recordedGutReading(doc) {
  const checked = Array.from(doc.querySelectorAll('[data-control="gut-call"] input[type="radio"]')).filter((o) => o.checked);
  const echo = doc.querySelector('[data-echo="gut-call"]');
  return { checked: checked.map((o) => ({ lens: o.value, locked: o.disabled || Boolean(o.closest('fieldset[disabled]')) })), echo: echo ? textOf(echo) : null };
}

function startupFailureShown(doc) {
  const el = doc.getElementById('startup-failure');
  return Boolean(el && !el.hidden && doc.defaultView.getComputedStyle(el).display !== 'none' && isVisible(el));
}

// ------------------------------------------------------------------------------------------ M10-U3

test('M10-U3 with loadFreeze failing, the static start-up message stays', { needs: ['dom'] }, async ({ root }) => {
  const app = await openApp(root, { fail: ['loadFreeze'] });
  await settle(5);
  assert.ok(startupFailureShown(app.doc), '#startup-failure is present and visible after a failed start');
});

test('M10-U3 with the fixtures, the start-up message is removed only after the first screen has rendered', { needs: ['dom'] }, async ({ root }) => {
  const app = await openApp(root);
  if (app.error) throw new Error(`start() failed with the fixtures: ${app.error.message}`);
  await showsRoute(app, '', ROUTES[0][1]);
  assert.equal(app.doc.getElementById('startup-failure'), null, '#startup-failure is removed from the document');
  const record = app.win.__periscopeStartup;
  assert.ok(record && record.removed, 'the app host observed the removal');
  assert.equal(record.appFilledBeforeRemoval, true, 'something had been rendered into #app before the message was removed');
});

// ------------------------------------------------------------------------------------------ M10-U5

test('M10-U5 every route shows its screen, unknown trends show F1-E1 and unknown routes G-E2', { needs: ['dom'], timeout: 20000 }, async ({ root }) => {
  const app = await openApp(root);
  if (app.error) throw new Error(`start() failed with the fixtures: ${app.error.message}`);
  await showsRoute(app, '', ROUTES[0][1]); // the empty fragment shows the brief
  for (const [hash, markers] of ROUTES) await goTo(app, hash, markers);
  await goTo(app, '#/trend/trend-does-not-exist', ['This trend card does not exist in this build.']);

  await goTo(app, '#/nothing', ['This page does not exist in this build.']);
  const problems = [];
  const toBrief = Array.from(app.doc.querySelectorAll('a')).filter((a) => (a.getAttribute('href') || '').endsWith('#/brief'));
  if (toBrief.length === 0) problems.push('G-E2 has no link to #/brief');
  const nav = mainNav(app.doc);
  if (!nav || !isVisible(nav)) problems.push('G-E2: the navigation is not visible');
  if (!bodyText(app).includes(FREEZE_DATE_TEXT)) problems.push(`G-E2: the demo-wide statement with "${FREEZE_DATE_TEXT}" is not shown`);
  assert.none(problems, 'G-E2 problems');
});

test('M10-U5 the first trend opened follows drawLensOrder(seededRandom(7)) and the session survives every route', { needs: ['dom'], timeout: 20000 }, async ({ root }) => {
  const { drawLensOrder } = await importUnderTest(repoUrl('assets/js/state/lens-order.js'));
  const expected = Array.from(drawLensOrder(seededRandom(7)));
  const app = await openApp(root, { random: seededRandom(7) });
  if (app.error) throw new Error(`start() failed with the fixtures: ${app.error.message}`);
  await showsRoute(app, '', ROUTES[0][1]);
  const record = app.win.__periscopeStartup;
  assert.ok(record && record.startResolved, 'start() settled in the app host');
  assert.equal(record.startValue, undefined, 'start() resolves to undefined (the page exposes no handle on the session)');
  await goTo(app, `#/trend/${ALPHA}`, [ALPHA_TITLE]);
  const gut = await recordGutReading(app, 'threat');
  assert.deepEqual(lensOrderOnPage(app.doc), expected, 'reading order of the first trend opened');
  const before = recordedGutReading(app.doc);

  // Behavioural session check (M10-U5): visit every route, then return to the trend; it shows
  // F1-S2 with the same gut reading and the same lens order.
  for (const [hash, markers] of ROUTES) if (!hash.startsWith('#/trend/')) await goTo(app, hash, markers);
  await goTo(app, `#/trend/${ALPHA}`, [readingMarker('opportunity')]);
  await waitFor(() => app.doc.querySelectorAll('[data-reading]').length === 3, 'F1-S2 on returning to the trend');
  assert.deepEqual(lensOrderOnPage(app.doc), expected, 'reading order after visiting every route');
  const after = recordedGutReading(app.doc);
  const shown = after.checked.length === 1 ? after.checked[0].lens : after.echo;
  assert.ok(shown && new RegExp(gut, 'i').test(shown), `the recorded gut reading (${gut}) is shown on return (checked option or data-echo="gut-call")`);
  assert.ok(after.checked.every((o) => o.locked), 'the recorded gut reading is locked on return');
  assert.deepEqual(after, before, 'the gut reading shows exactly as it did before leaving');
  const enabledRecord = buttonsByText(app.doc.body, 'Record my gut reading').filter((b) => !b.disabled);
  assert.equal(enabledRecord.length, 0, 'no enabled "Record my gut reading" button after returning: the session was kept');
  assert.equal(app.doc.querySelectorAll('[data-control="judgement"]').length, 1, 'the judgement control of F1-S2 is shown');
});

// ------------------------------------------------------------------------------------------ M10-U6

test('M10-U6 with loadLog failing, only the log shows F4-E1', { needs: ['dom'], timeout: 15000 }, async ({ root }) => {
  const app = await openApp(root, { hash: '#/log', fail: ['loadLog'] });
  if (app.error) throw new Error(`start() failed: ${app.error.message}`);
  await showsRoute(app, '#/log', ['The decision log could not be shown because its content failed validation.']);
  for (const [hash, markers] of ROUTES.filter(([h]) => ['#/brief', '#/trends', '#/readiness'].includes(h))) {
    await goTo(app, hash, markers);
    assert.ok(!startupFailureShown(app.doc), `${hash}: G-E1 is not shown`);
  }
});

// ------------------------------------------------------------------------------------------ M10-U7

function navSignature(nav) {
  const copy = nav.cloneNode(true);
  for (const el of [copy, ...copy.querySelectorAll('[aria-current]')]) el.removeAttribute('aria-current');
  return copy.outerHTML;
}

test('M10-U7 the navigation is the same five items, in order, with one template, on every screen', { needs: ['dom'], timeout: 20000 }, async ({ root }) => {
  const app = await openApp(root);
  if (app.error) throw new Error(`start() failed with the fixtures: ${app.error.message}`);
  await showsRoute(app, '', ROUTES[0][1]);
  const problems = [];
  let first = null;
  for (const [hash, markers] of ROUTES) {
    await goTo(app, hash, markers);
    const nav = mainNav(app.doc);
    if (!nav) {
      problems.push(`${hash}: no <nav> with a "Brief" link`);
      continue;
    }
    const links = Array.from(nav.querySelectorAll('a'));
    const texts = links.map(textOf);
    if (JSON.stringify(texts) !== JSON.stringify(NAV_ITEMS)) problems.push(`${hash}: items ${JSON.stringify(texts)}`);
    if (links.some((a) => (a.getAttribute('href') || '').includes('#/scenario'))) problems.push(`${hash}: a scenario item`);
    if (/\d/.test(nav.textContent)) problems.push(`${hash}: a number (count) in the navigation`);
    if (/\bnew\b/i.test(nav.textContent)) problems.push(`${hash}: a "new" marker`);
    const shapes = new Set(links.map((a) => shape(a)));
    const classes = new Set(links.map((a) => a.className));
    const items = Array.from(nav.querySelectorAll('li')).map((li) => `${shape(li).replace(/\(.*\)$/, '')}`);
    if (shapes.size > 1 || classes.size > 1 || new Set(items).size > 1) problems.push(`${hash}: the items do not share one template`);
    const signature = navSignature(nav);
    if (first === null) first = { hash, signature };
    else if (signature !== first.signature) problems.push(`${hash}: the navigation markup differs from ${first.hash} (aria-current ignored)`);
  }
  assert.none(problems, 'navigation problems');
});

// ------------------------------------------------------------------------------------------ M10-U8

function layoutProblems(app, where) {
  const { doc, win } = app;
  const problems = [];
  const html = doc.documentElement;
  const width = html.clientWidth;
  if (html.scrollWidth > width) problems.push(`${where}: scrollWidth ${html.scrollWidth} exceeds clientWidth ${width}`);
  const px = (el) => parseFloat(win.getComputedStyle(el).fontSize);
  if (px(doc.body) < 16) problems.push(`${where}: body font-size ${px(doc.body)}px`);
  for (const p of doc.querySelectorAll('p')) {
    if (isVisible(p) && px(p) < 16) problems.push(`${where}: paragraph "${textOf(p).slice(0, 40)}" at ${px(p)}px`);
  }
  for (const el of doc.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"]')) {
    if (!isVisible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.left < -0.5 || r.right > width + 0.5) {
      problems.push(`${where}: control "${textOf(el).slice(0, 30) || el.tagName}" spans ${Math.round(r.left)}..${Math.round(r.right)} beyond width ${width}`);
    }
  }
  return problems;
}

test('M10-U8 at the four Q-7 viewports every route fits, reads at 16px and keeps the readings equal', { needs: ['dom'], timeout: 120000 }, async ({ root }) => {
  const problems = [];
  for (const [width, height] of VIEWPORTS) {
    const vp = `${width}x${height}`;
    const app = await openApp(root, { width, height, random: seededRandom(11) });
    if (app.error) throw new Error(`start() failed with the fixtures at ${vp}: ${app.error.message}`);
    await showsRoute(app, '', ROUTES[0][1]);
    for (const [hash, markers] of ROUTES) {
      await goTo(app, hash, markers);
      problems.push(...layoutProblems(app, `${vp} ${hash}`));
      if (hash === '#/log') {
        const [statement] = smallestContaining(app.doc.body, /retrospective replay[\s\S]*Verifier|Verifier[\s\S]*retrospective replay/);
        if (!statement) problems.push(`${vp} #/log: no replay statement found`);
        else {
          const r = statement.getBoundingClientRect();
          if (r.top < 0 || r.left < 0 || r.bottom > app.win.innerHeight || r.right > app.doc.documentElement.clientWidth) {
            problems.push(`${vp} #/log: the replay statement (${Math.round(r.top)}..${Math.round(r.bottom)}) is not entirely within the ${height}px viewport`);
          }
        }
      }
    }
    // F1-S2: the three readings at equal size and weight, equal widths when side by side.
    await goTo(app, `#/trend/${ALPHA}`, [ALPHA_TITLE]);
    await recordGutReading(app);
    problems.push(...layoutProblems(app, `${vp} F1-S2`));
    const els = Object.values(readingElements(app.doc));
    const styles = els.map((el) => app.win.getComputedStyle(el));
    if (new Set(styles.map((s) => s.fontSize)).size !== 1) problems.push(`${vp} F1-S2: reading font-sizes ${styles.map((s) => s.fontSize)}`);
    if (new Set(styles.map((s) => s.fontWeight)).size !== 1) problems.push(`${vp} F1-S2: reading font-weights ${styles.map((s) => s.fontWeight)}`);
    const rects = els.map((el) => el.getBoundingClientRect());
    const sideBySide = rects.every((r) => Math.abs(r.top - rects[0].top) <= 1);
    if (sideBySide && Math.max(...rects.map((r) => r.width)) - Math.min(...rects.map((r) => r.width)) > 1) {
      problems.push(`${vp} F1-S2: side-by-side reading widths ${rects.map((r) => Math.round(r.width))}`);
    }
    app.frame.remove();
  }
  assert.none(problems, 'responsive layout problems');
});
