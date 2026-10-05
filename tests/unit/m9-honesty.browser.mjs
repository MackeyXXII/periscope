// M9 Honesty and provenance layer, DOM tests: M9-U1 to M9-U9 (M9-U2's formatDate part is in
// m9-honesty.test.mjs). Written from docs/04-module-design.md (M9), docs/02-system-requirements.md
// (C-5) and docs/03-architecture.md (section 8) before assets/js/honesty/* exists (test-first
// rule). Browser runner only. At G2 every test fails with "module under test could not be
// imported".
//
// THE WALK (M9-U1, U8, U9). M9-U1 allows either the app host with
// start({ loader, flow: 'interactive', levelNames }) or each screen's render function with the
// same context. These tests take the second: each screen is rendered in a fresh document that
// links main.css, with the real loader over the fixtures: trend index; brief; trend card F1-S1,
// F1-S2 and F1-S4; F5-S2 with ctx.flow 'interactive'; readiness unverified and verified (the
// fixture level names passed to createLoader and renderReadiness); governance; log. The shell is
// covered by M9-U4 through the app host, and the demo-wide statement by renderDemoStatement in
// M9-U8.
//
// BADGES (M9-U2, M9-U9). renderLabel returns a badge carrying data-badge="<value>" and never
// data-label (the DOM hooks table), so a count of data-label values is a count of labelled
// elements: M9-U9 requires exactly one element with data-label="frozen" across the walk, the
// brief header; its badge carries data-badge="frozen" and is not counted.
//
// M9's functions are taken from the files the module design places them in (labels.js,
// sources.js, statement.js; see honesty() in tests/lib/screens.mjs).

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { loadContent } from '../lib/content.mjs';
import { seededRandom } from '../lib/seeded-random.mjs';
import {
  mount, appFrame, textOf, findBadge, labelChain, textNodesContaining, smallestContaining,
} from '../lib/dom.mjs';
import {
  load, honesty, screenContext, fixtureLoader, fixtureManifest, fixtureModule, show,
  recordScenarioInPage, openTrend, recordGut, fillJudgement, commit, readingElements, ORDER_NOTE,
} from '../lib/screens.mjs';

const ALPHA = 'trend-fixture-alpha';
const DOM = { needs: ['dom'] };
const LONG = { needs: ['dom'], timeout: 30000 };
const SIX = ['real', 'ai-generated', 'frozen', 'fictional', 'replay', 'yours'];
const FIXTURE_LEVEL_NAMES = Object.freeze(['Fixture level one', 'Fixture level two', 'Fixture level three']);
const NOTES = [
  ORDER_NOTE,
  'Listed alphabetically.',
  'Listed by publication date. The order says nothing about importance.',
  'Listed by the date of the original signal.',
];

async function labelDisplay() {
  const V = await load('vocabulary');
  return V.LABEL_DISPLAY;
}

/**
 * Renders every screen of the walk in turn and calls visit(stage, root) on each. Resolves to the
 * list of stage names visited.
 */
async function fullWalk(host, visit) {
  const [I, B, T, Sc, R, G, L] = await Promise.all(
    ['trendIndex', 'brief', 'trend', 'scenario', 'readiness', 'governance', 'log'].map(load),
  );
  const stages = [];
  const page = await mount(host);
  const at = async (stage) => {
    stages.push(stage);
    await visit(stage, page.root);
  };
  const { ctx } = await screenContext({ random: seededRandom(91), flow: 'interactive' });
  await show(page, I.renderTrendIndex, ctx);
  await at('F1-S0 trend index');
  await show(page, B.renderBrief, ctx);
  await at('F2-S1 brief');
  await openTrend(page, T, ctx, ALPHA);
  await at('F1-S1');
  await recordGut(page, { lens: 'threat', reason: 'zebra-test-reason' });
  await at('F1-S2');
  await walkToCommittedFromS2(page);
  await at('F1-S4');
  await show(page, Sc.renderScenario, ctx, ALPHA);
  await recordScenarioInPage(page);
  await at('F5-S2');
  await show(page, R.renderReadiness, ctx, {});
  await at('F3 readiness, unverified');
  const verified = await fixtureModule('content/readiness-verified.js');
  const { ctx: vctx } = await screenContext({ overrides: { 'data/readiness.js': verified }, levelNames: FIXTURE_LEVEL_NAMES });
  await show(page, R.renderReadiness, vctx, { levelNames: FIXTURE_LEVEL_NAMES });
  await at('F3 readiness, verified');
  await show(page, G.renderGovernance, ctx);
  await at('F3-S3 governance');
  await show(page, L.renderLog, ctx);
  await at('F4-S1 log');
  return stages;
}

