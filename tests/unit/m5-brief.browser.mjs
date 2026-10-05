// M5 Brief composer, DOM part: unit tests M5-U2 and M5-U5 to M5-U11 (runner: browser).
// The pure tests (M5-U1, M5-U3, M5-U4) are in m5-brief.test.mjs.
// Written from docs/04-module-design.md (M5) before assets/js/screens/brief.js exists (test-first
// rule). This file is not a *.test.mjs file, so `node --test` never loads it; every test also
// declares needs: ['dom'].
//
// Status at G2: every test fails until assets/js/screens/brief.js, assets/js/contracts/load.js,
// validate.js and vocabulary.js (and M9, which the screen uses for labels) exist. data/ parts are
// skipped with "needs data/ (G3)".
//
// How the screen is driven. renderBrief(root, ctx) receives:
//   loader   the real M1 loader, createLoader({ importer }), with an importer that serves the
//            synthetic fixtures (or a named invalid fixture) for each data/ path it is asked for;
//   routes   a stub whose every function returns '#/zebra-route/<name>/<args>', so that a link
//            built from ctx.routes is recognisable and a hard-coded route is not;
//   freeze and manifest   the freeze manifest, under both names (the specification names the
//            manifest but not its key; M6's ctx calls it `manifest`).
// A Promise returned by renderBrief is awaited, and the event loop is then let run twice.
//
// INTERPRETATIONS AND SPECIFICATION QUESTIONS, reported to the Orchestrator:
//   - A "signal element" is the outermost element with data-content and data-label="real" that
//     contains that signal's title and no other signal's title.
//   - M5-U6, "child structure": the tag and class list of each direct child of the signal element.
//     Deeper structure cannot be identical, because a signal in two trends has two trend links
//     where the others have one (M5-U7 requires that), so a recursive comparison could never pass.
//     Also, the synthetic brief includes one signal with a quote (sig-2026-05-20-zebra-delta) and
//     four without, so the test passes only if a quote sits inside a child that every signal
//     element has. If the Architect intends optional parts to be exempt, M5-U6 needs rewording.
//   - M5-U6, markers: class names and attribute names are split into tokens (as in M1-U2) and
//     checked, with attribute values (except href) and the screen's own text, for the whole words
//     new, pinned, featured and relevant.
//   - M5-U8, position numbers: "1." and "#1" forms in the interface text of a signal element, and
//     signal elements rendered as items of a numbered list (<ol> whose items show a marker).
//   - M5-U11: "shows the freeze date" accepts the date as formatted by M9 ("5 October 2026") or in
//     ISO form; a "visible badge" is an element whose whole text is LABEL_DISPLAY[value], rendered
//     inside the labelled element or beside it in its parent, with a client rect and not hidden.

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { importUnderTest, repoUrl } from '../lib/env.mjs';
import { loadContent, clone, fixturePathFor } from '../lib/content.mjs';
import { nameTokens } from '../lib/contract-rules.mjs';
import { wholeWordHits } from '../lib/text-rules.mjs';

const CONSTANTS = repoUrl('assets/js/contracts/constants.js');
const VOCABULARY = repoUrl('assets/js/contracts/vocabulary.js');
const LOAD = repoUrl('assets/js/contracts/load.js');
const BRIEF_SCREEN = repoUrl('assets/js/screens/brief.js');

const ROUTE_PREFIX = '#/zebra-route/';
const routes = new Proxy(
  {},
  {
    get(_, key) {
      if (typeof key !== 'string' || key === 'then') return undefined;
      return (...args) => `${ROUTE_PREFIX}${key}/${args.join('/')}`;
    },
  },
);

const ORDERING_NOTE = 'Listed by publication date. The order says nothing about importance.';
const WITHHELD_NOTICE = '2 signal(s) were withheld because they failed the provenance check.';
const E1_MESSAGE = 'The weekly brief could not be shown because its content failed validation.';
const EMPTY_MESSAGE = 'This brief contains no signals.';
const NO_TREND = 'No trend card for this signal in this build.';
const MARKER_WORDS = ['new', 'pinned', 'featured', 'relevant'];

