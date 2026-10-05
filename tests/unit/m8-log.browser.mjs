// M8 Decision log and replay, screen tests: M8-U4, U5, U6, U9 and U10.
// Written from docs/04-module-design.md (M8) and docs/02-system-requirements.md (F4) before
// assets/js/screens/log.js exists (test-first rule). Browser runner only. At G2 every test fails
// with "module under test could not be imported".
//
// The log screen is rendered with renderLog(root, ctx) into a fresh document that links
// assets/css/main.css, with the real M1 loader over the fixtures (tests/lib/screens.mjs). An entry
// is the element with data-entry="<entry id>" (the DOM hooks table of docs/04-module-design.md);
// each part is found by its fixture marker text and the labels around it.
//
// Wording the specification does not fix, and how the tests read it (reported to the Orchestrator):
//   - "the judgements are not the viewer's": one of "not yours", "not your own", "not the
//     viewer's", "not your judgements"; "judgements from this session do not appear": the words
//     "this session" and "do not appear" (or "does not appear").
//   - The authors are named as "Rival Reader" and "Interrogator", as in the replay statement.
// The F4-W1 line is fixed by the "Withheld notices" table: "1 entry was withheld because it lacked
// a dated outcome source or failed validation." and "N entries were withheld because they lacked …".

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { loadContent, clone } from '../lib/content.mjs';
import { mount, textOf, precedes, labelChain, labelOf, textNodesContaining, smallestContaining } from '../lib/dom.mjs';
import { load, honesty, screenContext, fixtureModule, show } from '../lib/screens.mjs';

const DOM = { needs: ['dom'] };
const EMPTY = 'This build contains no replay entries.';
const INVALID = 'The decision log could not be shown because its content failed validation.';
const W1_ONE = '1 entry was withheld because it lacked a dated outcome source or failed validation.';
const W1_TWO = '2 entries were withheld because they lacked a dated outcome source or failed validation.';

async function renderLogWith(root, log) {
  const L = await load('log');
  const overrides = log === undefined ? {} : { 'data/log.js': log };
  const { ctx } = await screenContext({ overrides });
  const page = await mount(root);
  await show(page, L.renderLog, ctx);
  return page;
}

/** The entries: the elements with data-entry="<entry id>" (DOM hooks table). */
function entryElements(root) {
  return Array.from(root.querySelectorAll('[data-entry]'));
}

/** The replay statement: the smallest element holding all of its fixed phrases. */
function replayStatement(root) {
  const holders = smallestContaining(root, /retrospective replay/i);
  for (let el = holders[0]; el && el !== root.parentElement; el = el.parentElement) {
    const t = textOf(el);
    if (/Verifier/.test(t) && /AI-generated/.test(t) && /withheld/i.test(t) && /31 March 2026/.test(t)) return el;
  }
  return null;
}

/** The log with two writing dates (2 and 3 October 2026). */
async function twoDateLog() {
  const log = clone((await loadContent({ from: 'fixtures' })).log);
  log[1].pastJudgement.authoredOn = '2026-10-02';
  return log;
}