async function walkToCommittedFromS2(page) {
  await fillJudgement(page, { lens: 'noise', rationale: 'zebra-test-rationale', answer: 'zebra-test-answer' });
  await commit(page);
}

/** For a fixture text: its nearest labelled element must carry `want[0]`, then `want[1]` … outwards, and show its own badge. */
function partLabelProblems(root, text, want, display, what) {
  const nodes = textNodesContaining(root, text);
  if (nodes.length === 0) return [`${what}: ${JSON.stringify(text.slice(0, 40))} is not shown`];
  const problems = [];
  for (const n of nodes) {
    const chain = labelChain(n);
    if (JSON.stringify(chain.slice(0, want.length)) !== JSON.stringify(want)) {
      problems.push(`${what}: labels from the text outwards are ${JSON.stringify(chain)}, expected to begin ${JSON.stringify(want)}`);
      continue;
    }
    const own = n.parentElement.closest('[data-label]');
    if (!findBadge(own, display[want[0]])) problems.push(`${what}: no visible "${display[want[0]]}" badge of its own`);
  }
  return problems;
}

// ------------------------------------------------------------------------------------------ M9-U1

test('M9-U1 across the walk, every content element carries a vocabulary label and its visible badge', LONG, async ({ root }) => {
  const display = await labelDisplay();
  const problems = [];
  let counted = 0;
  await fullWalk(root, (stage, r) => {
    const content = Array.from(r.querySelectorAll('[data-content]'));
    if (content.length === 0) problems.push(`${stage}: no element carries data-content`);
    counted += content.length;
    for (const el of content) {
      const value = el.getAttribute('data-label');
      const name = `${stage}: <${el.tagName.toLowerCase()}> "${textOf(el).slice(0, 40)}"`;
      if (!SIX.includes(value)) {
        problems.push(`${name} carries data-label ${JSON.stringify(value)}`);
        continue;
      }
      if (!findBadge(el, display[value])) problems.push(`${name} has no visible "${display[value]}" badge`);
    }
  });
  assert.ok(counted > 0, 'the walk found content elements');
  assert.none(problems, 'content elements without a correct label');
});

// ------------------------------------------------------------------------------------------ M9-U2

test('M9-U2 renderLabel returns the badge for each of the six values and throws for anything else', DOM, async () => {
  const H = await honesty();
  const display = await labelDisplay();
  const problems = [];
  for (const value of SIX) {
    let el;
    try {
      el = H.renderLabel(value);
    } catch (error) {
      problems.push(`renderLabel(${value}) threw: ${error.message}`);
      continue;
    }
    if (!el || el.nodeType !== 1) problems.push(`renderLabel(${value}) did not return an element`);
    else {
      if (el.getAttribute('data-badge') !== value) problems.push(`renderLabel(${value}) carries data-badge ${JSON.stringify(el.getAttribute('data-badge'))}, expected ${JSON.stringify(value)}`);
      if (el.hasAttribute('data-label')) problems.push(`renderLabel(${value}) carries data-label (a badge must not)`);
      if (textOf(el) !== display[value]) problems.push(`renderLabel(${value}) shows ${JSON.stringify(textOf(el))}, expected ${JSON.stringify(display[value])}`);
    }
  }
  for (const bad of ['verified', '', undefined, 'AI', 'Yours']) {
    let threw = false;
    try {
      H.renderLabel(bad);
    } catch {
      threw = true;
    }
    if (!threw) problems.push(`renderLabel(${JSON.stringify(bad)}) did not throw`);
  }
  assert.none(problems, 'renderLabel errors');
});

// ------------------------------------------------------------------------------------------ M9-U3

function textAfter(container, anchor) {
  const range = container.ownerDocument.createRange();
  range.setStartAfter(anchor);
  range.setEnd(container, container.childNodes.length);
  return range.toString().replace(/\s+/g, ' ').trim();
}