// ------------------------------------------------------------------------------------------ helpers

function norm(s) {
  return String(s).replace(/\s+/g, ' ').trim();
}

async function invalidFixture(name) {
  return (await import(repoUrl(`tests/fixtures/invalid/${name}`).href)).default;
}

/**
 * Renders F2 into `root`. `overrides` maps a data/ path to the value served for it; `patch`
 * replaces loader functions (for example loadTrends) on a copy of the real loader.
 */
async function renderF2(root, { from = 'fixtures', overrides = {}, patch = null } = {}) {
  const L = await importUnderTest(LOAD);
  const S = await importUnderTest(BRIEF_SCREEN);
  assert.equal(typeof L.createLoader, 'function', 'load.js exports createLoader');
  assert.equal(typeof S.renderBrief, 'function', 'brief.js exports renderBrief');
  const content = await loadContent({ from });
  const importer = async (path) => {
    const m = /data\/(.+\.js)$/.exec(String(path));
    if (!m) throw new Error(`fixture importer: no data path in ${path}`);
    const key = `data/${m[1]}`;
    if (Object.prototype.hasOwnProperty.call(overrides, key)) return { default: overrides[key] };
    const url = from === 'data' ? repoUrl(key) : repoUrl(fixturePathFor(key));
    return import(url.href);
  };
  let loader = L.createLoader({ importer });
  if (patch) loader = Object.assign({}, loader, patch);
  const freeze = content.freeze;
  await S.renderBrief(root, { loader, routes, freeze, manifest: freeze });
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));
  return content;
}

/** The signal element of each signal, as a Map from id to element (or null). */
function signalElements(root, signals) {
  const out = new Map();
  const candidates = [...root.querySelectorAll('[data-content][data-label="real"]')];
  for (const s of signals) {
    const others = signals.filter((o) => o !== s).map((o) => o.title);
    const own = candidates.filter((el) => el.textContent.includes(s.title) && !others.some((t) => el.textContent.includes(t)));
    const outermost = own.filter((el) => !own.some((o) => o !== el && o.contains(el)));
    out.set(s.id, outermost[0] || null);
  }
  return out;
}

function briefSignals(content) {
  const byId = new Map(content.signals.map((s) => [s.id, s]));
  return content.brief.signalIds.map((id) => byId.get(id)).filter(Boolean);
}

/** The strings a signal contributes from its fixture fields. */
function fieldStrings(signal) {
  return [
    signal.title,
    signal.summary && signal.summary.text,
    signal.relevanceNote && signal.relevanceNote.text,
    signal.quote,
    signal.windowNote,
    signal.provenance && signal.provenance.publisher,
    signal.provenance && signal.provenance.sourceUrl,
  ].filter((x) => typeof x === 'string' && x.length > 0);
}

/** The text of an element with its text nodes joined by spaces, so that adjacent elements' words stay apart. */
function spacedText(el) {
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const parts = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) parts.push(n.nodeValue);
  return parts.join(' ');
}

/** The text a screen adds around the fixture fields: the element's text with every field string removed. */
function interfaceText(text, strings) {
  let t = norm(text);
  for (const s of strings.map(norm).sort((a, b) => b.length - a.length)) t = t.split(s).join(' ');
  return norm(t);
}

function tagAndClass(el) {
  return `${el.tagName}.${[...el.classList].sort().join('.')}`;
}

/** The template of a signal element: its tag and class list, and the tag and class list of each child. */
function shape(el) {
  return `${tagAndClass(el)}(${[...el.children].map(tagAndClass).join(',')})`;
}

function visible(el) {
  if (!el.getClientRects().length) return false;
  const cs = getComputedStyle(el);
  return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0;
}

/** A visible badge reading `display` for the labelled element `el`: inside it, or beside it in its parent. */
function badgeFor(el, display, exclude = new Set()) {
  const scope = el.parentElement || el;
  const found = [...scope.querySelectorAll('*')].filter((b) => {
    if (exclude.has(b) || norm(b.textContent) !== display || !visible(b)) return false;
    if (b.querySelector('*') && [...b.children].some((c) => norm(c.textContent) === display)) return false; // innermost only
    if (el.contains(b)) return true;
    // Beside it: not inside another labelled content element within the same parent.
    const owner = b.closest('[data-content]');
    return !owner || owner === el || owner.contains(el);
  });
  return found[0] || null;
}

