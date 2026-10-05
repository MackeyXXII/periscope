// M6 Judgement and scenario capture, F5, page parts: M6-U18 to M6-U26 as far as they need a DOM.
// The pure parts of M6-U19, U21 and U24 are in m6-scenario.test.mjs.
// Written from docs/04-module-design.md (M6), docs/02-system-requirements.md (F5) and
// docs/03-architecture.md (section 6.4) before any M6 module exists (test-first rule). Browser
// runner only.
//
// In this release F5 ships as the static screen F5-ST (decision of 5 Oct 2026). Only the built,
// page part of M6-U24 runs; at G2 it fails with "module under test could not be imported". Every
// other test here (M6-U18 to M6-U23, M6-U25, M6-U26) belongs to the interactive F5 and is skipped
// with "Deferred (F5 static, decision of 5 Oct 2026)"; it is kept so that F5 can be built later.
//
// A "committed fixture session" is produced the way a viewer produces it: the F1 walk on
// renderTrend, then renderScenario(root, ctx, trendId) with the same ctx. ctx.flow is
// 'interactive' unless the test is about the static fallback. DOM hooks: the table in
// docs/04-module-design.md (summarised in tests/lib/screens.mjs); M6-U22 finds its two regions by
// data-area="what-you-wrote" and data-area="conversation-questions". Hint texts: the
// whatIsMissingScenario row of the M6 interface table.

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { loadContent } from '../lib/content.mjs';
import { seededRandom } from '../lib/seeded-random.mjs';
import { wholeWordHits } from '../lib/text-rules.mjs';
import {
  mount, click, type, installStorageSpy, isEditable, findBadge, labelOf, textOf, precedes, elementsByText,
  smallestContaining, linksByText,
} from '../lib/dom.mjs';
import {
  load, screenContext, fixtureModule, field, fields, theButton, theLink, show, walkToCommitted,
  recordScenarioInPage, RECORD_SCENARIO, TO_SCENARIO,
} from '../lib/screens.mjs';

const ALPHA = 'trend-fixture-alpha';
const DOM = { needs: ['dom'] };
const DEFERRED = { needs: ['deferred', 'dom'] };
const EVALUATIVE = ['match', 'mismatch', 'correct', 'wrong', 'agree', 'disagree', 'changed your mind'];
const F5_S0 =
  'Scenario work on this trend starts from a judgement you have committed in this session. Open the trend card and commit a judgement first.';
const F5_E2 =
  'The conversation questions for this trend were withheld because their content failed validation. What you wrote is kept for this session.';
const QUESTIONS_NOTE =
  'These questions were written offline, before you arrived, and are the same for every visitor. They do not respond to what you wrote.';
const ST_HEADING = 'Scenario work from your own conversations';
const ST_NOTICE =
  'In this build the scenario step is described only: there is nothing to write here, and no conversation questions were prepared for this release.';

async function conversationTexts(trendId = ALPHA) {
  return (await loadContent({ from: 'fixtures' })).conversation[trendId].questions.map((q) => q.text);
}

function markerOf(text) {
  const m = /^(zebra-[a-z0-9-]+)/.exec(text);
  return m ? m[1] : text;
}

/** Mounts a page, walks F1 to F1-S4 on alpha, and opens the scenario route (F5-S1). */
async function committedScenarioPage(root, options = {}) {
  const T = await load('trend');
  const Sc = await load('scenario');
  const setup = await screenContext({ random: seededRandom(18), flow: 'interactive', ...options });
  const page = await mount(root);
  await walkToCommitted(page, T, setup.ctx, ALPHA);
  await show(page, Sc.renderScenario, setup.ctx, ALPHA);
  return { page, T, Sc, ...setup };
}

function notSavedProblems(text) {
  return [
    [/only in this (browser )?tab/i, 'held only in this tab'],
    [/not saved or sent/i, 'not saved or sent'],
    [/gone on reload/i, 'gone on reload'],
  ].filter(([re]) => !re.test(text)).map(([, what]) => what);
}

// ------------------------------------------------------------------------------------------ M6-U18

test('M6-U18 F5-S0: without a committed Judgement the scenario route asks for one and loads no question', DEFERRED, async ({ root }) => {
  const Sc = await load('scenario');
  const { ctx, calls } = await screenContext({ flow: 'interactive' });
  const page = await mount(root);
  await show(page, Sc.renderScenario, ctx, ALPHA);
  assert.includes(textOf(page.root), F5_S0, 'the F5-S0 text');
  const toCard = Array.from(page.root.querySelectorAll('a[href]')).filter((a) => a.getAttribute('href').endsWith(`#/trend/${ALPHA}`));
  assert.ok(toCard.length >= 1, `a link to the trend card (#/trend/${ALPHA})`);
  assert.equal(page.root.querySelectorAll('input, textarea').length, 0, 'inputs or textareas in F5-S0');
  assert.equal(calls.loadConversation.length, 0, 'loadConversation calls in F5-S0');
});