test('M9-U3 renderSource renders a safe outbound link followed by publisher, date and, for a report, the page', DOM, async ({ root }) => {
  const H = await honesty();
  const page = await mount(root);
  const ref = {
    url: 'https://example.org/fixture/zebra-source',
    publisher: 'Example Gazette',
    title: 'Zebra fixture source title',
    publishedOn: '2026-02-10',
    retrievedOn: '2026-10-01',
  };
  const citation = { ...ref, url: 'https://example.org/fixture/zebra-report', title: 'Zebra fixture report', page: '417' };
  const problems = [];
  for (const [what, value] of [['sourceRef', ref], ['reportCitation', citation]]) {
    const box = page.doc.createElement('div');
    page.root.appendChild(box);
    box.appendChild(H.renderSource(value));
    const a = box.querySelector('a');
    if (!a) {
      problems.push(`${what}: no <a>`);
      continue;
    }
    if (a.getAttribute('href') !== value.url) problems.push(`${what}: href ${a.getAttribute('href')}, expected ${value.url}`);
    if (!a.getAttribute('href').startsWith('https://')) problems.push(`${what}: href does not start with https://`);
    if (a.getAttribute('target') !== '_blank') problems.push(`${what}: target is ${a.getAttribute('target')}`);
    const rel = (a.getAttribute('rel') || '').split(/\s+/);
    if (!rel.includes('noopener') || !rel.includes('noreferrer')) problems.push(`${what}: rel is ${JSON.stringify(a.getAttribute('rel'))}`);
    const after = textAfter(box, a);
    if (!after.includes(value.publisher)) problems.push(`${what}: the publisher does not follow the link (${JSON.stringify(after)})`);
    if (!after.includes(H.formatDate(value.publishedOn))) problems.push(`${what}: the formatted publication date does not follow the link (${JSON.stringify(after)})`);
    if (what === 'reportCitation' && !/\b417\b/.test(after)) problems.push(`reportCitation: the page does not follow the link (${JSON.stringify(after)})`);
  }
  const undated = { ...ref };
  delete undated.publishedOn;
  let threw = false;
  try {
    H.renderSource(undated);
  } catch {
    threw = true;
  }
  if (!threw) problems.push('renderSource did not throw for a reference without publishedOn');
  assert.none(problems, 'renderSource errors');
});

// ------------------------------------------------------------------------------------------ M9-U4

test('M9-U4 every route shows the demo-wide statement with the manifest freeze date', LONG, async ({ root }) => {
  const H = await honesty();
  const manifest = await fixtureManifest();
  const { loader } = await fixtureLoader();
  const app = await appFrame(root, { hash: '#/brief', options: { loader, random: seededRandom(4) } });
  assert.ok(!app.error, `start() succeeded in the app host (${app.error && app.error.message})`);
  const want = H.formatDate(manifest.frozenOn);
  const problems = [];
  for (const route of ['#/brief', '#/trends', `#/trend/${ALPHA}`, `#/scenario/${ALPHA}`, '#/readiness', '#/governance', '#/log', '#/nothing']) {
    await app.navigate(route);
    const text = textOf(app.doc.body);
    const m = /All content was produced offline and frozen on (.+?); nothing in this demo calls an AI service or the network/.exec(text);
    if (!m) problems.push(`${route}: no demo-wide statement`);
    else if (m[1] !== want) problems.push(`${route}: the statement gives ${JSON.stringify(m[1])}, expected ${JSON.stringify(want)}`);
  }
  assert.none(problems, 'routes without the correct demo-wide statement');
});

// ------------------------------------------------------------------------------------------ M9-U5

function peerBadgeProblems(peers, value, display, what) {
  if (peers.length < 2) return [`${what}: fewer than two peers found (${peers.length})`];
  const problems = [];
  const markup = peers.map((p) => {
    if (p.getAttribute('data-label') !== value) problems.push(`${what}: a peer carries ${JSON.stringify(p.getAttribute('data-label'))}`);
    const b = findBadge(p, display[value]);
    if (!b) problems.push(`${what}: a peer has no "${display[value]}" badge`);
    return b ? b.outerHTML : '(none)';
  });
  if (new Set(markup).size !== 1) problems.push(`${what}: label markup differs between peers: ${[...new Set(markup)].join(' | ')}`);
  return problems;
}

function outermost(elements) {
  return elements.filter((el) => !elements.some((o) => o !== el && o.contains(el)));
}