// ------------------------------------------------------------------------------------------ M5-U2

async function readingTimeCheck(root, from) {
  const { READING_WPM } = await importUnderTest(CONSTANTS);
  assert.ok(Number.isInteger(READING_WPM) && READING_WPM > 0, 'READING_WPM is a positive integer');
  const content = await renderF2(root, { from });
  assert.ok(root.textContent.includes(briefSignals(content)[0].title), 'the brief rendered its signals');
  const words = root.textContent.split(/\s+/).filter(Boolean).length;
  const minutes = words / READING_WPM;
  assert.ok(minutes <= 10, `F2-S1 has ${words} words, ${minutes.toFixed(2)} minutes at ${READING_WPM} wpm, more than 10`);
}

test('M5-U2 F2-S1 for the synthetic brief reads in ten minutes or less', { needs: ['dom'] }, async ({ root }) => {
  await readingTimeCheck(root, 'fixtures');
});

test('M5-U2 F2-S1 for the brief in data/ reads in ten minutes or less', { needs: ['dom', 'data'] }, async ({ root }) => {
  await readingTimeCheck(root, 'data');
});

// ------------------------------------------------------------------------------------------ M5-U5

test('M5-U5 two signals failing the per-signal check are withheld and counted', { needs: ['dom'] }, async ({ root }) => {
  const fixture = await invalidFixture('brief-two-bad-signals.js');
  const bad = fixture.signals.filter((s) => s.id.includes('zebra-withheld'));
  const kept = fixture.signals.filter((s) => !s.id.includes('zebra-withheld'));
  assert.equal(bad.length, 2, 'the fixture has two bad signals');
  await renderF2(root, { overrides: { 'data/brief.js': fixture.brief, 'data/signals.js': fixture.signals } });
  const html = root.innerHTML;
  const problems = [];
  for (const s of bad) for (const str of [s.id, ...fieldStrings(s)]) if (html.includes(str)) problems.push(`withheld ${s.id} rendered ${JSON.stringify(str)}`);
  for (const s of kept) if (!root.textContent.includes(s.title)) problems.push(`valid signal ${s.id} is not rendered`);
  if (!norm(root.textContent).includes(WITHHELD_NOTICE)) problems.push(`notice "${WITHHELD_NOTICE}" missing`);
  assert.none(problems, 'withholding defects');
});

// ------------------------------------------------------------------------------------------ M5-U6

function markerProblems(el, strings) {
  const problems = [];
  for (const node of [el, ...el.querySelectorAll('*')]) {
    for (const cls of node.classList) {
      const hits = nameTokens(cls).filter((t) => MARKER_WORDS.includes(t));
      if (hits.length) problems.push(`class "${cls}" on <${node.tagName.toLowerCase()}>`);
    }
    for (const attr of node.attributes) {
      if (attr.name === 'class') continue;
      const nameHits = nameTokens(attr.name).filter((t) => MARKER_WORDS.includes(t));
      const valueHits = attr.name === 'href' ? [] : wholeWordHits(attr.value, MARKER_WORDS);
      if (nameHits.length || valueHits.length) problems.push(`attribute ${attr.name}="${attr.value}" on <${node.tagName.toLowerCase()}>`);
    }
  }
  const textHits = wholeWordHits(interfaceText(spacedText(el), strings), MARKER_WORDS);
  if (textHits.length) problems.push(`interface text says ${textHits.join(', ')}`);
  return problems;
}