function statementProblems(root, { writingDates, formatDate }) {
  const problems = [];
  const s = replayStatement(root);
  if (!s) return ['no replay statement (an element holding "retrospective replay", "1 January … 31 March 2026", "withheld", "Verifier", "AI-generated")'];
  const t = textOf(s);
  for (const phrase of ['retrospective replay', '1 January', '31 March 2026', 'fictional', 'Rival Reader', 'Interrogator', 'withheld', 'Verifier', 'AI-generated']) {
    if (!t.toLowerCase().includes(phrase.toLowerCase())) problems.push(`the replay statement lacks "${phrase}"`);
  }
  if (!/\bsome\b/i.test(t)) problems.push('the replay statement does not say "some"');
  if (/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(of\s+the\s+)?(replay\s+|past\s+)?(entries|entry|judgements?)\b/i.test(t)) {
    problems.push('the replay statement gives a number of entries or judgements');
  }
  if (!/not (yours|your own|the viewer'?s|your judgements)/i.test(t)) problems.push('the replay statement does not say the judgements are not the viewer\'s');
  if (!/this session/i.test(t) || !/(do|does) not appear/i.test(t)) problems.push('the replay statement does not say judgements from this session do not appear');
  for (const d of writingDates) if (!t.includes(formatDate(d))) problems.push(`the replay statement lacks the writing date ${formatDate(d)}`);
  if (s.hasAttribute('data-content') || s.closest('[data-content]')) problems.push('the replay statement is inside a content element');
  const firstContent = root.querySelector('[data-content]');
  if (firstContent && !precedes(s, firstContent)) problems.push('the replay statement is not the first content: a content element precedes it');
  return problems;
}

// ------------------------------------------------------------------------------------------ M8-U4

test('M8-U4 the replay statement comes first and says what the replay is, who wrote it and when', DOM, async ({ root }) => {
  const H = await honesty();
  const problems = [];
  const { log } = await loadContent({ from: 'fixtures' });
  const cases = [
    { name: 'F4-S1, one writing date', log, writingDates: ['2026-10-03'] },
    { name: 'F4-S1, two writing dates', log: await twoDateLog(), writingDates: ['2026-10-02', '2026-10-03'] },
    { name: 'F4-W1', log: await fixtureModule('invalid/log-undated-outcome.js'), writingDates: ['2026-10-03'] },
    { name: 'F4-S0', log: await fixtureModule('invalid/log-empty.js'), writingDates: [] },
    { name: 'F4-E1', log: await fixtureModule('invalid/log-not-array.js'), writingDates: [] },
  ];
  for (const c of cases) {
    const page = await renderLogWith(root, c.log);
    problems.push(...statementProblems(page.root, { writingDates: c.writingDates, formatDate: H.formatDate }).map((p) => `${c.name}: ${p}`));
    page.frame.remove();
  }
  assert.none(problems, 'replay statement problems');
});

// ------------------------------------------------------------------------------------------ M8-U5

test('M8-U5 F4-S1 shows no aggregate, no verdict graphic, and every entry has the same class list', DOM, async ({ root }) => {
  const page = await renderLogWith(root);
  const entries = entryElements(page.root);
  assert.equal(entries.length, 3, 'three entries rendered');
  const text = page.root.textContent;
  const problems = [];
  const ratio = /\d+\s*(of|\/)\s*\d+/.exec(text);
  if (ratio) problems.push(`text matching a count: ${JSON.stringify(ratio[0])}`);
  if (text.includes('%')) problems.push('a "%" sign');
  for (const e of entries) {
    const graphics = e.querySelectorAll('svg, img, canvas, meter, progress');
    if (graphics.length) problems.push(`an entry contains ${Array.from(graphics, (g) => g.tagName.toLowerCase()).join(', ')}`);
  }
  if (new Set(entries.map((e) => Array.from(e.classList).sort().join(' '))).size !== 1) problems.push('entries differ in class list');
  assert.none(problems, 'aggregates or verdicts in F4-S1');
});

// ------------------------------------------------------------------------------------------ M8-U6

test('M8-U6 an entry whose outcome has no source date is withheld entirely and counted', DOM, async ({ root }) => {
  const invalid = await fixtureModule('invalid/log-undated-outcome.js');
  const page = await renderLogWith(root, invalid);
  const withheld = invalid[1];
  const markers = [
    withheld.id,
    ...withheld.originalSignals.map((s) => s.title),
    ...withheld.originalSignals.map((s) => s.summary.text.split(':')[0]),
    withheld.pastJudgement.rationale.split(':')[0],
    withheld.outcome.summary.text.split(':')[0],
    withheld.calibrationNote.text.split(':')[0],
  ];
  const html = page.html();
  assert.none(markers.filter((m) => html.includes(m)), 'parts of the withheld entry in the page');
  assert.equal(entryElements(page.root).length, 2, 'the two valid entries are shown');
  assert.includes(textOf(page.root), W1_ONE, 'the F4-W1 line for one entry');
  assert.notIncludes(textOf(page.root), 'entr(y/ies)', 'the F4-W1 line is proper English, not the Level 2 notation');
});

test('M8-U6 two undated outcomes: both entries are withheld and the notice is in the plural', DOM, async ({ root }) => {
  const log = clone(await fixtureModule('invalid/log-undated-outcome.js'));
  delete log[0].outcome.source.publishedOn;
  const page = await renderLogWith(root, log);
  const html = page.html();
  assert.none([log[0].id, log[1].id].filter((id) => html.includes(id)), 'withheld entry identifiers in the page');
  assert.equal(entryElements(page.root).length, 1, 'the one valid entry is shown');
  assert.includes(textOf(page.root), W1_TWO, 'the F4-W1 line for two entries');
  assert.notIncludes(textOf(page.root), W1_ONE, 'no singular line for two entries');
});

// ------------------------------------------------------------------------------------------ M8-U9

test('M8-U9 each entry shows signals, past judgement, outcome and calibration note in order, with their labels', DOM, async ({ root }) => {
  const H = await honesty();
  const { log } = await loadContent({ from: 'fixtures' });
  const page = await renderLogWith(root);
  const r = page.root;
  const problems = [];
  const at = (text) => {
    const nodes = textNodesContaining(r, text);
    if (nodes.length !== 1) problems.push(`${JSON.stringify(text.slice(0, 50))} appears in ${nodes.length} text nodes, expected 1`);
    return nodes[0];
  };
  const expectChain = (node, want, what) => {
    if (!node) return;
    const got = labelChain(node);
    if (JSON.stringify(got) !== JSON.stringify(want)) problems.push(`${what}: labels from the text outwards are ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
  };
  const entryIds = entryElements(r).map((el) => el.getAttribute('data-entry'));
  if (JSON.stringify([...entryIds].sort()) !== JSON.stringify(log.map((e) => e.id).sort())) problems.push(`data-entry values ${JSON.stringify(entryIds)} do not match the log's entries`);
  for (const el of entryElements(r)) {
    if (!el.hasAttribute('data-content') || labelOf(el) !== 'replay') problems.push(`entry ${el.getAttribute('data-entry')}: expected data-content and data-label="replay", got ${JSON.stringify(labelOf(el))}`);
  }
  for (const e of log) {
    const signals = e.originalSignals.map((s) => ({ title: at(s.title), summary: at(s.summary.text) }));
    const judgement = at(e.pastJudgement.rationale);
    const outcome = at(e.outcome.summary.text);
    const note = at(e.calibrationNote.text);
    signals.forEach((s, k) => {
      expectChain(s.title, ['real', 'replay'], `${e.id} signal ${k + 1} title`);
      expectChain(s.summary, ['ai-generated', 'real', 'replay'], `${e.id} signal ${k + 1} summary`);
    });
    expectChain(judgement, ['replay', 'replay'], `${e.id} past judgement`);
    expectChain(outcome, ['ai-generated', 'real', 'replay'], `${e.id} outcome summary`);
    expectChain(note, ['ai-generated', 'replay'], `${e.id} calibration note`);
    const sequence = [...signals.map((s) => s.title), judgement, outcome, note];
    if (sequence.every(Boolean)) {
      for (let k = 1; k < sequence.length; k += 1) {
        if (!precedes(sequence[k - 1], sequence[k])) problems.push(`${e.id}: parts are not in the order signals, past judgement, outcome, calibration note`);
      }
    }
    if (judgement) {
      const line = textOf(judgement.parentElement.closest('[data-label="replay"]'));
      for (const want of [H.formatDate(e.pastJudgement.asOfDate), 'Tracewell', H.formatDate(e.pastJudgement.authoredOn)]) {
        if (!line.includes(want)) problems.push(`${e.id}: the past judgement does not show ${want}`);
      }
      if (!/fictional/i.test(line)) problems.push(`${e.id}: the past judgement does not state that the team is fictional`);
      const names = { 'rival-reader': 'Rival Reader', interrogator: 'Interrogator' };
      for (const a of e.pastJudgement.authoredBy) if (!line.includes(names[a])) problems.push(`${e.id}: the past judgement does not name ${names[a]}`);
    }
  }
  assert.none(problems, 'entry structure or label problems');
});

// ------------------------------------------------------------------------------------------ M8-U10

test('M8-U10 F4-S0 and F4-E1: an empty log and an invalid log show the statement and their notice, and no entry', DOM, async ({ root }) => {
  const empty = await renderLogWith(root, await fixtureModule('invalid/log-empty.js'));
  assert.ok(replayStatement(empty.root), 'F4-S0 shows the replay statement');
  assert.includes(textOf(empty.root), EMPTY, 'F4-S0 notice');
  assert.equal(entryElements(empty.root).length, 0, 'entries in F4-S0');
  empty.frame.remove();
  const notArray = await fixtureModule('invalid/log-not-array.js');
  const bad = await renderLogWith(root, notArray);
  assert.ok(replayStatement(bad.root), 'F4-E1 shows the replay statement');
  assert.includes(textOf(bad.root), INVALID, 'F4-E1 notice');
  assert.equal(entryElements(bad.root).length, 0, 'entries in F4-E1');
  assert.notIncludes(bad.html(), notArray.entries[0].pastJudgement.rationale.split(':')[0], 'F4-E1 shows nothing of the module');
  assert.notIncludes(textOf(bad.root), EMPTY, 'F4-E1 is not reported as an empty log');
});