test('M9-U5 peers carry byte-identical label markup: readings, conversation questions, brief signals', LONG, async ({ root }) => {
  const display = await labelDisplay();
  const [B, T, Sc] = await Promise.all(['brief', 'trend', 'scenario'].map(load));
  const page = await mount(root);
  const { ctx } = await screenContext({ random: seededRandom(95), flow: 'interactive' });
  const problems = [];
  await openTrend(page, T, ctx, ALPHA);
  await recordGut(page, { lens: 'threat' });
  problems.push(...peerBadgeProblems(readingElements(page.root), 'ai-generated', display, 'readings in F1-S2'));
  await walkToCommittedFromS2(page);
  await show(page, Sc.renderScenario, ctx, ALPHA);
  await recordScenarioInPage(page);
  problems.push(...peerBadgeProblems(Array.from(page.root.querySelectorAll('[data-question]')), 'ai-generated', display, 'conversation questions in F5-S2'));
  await show(page, B.renderBrief, ctx);
  const signals = Array.from(page.root.querySelectorAll('[data-signal]'));
  problems.push(...peerBadgeProblems(signals, 'real', display, 'signals in F2-S1'));
  assert.none(problems, 'peer label differences');
});

// ------------------------------------------------------------------------------------------ M9-U6

test('M9-U6 parts with their own origin show their own label: signal texts, log parts, argument paragraphs, next-level descriptions', LONG, async ({ root }) => {
  const display = await labelDisplay();
  const content = await loadContent({ from: 'fixtures' });
  const [B, G, L, R] = await Promise.all(['brief', 'governance', 'log', 'readiness'].map(load));
  const page = await mount(root);
  const { ctx } = await screenContext({ random: seededRandom(96) });
  const problems = [];

  await show(page, B.renderBrief, ctx);
  const sig = content.signals.find((s) => s.id === content.brief.signalIds[0]);
  problems.push(...partLabelProblems(page.root, sig.summary.text, ['ai-generated', 'real'], display, 'signal summary'));
  problems.push(...partLabelProblems(page.root, sig.relevanceNote.text, ['ai-generated', 'real'], display, 'signal relevance note'));

  await show(page, L.renderLog, ctx);
  for (const e of content.log) {
    for (const s of e.originalSignals) {
      problems.push(...partLabelProblems(page.root, s.title, ['real', 'replay'], display, `${e.id} original signal`));
      problems.push(...partLabelProblems(page.root, s.summary.text, ['ai-generated', 'real', 'replay'], display, `${e.id} signal summary`));
    }
    problems.push(...partLabelProblems(page.root, e.pastJudgement.rationale, ['replay', 'replay'], display, `${e.id} past judgement`));
    problems.push(...partLabelProblems(page.root, e.outcome.summary.text, ['ai-generated', 'real', 'replay'], display, `${e.id} outcome summary`));
    problems.push(...partLabelProblems(page.root, e.calibrationNote.text, ['ai-generated', 'replay'], display, `${e.id} calibration note`));
    // The outcome element itself shows its own Real badge.
    const outcomeText = textNodesContaining(page.root, e.outcome.summary.text)[0];
    if (outcomeText) {
      const outcomeEl = outcomeText.parentElement.closest('[data-label="ai-generated"]').parentElement.closest('[data-label]');
      if (!outcomeEl || !findBadge(outcomeEl, display.real)) problems.push(`${e.id} outcome: no visible "${display.real}" badge of its own`);
    }
  }

  await show(page, G.renderGovernance, ctx);
  for (const p of content.governance.argument) {
    problems.push(...partLabelProblems(page.root, p.text, ['ai-generated'], display, `argument paragraph ${p.id}`));
  }

  const verified = content.readinessVerified;
  const { ctx: vctx } = await screenContext({ overrides: { 'data/readiness.js': verified }, levelNames: FIXTURE_LEVEL_NAMES });
  await show(page, R.renderReadiness, vctx, { levelNames: FIXTURE_LEVEL_NAMES });
  const descriptions = verified.maturity.practices
    .map((p) => p.nextLevel && p.nextLevel.description && p.nextLevel.description.text)
    .filter(Boolean);
  if (descriptions.length === 0) problems.push('the verified fixture has no next-level description (fixture changed?)');
  for (const d of descriptions) problems.push(...partLabelProblems(page.root, d, ['ai-generated'], display, 'next-level description'));
  assert.none(problems, 'per-part label problems');
});