test('M5-U6 every signal element in F2-S1 has one template and no marker, and the ordering note is present', { needs: ['dom'] }, async ({ root }) => {
  const content = await renderF2(root);
  const signals = briefSignals(content);
  const elements = signalElements(root, signals);
  const problems = [];
  for (const [id, el] of elements) if (!el) problems.push(`no signal element for ${id}`);
  const found = [...elements.entries()].filter(([, el]) => el);
  if (found.length) {
    const [firstId, first] = found[0];
    const ref = shape(first);
    for (const [id, el] of found.slice(1)) {
      if (shape(el) !== ref) problems.push(`${id} template ${shape(el)} differs from ${firstId} template ${ref}`);
    }
    const trendTitles = content.trends.map((t) => t.title);
    for (const [id, el] of found) {
      const signal = signals.find((s) => s.id === id);
      for (const p of markerProblems(el, [...fieldStrings(signal), ...trendTitles])) problems.push(`${id}: ${p}`);
    }
  }
  if (!norm(root.textContent).includes(ORDERING_NOTE)) problems.push(`ordering note "${ORDERING_NOTE}" missing`);
  assert.none(problems, 'template or marker defects');
});

// ------------------------------------------------------------------------------------------ M5-U7

test('M5-U7 a signal in two trends links to both, in alphabetical order of trend title, through routes.trend', { needs: ['dom'] }, async ({ root }) => {
  const content = await loadContent({ from: 'fixtures' });
  const trends = clone(content.trends);
  const shared = 'sig-2026-03-04-zebra-gamma';
  const owners = trends.filter((t) => t.signalIds.includes(shared));
  assert.equal(owners.length, 2, 'the fixture signal belongs to two trends');
  // Give the second trend in the list the alphabetically first title, so that title order differs
  // from list order and from identifier order.
  const [first, second] = owners;
  second.title = `Zebra aardvark ${second.title}`;
  const expected = [routes.trend(second.id), routes.trend(first.id)];
  await renderF2(root, { overrides: { 'data/trends.js': trends } });
  const el = signalElements(root, briefSignals(content)).get(shared);
  assert.ok(el, `a signal element for ${shared}`);
  const hrefs = [...el.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h.startsWith('#'));
  assert.deepEqual(hrefs, expected, `trend links of ${shared}`);
});

// ------------------------------------------------------------------------------------------ M5-U8