// ------------------------------------------------------------------------------------------ M6-U19

test('M6-U19 in the page, Record my scenario is disabled and a line names the empty field', DEFERRED, async ({ root }) => {
  const { page } = await committedScenarioPage(root);
  const r = page.root;
  const button = () => theButton(r, RECORD_SCENARIO);
  const hint = () => textOf(r.querySelector('[data-hint="scenario"]'));
  // The hint texts of whatIsMissingScenario (M6 interface table).
  const HINTS = {
    both: 'Write what you have heard and how the trend could play out to record your scenario.',
    heard: 'Write what you have heard to record your scenario.',
    playout: 'Write how the trend could play out to record your scenario.',
  };
  const problems = [];
  const expect = (label, wantHeard, wantPlayout) => {
    if (!button().disabled) problems.push(`${label}: "Record my scenario" is enabled`);
    const h = hint();
    const want = wantHeard && wantPlayout ? HINTS.both : wantHeard ? HINTS.heard : HINTS.playout;
    if (!h) problems.push(`${label}: no line ([data-hint="scenario"]) says what is missing`);
    else if (h !== want) problems.push(`${label}: the line reads ${JSON.stringify(h)}, expected ${JSON.stringify(want)}`);
  };
  for (const blank of ['', ' ', '\n\t']) {
    await type(field(r, 'heard'), blank);
    await type(field(r, 'playout'), 'zebra-test-playout');
    expect(`heard ${JSON.stringify(blank)}`, true, false);
    await type(field(r, 'heard'), 'zebra-test-heard');
    await type(field(r, 'playout'), blank);
    expect(`playout ${JSON.stringify(blank)}`, false, true);
    await type(field(r, 'heard'), blank);
    expect(`both ${JSON.stringify(blank)}`, true, true);
  }
  await type(field(r, 'heard'), 'zebra-test-heard');
  await type(field(r, 'playout'), 'zebra-test-playout');
  if (button().disabled) problems.push('both fields hold text, and "Record my scenario" is still disabled');
  assert.none(problems, 'F5-S1 recording-control problems');
});

// ------------------------------------------------------------------------------------------ M6-U20