// ------------------------------------------------------------------------------------------ M9-U7

test('M9-U7 renderQuote marks up a quote of at most fifteen words with its language and publisher', DOM, async ({ root }) => {
  const H = await honesty();
  const page = await mount(root);
  const fifteen = 'zebra eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn vierzehn';
  const sixteen = `${fifteen} fünfzehn`;
  assert.equal(fifteen.split(' ').length, 15, 'the fifteen-word quote has fifteen words');
  const box = page.doc.createElement('div');
  page.root.appendChild(box);
  box.appendChild(H.renderQuote(fifteen, 'de', 'Example Zeitung'));
  const q = box.querySelector('q');
  assert.ok(q, 'the quote is wrapped in <q>');
  assert.equal(q.getAttribute('lang'), 'de', 'the <q> carries lang equal to the source language');
  assert.equal(textOf(q), fifteen, 'the <q> holds the quote');
  assert.includes(textAfter(box, q), 'Example Zeitung', 'the publisher follows the quote');
  assert.throws(() => H.renderQuote(sixteen, 'de', 'Example Zeitung'), undefined, 'a sixteen-word quote must throw');
});

// ------------------------------------------------------------------------------------------ M9-U8

test('M9-U8 interface copy carries no label: headings, buttons, labels, notes and statements', LONG, async ({ root }) => {
  const H = await honesty();
  const manifest = await fixtureManifest();
  const problems = [];
  const seen = new Set();
  await fullWalk(root, (stage, r) => {
    for (const el of r.querySelectorAll('h1, h2, h3, h4, h5, h6, button, label')) {
      if (el.hasAttribute('data-label')) problems.push(`${stage}: <${el.tagName.toLowerCase()}> "${textOf(el).slice(0, 40)}" carries data-label`);
    }
    const copies = [...NOTES];
    const replay = smallestContaining(r, /retrospective replay/i);
    for (const el of replay) copies.push(textOf(el));
    for (const copy of copies) {
      for (const el of smallestContaining(r, copy)) {
        seen.add(copy);
        for (let a = el; a && a !== r && textOf(a) === textOf(el); a = a.parentElement) {
          if (a.hasAttribute('data-content') || a.hasAttribute('data-label')) problems.push(`${stage}: interface copy "${copy.slice(0, 40)}" carries data-content or data-label`);
        }
      }
    }
  });
  if (!seen.has(ORDER_NOTE)) problems.push('the walk never showed the readings ordering note');
  const box = (await mount(root)).root;
  box.appendChild(H.renderDemoStatement(manifest));
  if (!/All content was produced offline/.test(textOf(box))) problems.push('renderDemoStatement shows no demo-wide statement');
  for (const el of [box, ...box.querySelectorAll('*')].slice(1)) {
    if (el.hasAttribute('data-content') || el.hasAttribute('data-label')) problems.push('the demo-wide statement carries data-content or data-label');
  }
  assert.none([...new Set(problems)], 'labelled interface copy');
});

// ------------------------------------------------------------------------------------------ M9-U9

test('M9-U9 frozen labels only the brief: exactly one element across the walk, the F2-S1 header', LONG, async ({ root }) => {
  const display = await labelDisplay();
  const found = [];
  const problems = [];
  await fullWalk(root, (stage, r) => {
    // Badges carry data-badge, never data-label, so they are not in this count.
    for (const el of r.querySelectorAll('[data-label="frozen"]')) {
      found.push(stage);
      if (el.hasAttribute('data-badge')) problems.push(`${stage}: an element carries both data-badge and data-label="frozen"`);
      if (!el.hasAttribute('data-content')) problems.push(`${stage}: <${el.tagName.toLowerCase()}> carries data-label="frozen" without data-content`);
      else if (!findBadge(el, display.frozen, 'frozen')) problems.push(`${stage}: the frozen element has no data-badge="frozen" badge of its own`);
    }
  });
  if (found.length !== 1 || found[0] !== 'F2-S1 brief') problems.push(`elements with data-label="frozen": ${JSON.stringify(found)}, expected exactly one, in "F2-S1 brief"`);
  assert.none(problems, 'frozen label problems');
});