test('M5-U8 F2-S1 shows no relevance level, position number, meter or progress bar', { needs: ['dom'] }, async ({ root }) => {
  const content = await renderF2(root);
  const signals = briefSignals(content);
  const strings = [...content.signals.flatMap(fieldStrings), ...content.trends.map((t) => t.title)];
  const problems = [];
  const screenText = interfaceText(spacedText(root), strings);
  const levels = wholeWordHits(screenText, ['high', 'medium', 'low']);
  if (levels.length) problems.push(`interface text says ${levels.join(', ')}`);
  if (/relevance:/i.test(screenText)) problems.push('interface text says "relevance:"');
  for (const [id, el] of signalElements(root, signals)) {
    if (!el) {
      problems.push(`no signal element for ${id}`);
      continue;
    }
    const text = interfaceText(spacedText(el), strings);
    const m = /(?:^|\s)(#\d+|\d{1,3}\.)(?=\s|$)/.exec(text);
    if (m) problems.push(`${id} shows the position number "${m[1]}"`);
    const li = el.closest('li');
    if (li && li.parentElement && li.parentElement.tagName === 'OL' && getComputedStyle(li).listStyleType !== 'none') {
      problems.push(`${id} is an item of a numbered list`);
    }
  }
  if (root.querySelector('meter, progress')) problems.push('a <meter> or <progress> element is present');
  assert.none(problems, 'relevance or position markers');
});

// ------------------------------------------------------------------------------------------ M5-U9

test('M5-U9 F2-E1: a brief with an extra field "featured" shows the validation message and no signal title', { needs: ['dom'] }, async ({ root }) => {
  const featured = await invalidFixture('brief-featured-field.js');
  assert.ok(Object.prototype.hasOwnProperty.call(featured, 'featured'), 'the fixture has the extra field');
  const content = await renderF2(root, { overrides: { 'data/brief.js': featured } });
  const problems = [];
  if (!norm(root.textContent).includes(E1_MESSAGE)) problems.push(`message "${E1_MESSAGE}" missing`);
  for (const s of content.signals) if (root.textContent.includes(s.title)) problems.push(`signal title rendered: ${s.title}`);
  assert.none(problems, 'F2-E1 defects');
});

// ------------------------------------------------------------------------------------------ M5-U10

test('M5-U10 F2-S0: an empty brief says it contains no signals', { needs: ['dom'] }, async ({ root }) => {
  const empty = await invalidFixture('brief-empty.js');
  assert.equal(empty.signalIds.length, 0, 'the fixture brief is empty');
  await renderF2(root, { overrides: { 'data/brief.js': empty } });
  assert.includes(norm(root.textContent), EMPTY_MESSAGE);
});

test('M5-U10 F1-E0 in F2: with loadTrends failing, every signal says it has no trend card and has no trend link', { needs: ['dom'] }, async ({ root }) => {
  let calls = 0;
  const loadTrends = async () => {
    calls += 1;
    return { ok: false, reason: 'zebra-stub: loadTrends fails for M5-U10', withheld: 0 };
  };
  const content = await renderF2(root, { patch: { loadTrends } });
  const problems = [];
  if (calls === 0) problems.push('the screen never called loadTrends, so the stub was not exercised');
  for (const [id, el] of signalElements(root, briefSignals(content))) {
    if (!el) {
      problems.push(`no signal element for ${id}`);
      continue;
    }
    if (!norm(el.textContent).includes(NO_TREND)) problems.push(`${id} does not say "${NO_TREND}"`);
    const links = [...el.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h.startsWith('#'));
    if (links.length) problems.push(`${id} still has trend links ${JSON.stringify(links)}`);
  }
  assert.none(problems, 'F1-E0 defects in F2');
});

// ------------------------------------------------------------------------------------------ M5-U11

test('M5-U11 F2 labels: frozen header with the freeze date, real signals, ai-generated summary and relevance note', { needs: ['dom'] }, async ({ root }) => {
  const { LABEL_DISPLAY } = await importUnderTest(VOCABULARY);
  const content = await renderF2(root);
  const problems = [];

  const frozenOn = content.brief.provenance.frozenOn;
  const [y, m, d] = frozenOn.split('-').map(Number);
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dateForms = [`${d} ${MONTHS[m - 1]} ${y}`, frozenOn];
  const headers = [...root.querySelectorAll('[data-label="frozen"]')];
  if (headers.length === 0) problems.push('no element carries data-label="frozen" (the brief header)');
  else {
    const header = headers[0];
    if (!dateForms.some((f) => norm(header.textContent).includes(f))) problems.push(`the brief header does not show the freeze date (${dateForms.join(' or ')})`);
    if (!badgeFor(header, LABEL_DISPLAY.frozen)) problems.push(`the brief header has no visible "${LABEL_DISPLAY.frozen}" badge`);
  }

  for (const [id, el] of signalElements(root, briefSignals(content))) {
    if (!el) {
      problems.push(`no signal element with data-label="real" for ${id}`);
      continue;
    }
    if (!badgeFor(el, LABEL_DISPLAY.real)) problems.push(`${id}: no visible "${LABEL_DISPLAY.real}" badge`);
    const signal = content.signals.find((s) => s.id === id);
    const used = new Set();
    for (const [part, text] of [['summary', signal.summary.text], ['relevance note', signal.relevanceNote.text]]) {
      const labelled = [...el.querySelectorAll('[data-label]')].filter((p) => p.textContent.includes(text));
      const own = labelled[labelled.length - 1];
      if (!own) {
        problems.push(`${id}: the ${part} has no element with its own data-label`);
        continue;
      }
      if (own.getAttribute('data-label') !== 'ai-generated') problems.push(`${id}: the ${part} carries data-label="${own.getAttribute('data-label')}", expected ai-generated`);
      const badge = badgeFor(own, LABEL_DISPLAY['ai-generated'], used);
      if (!badge) problems.push(`${id}: the ${part} has no visible "${LABEL_DISPLAY['ai-generated']}" badge of its own`);
      else used.add(badge);
    }
  }
  assert.none(problems, 'label defects in F2');
});