test('M6-U20 in F5-S1 no conversation question is in the page or loaded; after the record all appear', DEFERRED, async ({ root }) => {
  const { page, calls, importerCalls } = await committedScenarioPage(root);
  const questions = await conversationTexts();
  assert.ok(field(page.root, 'heard') && field(page.root, 'playout'), 'F5-S1 is showing: both fields');
  const html = page.html();
  assert.none(questions.map(markerOf).filter((m) => html.includes(m)), 'conversation questions in the serialised F5-S1 page');
  assert.equal(calls.loadConversation.length, 0, 'loadConversation calls in F5-S1');
  assert.none(importerCalls.filter((p) => /conversation\//.test(p)), 'conversation modules requested in F5-S1');
  await recordScenarioInPage(page);
  assert.equal(calls.loadConversation.length, 1, 'loadConversation calls after one record');
  assert.equal(calls.loadConversation[0][0], ALPHA, 'loadConversation was called with the trend identifier');
  const text = textOf(page.root);
  assert.none(questions.filter((q) => !text.includes(q)), 'conversation questions missing from F5-S2');
});

// ------------------------------------------------------------------------------------------ M6-U21

test('M6-U21 in F5-S2 both recorded fields are read-only and every note field stays editable', DEFERRED, async ({ root }) => {
  const { page } = await committedScenarioPage(root);
  await recordScenarioInPage(page);
  const r = page.root;
  const editableRecorded = [...fields(r, 'heard'), ...fields(r, 'playout')].filter(isEditable);
  assert.none(editableRecorded.map((el) => el.getAttribute('data-field')), 'recorded fields still editable in F5-S2');
  const text = textOf(r);
  assert.includes(text, 'zebra-test-heard', 'the recorded "heard" text is shown');
  assert.includes(text, 'zebra-test-playout', 'the recorded "play out" text is shown');
  const notes = fields(r, 'note');
  assert.equal(notes.length, (await conversationTexts()).length, 'one note field per question');
  assert.none(notes.filter((n) => !isEditable(n)).map((n) => n.outerHTML.slice(0, 80)), 'note fields not editable');
  await type(notes[0], 'zebra-test-note');
  await type(notes[0], 'zebra-test-note-changed');
  assert.ok(isEditable(notes[0]) && notes[0].value === 'zebra-test-note-changed', 'a note can be changed after it was written');
});

// ------------------------------------------------------------------------------------------ M6-U22

function headingByText(root, text) {
  const found = elementsByText(root, text, 'h1, h2, h3, h4, h5, h6');
  return found.length === 1 ? found[0] : null;
}

/** The one region with data-area="<name>" (DOM hooks table), or null. */
function area(root, name) {
  const found = root.querySelectorAll(`[data-area="${name}"]`);
  return found.length === 1 ? found[0] : null;
}

test('M6-U22 F5-S2: "What you wrote" precedes the questions; labels, captions and statements are in place', DEFERRED, async ({ root }) => {
  const { page } = await committedScenarioPage(root);
  await recordScenarioInPage(page);
  const { LABEL_DISPLAY } = await load('vocabulary');
  const r = page.root;
  const problems = [];
  const h1 = headingByText(r, 'What you wrote');
  const h2 = headingByText(r, 'Questions to take into your next conversations');
  const wrote = area(r, 'what-you-wrote');
  const asked = area(r, 'conversation-questions');
  if (!h1) problems.push('no single heading "What you wrote"');
  if (!h2) problems.push('no single heading "Questions to take into your next conversations"');
  if (!wrote) problems.push('no single region data-area="what-you-wrote"');
  if (!asked) problems.push('no single region data-area="conversation-questions"');
  if (h1 && wrote && !wrote.contains(h1)) problems.push('the heading "What you wrote" is not inside data-area="what-you-wrote"');
  if (h2 && asked && !asked.contains(h2)) problems.push('the questions heading is not inside data-area="conversation-questions"');
  if (h1 && h2 && wrote && asked) {
    if (wrote.contains(asked) || asked.contains(wrote)) problems.push('the two regions are nested');
    if (!precedes(wrote, asked)) problems.push('"What you wrote" does not precede the questions region');
    // The first region echoes the committed judgement and both fields, each labelled yours.
    for (const typed of ['zebra-test-rationale', 'zebra-test-heard', 'zebra-test-playout']) {
      const holders = smallestContaining(wrote, typed);
      if (holders.length === 0) problems.push(`"What you wrote" does not show ${typed}`);
      for (const el of holders) {
        const labelled = el.closest('[data-label]');
        if (!labelled || labelled.getAttribute('data-label') !== 'yours') problems.push(`${typed} is shown under label ${labelled ? labelled.getAttribute('data-label') : 'none'}`);
      }
    }
    const lensEcho = wrote.querySelector('[data-echo="committed-lens"]');
    if (!lensEcho || !/noise/i.test(textOf(lensEcho))) problems.push('"What you wrote" does not echo the committed lens (noise)');
    for (const [kind, typed] of [['heard', 'zebra-test-heard'], ['playout', 'zebra-test-playout']]) {
      const echo = wrote.querySelector(`[data-echo="${kind}"]`);
      if (!echo || !textOf(echo).includes(typed)) problems.push(`"What you wrote" has no data-echo="${kind}" showing ${typed}`);
    }
    for (const echo of wrote.querySelectorAll('[data-echo]')) {
      if (labelOf(echo) !== 'yours') problems.push(`echo ${echo.getAttribute('data-echo')} carries ${JSON.stringify(labelOf(echo))}, expected "yours"`);
      if (!findBadge(echo, LABEL_DISPLAY.yours, 'yours')) problems.push(`echo ${echo.getAttribute('data-echo')} has no visible "${LABEL_DISPLAY.yours}" badge`);
    }
    // Questions: ai-generated, byte-identical label markup, each with a note field.
    const questions = Array.from(asked.querySelectorAll('[data-question]'));
    if (questions.length !== (await conversationTexts()).length) problems.push(`${questions.length} question elements in the questions region`);
    const badges = questions.map((q) => {
      if (labelOf(q) !== 'ai-generated') problems.push(`question ${q.getAttribute('data-question')} carries ${JSON.stringify(labelOf(q))}`);
      const b = findBadge(q, LABEL_DISPLAY['ai-generated'], 'ai-generated');
      if (!b) problems.push(`question ${q.getAttribute('data-question')} has no visible "${LABEL_DISPLAY['ai-generated']}" badge`);
      return b ? b.outerHTML : '';
    });
    if (new Set(badges).size > 1) problems.push(`the questions' label markup differs: ${[...new Set(badges)].join(' | ')}`);
    const notes = fields(asked, 'note');
    if (notes.length !== questions.length) problems.push(`${notes.length} note fields for ${questions.length} questions`);
    for (const n of notes) {
      const caption = Array.from(n.labels || []).map(textOf).join(' ');
      if (!caption.includes('Who you would ask (optional)')) problems.push(`a note field is not captioned "Who you would ask (optional)" (${JSON.stringify(caption)})`);
      if (n.getAttribute('autocomplete') !== 'off') problems.push('a note field lacks autocomplete="off"');
      if (labelOf(n) !== 'yours') problems.push(`a note field carries ${JSON.stringify(labelOf(n))}, expected "yours"`);
    }
  }
  const text = textOf(r);
  if (!text.includes(QUESTIONS_NOTE)) problems.push('the statement about the questions is missing');
  problems.push(...notSavedProblems(text).map((w) => `not-saved statement: ${w} missing`));
  const viewerText = /zebra-test-(rationale|heard|playout|reason|answer)/g;
  const hits = wholeWordHits(text.replace(viewerText, ' '), EVALUATIVE);
  if (hits.length) problems.push(`evaluative words outside the viewer's text: ${hits.join(', ')}`);
  assert.none(problems, 'F5-S2 problems');
});

// ------------------------------------------------------------------------------------------ M6-U23

test('M6-U23 F5-E2: questions that fail validation are withheld and the recorded text is kept read-only', DEFERRED, async ({ root }) => {
  const invalid = await fixtureModule('invalid/conversation-no-question-mark.js');
  const { page } = await committedScenarioPage(root, { overrides: { [`data/conversation/${ALPHA}.js`]: invalid } });
  await recordScenarioInPage(page);
  const r = page.root;
  assert.includes(textOf(r), F5_E2, 'the F5-E2 notice');
  const html = page.html();
  assert.none(invalid.questions.map((q) => markerOf(q.text)).filter((m) => html.includes(m)), 'question texts rendered in F5-E2');
  assert.equal(r.querySelectorAll('[data-question]').length, 0, 'question elements in F5-E2');
  assert.none([...fields(r, 'heard'), ...fields(r, 'playout')].filter(isEditable).map((f) => f.getAttribute('data-field')), 'editable recorded fields in F5-E2');
  assert.includes(textOf(r), 'zebra-test-heard', 'the recorded "heard" text is kept');
  assert.includes(textOf(r), 'zebra-test-playout', 'the recorded "play out" text is kept');
});

// ------------------------------------------------------------------------------------------ M6-U24

test('M6-U24 F5-ST, the static screen that ships: heading, three sentences, the notice; no field, no AI or viewer element, no load, no stage change', DOM, async ({ root }) => {
  const T = await load('trend');
  const Sc = await load('scenario');
  const S = await load('session');
  const { SCENARIO_FLOW } = await load('constants');
  assert.equal(SCENARIO_FLOW, 'static', "the build's SCENARIO_FLOW");
  const problems = [];
  for (const committed of [false, true]) {
    const { ctx, importerCalls } = await screenContext({ random: seededRandom(24), flow: SCENARIO_FLOW });
    const page = await mount(root);
    if (committed) await walkToCommitted(page, T, ctx, ALPHA);
    const stageBefore = S.stageOf(ctx.session, ALPHA);
    importerCalls.length = 0;
    await show(page, Sc.renderScenario, ctx, ALPHA);
    const where = committed ? 'after a committed Judgement' : 'in a fresh session';
    const r = page.root;
    const heading = elementsByText(r, ST_HEADING, 'h1, h2, h3, h4, h5, h6');
    if (heading.length !== 1) problems.push(`${where}: ${heading.length} headings "${ST_HEADING}"`);
    const text = textOf(r);
    if (!text.includes(ST_NOTICE)) problems.push(`${where}: the static notice of Level 2 is missing`);
    if (heading.length === 1 && text.includes(ST_NOTICE)) {
      const between = text.slice(text.indexOf(ST_HEADING) + ST_HEADING.length, text.indexOf(ST_NOTICE)).trim();
      const sentences = between.split(/(?<=[.!?])\s+/).filter((s) => /[.!?]$/.test(s.trim()));
      if (sentences.length !== 3) problems.push(`${where}: ${sentences.length} sentences of description between the heading and the notice, expected 3`);
    }
    const forbidden = [
      ['input, textarea, select', 'a form field'],
      ['[contenteditable]', 'a contenteditable element'],
      ['[data-label="ai-generated"]', 'an element labelled ai-generated'],
      ['[data-label="yours"]', 'an element labelled yours'],
      ['[data-area="conversation-questions"]', 'a conversation-questions area'],
      ['[data-question]', 'a data-question element'],
      ['[data-content]', 'a content element (F5-ST is interface copy, M9-U8)'],
    ];
    for (const [selector, what] of forbidden) {
      const n = r.querySelectorAll(selector).length;
      if (n) problems.push(`${where}: ${n} × ${what} (${selector})`);
    }
    const conversationImports = importerCalls.filter((p) => p.includes('conversation/'));
    if (conversationImports.length) problems.push(`${where}: the importer was called with ${conversationImports.join(', ')}`);
    const stageAfter = S.stageOf(ctx.session, ALPHA);
    if (stageAfter !== stageBefore) problems.push(`${where}: the visit changed the stage from ${stageBefore} to ${stageAfter}`);
    page.frame.remove();
  }
  assert.none(problems, 'F5-ST problems');
});

// ------------------------------------------------------------------------------------------ M6-U25

test('M6-U25 F5 touches no storage, puts nothing in the URL, and every F5 text field has autocomplete="off"', DEFERRED, async ({ root }) => {
  const { page } = await committedScenarioPage(root);
  const r = page.root;
  const problems = [];
  const audit = () => {
    for (const el of r.querySelectorAll('input, textarea')) {
      if (el.getAttribute('autocomplete') !== 'off') problems.push(`${el.tagName.toLowerCase()}[data-field=${el.getAttribute('data-field')}] lacks autocomplete="off"`);
    }
  };
  const spy = installStorageSpy([window, page.win]);
  try {
    void window.sessionStorage;
    assert.equal(spy.accesses.length, 1, 'the storage stubs record an access');
    spy.reset();
    audit();
    await recordScenarioInPage(page);
    audit();
    const note = fields(r, 'note')[0];
    if (!note) problems.push('no note field in F5-S2');
    else await type(note, 'zebra-test-note');
    problems.push(...spy.accesses.map((a) => `storage access: ${a}`));
  } finally {
    spy.restore();
  }
  for (const where of [window.location.href, page.win.location.href]) {
    for (const typed of ['zebra-test-heard', 'zebra-test-playout', 'zebra-test-note']) {
      if (decodeURIComponent(where).includes(typed)) problems.push(`location.href contains ${typed}`);
    }
  }
  assert.none([...new Set(problems)], 'F5 storage, URL or autocomplete problems');
});

// ------------------------------------------------------------------------------------------ M6-U26

test('M6-U26 after recording, returning to the scenario route (directly or from F1-S4) resumes F5-S2 unchanged', DEFERRED, async ({ root }) => {
  const { page, T, Sc, ctx } = await committedScenarioPage(root);
  await recordScenarioInPage(page);
  await type(fields(page.root, 'note')[0], 'zebra-test-note');
  const snapshot = () => ({
    heard: textOf(page.root).includes('zebra-test-heard'),
    playout: textOf(page.root).includes('zebra-test-playout'),
    note: (fields(page.root, 'note')[0] || {}).value,
    editable: [...fields(page.root, 'heard'), ...fields(page.root, 'playout')].filter(isEditable).length,
    questions: page.root.querySelectorAll('[data-question]').length,
  });
  const expected = { heard: true, playout: true, note: 'zebra-test-note', editable: 0, questions: (await conversationTexts()).length };
  // Elsewhere, then the scenario route again.
  const B = await load('trendIndex');
  await show(page, B.renderTrendIndex, ctx);
  await show(page, Sc.renderScenario, ctx, ALPHA);
  assert.deepEqual(snapshot(), expected, 'F5-S2 after navigating away and back');
  // Via F1-S4 and its link.
  await show(page, T.renderTrend, ctx, ALPHA);
  assert.equal(theLink(page.root, TO_SCENARIO).getAttribute('href'), ctx.routes.scenario(ALPHA), 'F1-S4 still links to the scenario route');
  await show(page, Sc.renderScenario, ctx, ALPHA);
  assert.deepEqual(snapshot(), expected, 'F5-S2 after following the link on F1-S4 again');
  assert.equal(linksByText(page.root, RECORD_SCENARIO).length + page.root.querySelectorAll('[data-hint="scenario"]').length, 0, 'F5-S1 controls are not shown again');
  void click;
});
