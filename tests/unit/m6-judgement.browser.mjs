// M6 Judgement and scenario capture, F1, page parts: M6-U1 to M6-U17 as far as they need a DOM.
// The pure parts of M6-U3, U5 to U8 and U13 are in m6-judgement.test.mjs.
// Written from docs/04-module-design.md (M6), docs/02-system-requirements.md (F1) and
// docs/03-architecture.md (sections 6.3, 7, 8) before any M6 module exists (test-first rule).
// Browser runner only (needs: ['dom']). At G2 every test fails with "module under test could not
// be imported" (assets/js/screens/trend.js, state/*, contracts/*, shell/routes.js not implemented).
//
// Screens are rendered with renderTrend(root, ctx, trendId) and renderTrendIndex(root, ctx) into a
// fresh document that links assets/css/main.css (tests/lib/dom.mjs, mount), with the real M1
// loader over the fixtures and spies on every loader function (tests/lib/screens.mjs). The DOM
// hooks the tests rely on are listed at the top of tests/lib/screens.mjs.

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { loadContent, clone } from '../lib/content.mjs';
import { seededRandom, permutations } from '../lib/seeded-random.mjs';
import { wholeWordHits } from '../lib/text-rules.mjs';
import {
  mount, settle, click, type, choose, installStorageSpy, isVisible, isEditable, focusables, findBadge,
  labelOf, textOf, precedes, shape, buttonsByText, linksByText, smallestContaining,
} from '../lib/dom.mjs';
import {
  load, screenContext, fixtureModule, makeClock, lensOptions, optionFor, readingElements, field, fields,
  theButton, theLink, openTrend, recordGut, fillJudgement, commit, walkToCommitted, show, revealStrings, marker,
  RECORD_GUT, COMMIT, SKIP, TO_SCENARIO, READINGS_PLACEHOLDER, ORDER_NOTE,
} from '../lib/screens.mjs';

const ALPHA = 'trend-fixture-alpha';
const BETA = 'trend-fixture-beta';
const DOM = { needs: ['dom'] };
const EVALUATIVE = ['match', 'mismatch', 'correct', 'wrong', 'agree', 'disagree', 'changed your mind'];

async function alphaBundle() {
  return (await loadContent({ from: 'fixtures' })).reveal[ALPHA];
}

/** The markers of every reading and interrogation string of a bundle. */
async function revealMarkers(trendId = ALPHA) {
  const content = await loadContent({ from: 'fixtures' });
  return revealStrings(content.reveal[trendId]).map(marker);
}

function lensesOf(elements, attr) {
  return elements.map((el) => (attr === 'value' ? el.value : el.getAttribute(attr)));
}

// ------------------------------------------------------------------------------------------ M6-U1

test('M6-U1 in F1-S1 no reading or interrogation string is in the page and loadReveal is not called', DOM, async ({ root }) => {
  const T = await load('trend');
  const { ctx, calls, importerCalls } = await screenContext({ random: seededRandom(1) });
  const page = await mount(root);
  await openTrend(page, T, ctx, ALPHA);
  assert.ok(lensOptions(page.root, 'gut-call').length === 3, 'F1-S1 is showing: three gut-reading options');
  const html = page.html();
  const leaked = (await revealMarkers()).filter((m) => html.includes(m));
  assert.none(leaked, 'reading or interrogation strings in the serialised F1-S1 page');
  assert.equal(calls.loadReveal.length, 0, 'loadReveal calls in F1-S1');
  assert.none(importerCalls.filter((p) => /reveal\//.test(p)), 'reveal modules requested in F1-S1');
  assert.includes(textOf(page.root), READINGS_PLACEHOLDER, 'the readings area shows the placeholder sentence');
});

// ------------------------------------------------------------------------------------------ M6-U2

test('M6-U2 after the record, loadReveal is called exactly once for the trend and all three readings appear', DOM, async ({ root }) => {
  const T = await load('trend');
  const { ctx, calls } = await screenContext({ random: seededRandom(2) });
  const page = await mount(root);
  await openTrend(page, T, ctx, ALPHA);
  await recordGut(page, { lens: 'threat' });
  assert.equal(calls.loadReveal.length, 1, 'loadReveal calls after one record');
  assert.equal(calls.loadReveal[0][0], ALPHA, 'loadReveal was called with the trend identifier');
  const bundle = await alphaBundle();
  const text = textOf(page.root);
  const missing = bundle.readings
    .flatMap((r) => [r.text, r.disconfirmingCondition])
    .filter((s) => !text.includes(s));
  assert.none(missing, 'reading texts or disconfirming conditions missing from F1-S2');
});

// ------------------------------------------------------------------------------------------ M6-U3

test('M6-U3 in the page, Commit judgement is disabled and a line says what is missing until lens and rationale are given', DOM, async ({ root }) => {
  const T = await load('trend');
  const { ctx } = await screenContext({ random: seededRandom(3) });
  const page = await mount(root);
  await openTrend(page, T, ctx, ALPHA);
  await recordGut(page, { lens: 'threat' });
  const r = page.root;
  const hint = () => textOf(r.querySelector('[data-hint="commit"]'));
  const button = () => theButton(r, COMMIT);
  // Initially: nothing chosen, nothing written.
  assert.ok(button().disabled, 'Commit judgement is disabled in F1-S2 before anything is entered');
  assert.equal(hint(), 'Choose a reading and write a rationale to commit your judgement.', 'the full hint in F1-S2');
  // "x" with no lens.
  await type(field(r, 'rationale'), 'x');
  assert.ok(button().disabled, 'disabled with rationale "x" and no lens');
  assert.match(hint(), /choose a reading/i, 'with no lens the line names the missing reading');
  assert.ok(!/rationale/i.test(hint()) || /choose a reading and write a rationale/i.test(hint()), 'the line names only what is missing, or the whole sentence');
  // A lens, with whitespace-only rationales.
  await choose(optionFor(r, 'judgement', 'opportunity'));
  for (const blank of ['', ' ', '\n\t ']) {
    await type(field(r, 'rationale'), blank);
    assert.ok(button().disabled, `disabled with a lens and rationale ${JSON.stringify(blank)}`);
    assert.match(hint(), /rationale/i, `with rationale ${JSON.stringify(blank)} the line names the missing rationale`);
    assert.ok(!/choose a reading/i.test(hint()) || /choose a reading and write a rationale/i.test(hint()), 'the line names only what is missing, or the whole sentence');
  }
  await type(field(r, 'rationale'), 'x');
  assert.ok(!button().disabled, 'enabled with a lens and rationale "x" (F1-S3)');
});

// ------------------------------------------------------------------------------------------ M6-U4

test('M6-U4 no lens is pre-selected in either control, and recording needs a chosen lens', DOM, async ({ root }) => {
  const T = await load('trend');
  const { ctx } = await screenContext({ random: seededRandom(4) });
  const page = await mount(root);
  await openTrend(page, T, ctx, ALPHA);
  const gut = lensOptions(page.root, 'gut-call');
  assert.equal(gut.length, 3, 'three gut-reading options');
  assert.none(gut.filter((o) => o.checked).map((o) => o.value), 'pre-selected gut-reading options');
  assert.ok(theButton(page.root, RECORD_GUT).disabled, 'Record my gut reading is disabled with no lens chosen');
  await choose(optionFor(page.root, 'gut-call', 'noise'));
  assert.ok(!theButton(page.root, RECORD_GUT).disabled, 'Record my gut reading is enabled once a lens is chosen');
  await click(theButton(page.root, RECORD_GUT));
  await recordSettled(page);
  const judgement = lensOptions(page.root, 'judgement');
  assert.equal(judgement.length, 3, 'three judgement options in F1-S2');
  assert.none(judgement.filter((o) => o.checked).map((o) => o.value), 'pre-selected judgement options (the gut call included)');
});

async function recordSettled(page) {
  for (let i = 0; i < 50 && readingElements(page.root).length !== 3; i += 1) await settle(1);
}

// ------------------------------------------------------------------------------------------ M6-U5

test('M6-U5 after the record, the gut-reading controls are disabled', DOM, async ({ root }) => {
  const T = await load('trend');
  const { ctx } = await screenContext({ random: seededRandom(5) });
  const page = await mount(root);
  await openTrend(page, T, ctx, ALPHA);
  await recordGut(page, { lens: 'threat', reason: 'zebra-test-reason' });
  const editable = [...lensOptions(page.root, 'gut-call'), ...fields(page.root, 'reason')].filter(isEditable);
  assert.none(editable.map((el) => el.outerHTML.slice(0, 120)), 'gut-reading controls still editable after the record');
  const record = buttonsByText(page.root, RECORD_GUT).filter((b) => !b.disabled);
  assert.none(record.map(() => RECORD_GUT), 'enabled "Record my gut reading" buttons after the record');
});

// ------------------------------------------------------------------------------------------ M6-U6

test('M6-U6 F1-S4 has no enabled commit control and no editable field', DOM, async ({ root }) => {
  const T = await load('trend');
  const { ctx } = await screenContext({ random: seededRandom(6) });
  const page = await mount(root);
  await walkToCommitted(page, T, ctx, ALPHA);
  const enabledCommit = buttonsByText(page.root, COMMIT).filter((b) => !b.disabled);
  assert.none(enabledCommit.map(() => COMMIT), 'enabled commit controls in F1-S4');
  const editable = Array.from(page.root.querySelectorAll('input, textarea, select, [contenteditable="true"]')).filter(isEditable);
  assert.none(editable.map((el) => el.outerHTML.slice(0, 120)), 'editable fields in F1-S4');
});

// ------------------------------------------------------------------------------------------ M6-U7

async function readingOrderPage(root, readings) {
  const T = await load('trend');
  const bundle = clone(await alphaBundle());
  bundle.readings = readings;
  const { ctx } = await screenContext({ random: seededRandom(42), overrides: { [`data/reveal/${ALPHA}.js`]: bundle } });
  const page = await mount(root);
  await openTrend(page, T, ctx, ALPHA);
  const gutOrder = lensesOf(lensOptions(page.root, 'gut-call'), 'value');
  await recordGut(page, { lens: 'threat' });
  return { page, gutOrder };
}

test('M6-U7 in the page, both controls and the readings follow drawLensOrder(seededRandom(42))', DOM, async ({ root }) => {
  const LO = await load('lensOrder');
  const expected = Array.from(LO.drawLensOrder(seededRandom(42)));
  const bundle = await alphaBundle();
  const { page, gutOrder } = await readingOrderPage(root, clone(bundle.readings));
  assert.deepEqual(gutOrder, expected, 'gut-reading options order');
  assert.deepEqual(lensesOf(readingElements(page.root), 'data-reading'), expected, 'readings order');
  assert.deepEqual(lensesOf(lensOptions(page.root, 'judgement'), 'value'), expected, 'judgement options order');
  // Each reading element shows its own reading (the hook and the content agree).
  for (const el of readingElements(page.root)) {
    const reading = bundle.readings.find((r) => r.lens === el.getAttribute('data-reading'));
    assert.includes(textOf(el), reading.text, `the ${reading.lens} reading element holds the ${reading.lens} text`);
  }
  const els = readingElements(page.root);
  assert.equal(new Set(els.map((el) => el.tagName)).size, 1, 'the three reading elements share a tag');
  assert.equal(new Set(els.map((el) => Array.from(el.classList).join(' '))).size, 1, 'the three reading elements share a class list');
  assert.equal(new Set(els.map(shape)).size, 1, 'the three reading elements share their child structure');
  assert.includes(textOf(page.root), ORDER_NOTE, 'the ordering note');
});

test('M6-U7 the six permutations of the bundle readings give byte-identical reading areas', { needs: ['dom'], timeout: 20000 }, async ({ root }) => {
  const bundle = await alphaBundle();
  const areas = [];
  for (const readings of permutations(clone(bundle.readings))) {
    const { page } = await readingOrderPage(root, readings);
    const area = page.root.querySelector('[data-area="readings"]');
    assert.ok(area, 'the readings area ([data-area="readings"]) exists');
    areas.push(area.outerHTML);
    page.frame.remove();
  }
  const distinct = new Set(areas);
  assert.equal(distinct.size, 1, `distinct reading-area markups across the six input permutations (expected 1, got ${distinct.size})`);
});

// ------------------------------------------------------------------------------------------ M6-U8

test('M6-U8 in the page, trend A resumes at its stage in the same order and trend B stays at F1-S1', DOM, async ({ root }) => {
  const T = await load('trend');
  const B = await load('trendIndex');
  const { ctx } = await screenContext({ random: seededRandom(8) });
  const page = await mount(root);
  await openTrend(page, T, ctx, ALPHA);
  const order = lensesOf(lensOptions(page.root, 'gut-call'), 'value');
  await recordGut(page, { lens: 'threat' });
  // A, elsewhere, A: resumes at F1-S2, readings in the same order, gut reading still locked.
  await show(page, B.renderTrendIndex, ctx);
  await openTrend(page, T, ctx, ALPHA);
  await recordSettled(page);
  assert.deepEqual(lensesOf(readingElements(page.root), 'data-reading'), order, 'A resumes at F1-S2 with the readings in the same order');
  assert.none(lensOptions(page.root, 'gut-call').filter(isEditable).map((o) => o.value), 'editable gut-reading options on resume');
  await fillJudgement(page, { lens: 'noise' });
  await commit(page);
  await show(page, B.renderTrendIndex, ctx);
  await openTrend(page, T, ctx, ALPHA);
  assert.equal(linksByText(page.root, TO_SCENARIO).length, 1, 'A resumes at F1-S4');
  // B was never touched: F1-S1, nothing recorded, nothing selected.
  await openTrend(page, T, ctx, BETA);
  assert.equal(lensOptions(page.root, 'gut-call').filter(isEditable).length, 3, 'B shows F1-S1 with three open gut-reading options');
  assert.equal(readingElements(page.root).length, 0, 'B shows no readings');
  assert.includes(textOf(page.root), READINGS_PLACEHOLDER, 'B shows the readings placeholder');
});

// ------------------------------------------------------------------------------------------ M6-U9

test('M6-U9 a walk from F1-S1 to F1-S4 touches no browser storage', DOM, async ({ root }) => {
  const T = await load('trend');
  const { ctx } = await screenContext({ random: seededRandom(9) });
  const page = await mount(root);
  const spy = installStorageSpy([window, page.win]);
  try {
    // Self-check: the stubs are in place, so an access would be recorded.
    void window.localStorage;
    assert.equal(spy.accesses.length, 1, 'the storage stubs record an access');
    spy.reset();
    await walkToCommitted(page, T, ctx, ALPHA);
    assert.none(spy.accesses.slice(), 'storage accesses during F1');
  } finally {
    spy.restore();
  }
});

// ------------------------------------------------------------------------------------------ M6-U10

test('M6-U10 F1-S4 states that the judgement is not kept, links to F5, and evaluates nothing', DOM, async ({ root }) => {
  const T = await load('trend');
  const { ctx } = await screenContext({ random: seededRandom(10) });
  const page = await mount(root);
  await walkToCommitted(page, T, ctx, ALPHA, {
    reason: 'zebra neutral reason text', answer: 'zebra neutral answer text', rationale: 'zebra neutral rationale text',
  });
  const text = textOf(page.root);
  const statement = [
    [/only in this (browser )?tab/i, 'held only in this tab'],
    [/not saved or sent/i, 'not saved or sent'],
    [/gone on reload/i, 'gone on reload'],
    [/does not appear in the decision log/i, 'does not appear in the decision log'],
    [/decision log, which is a replay/i, 'the decision log is a replay'],
  ];
  assert.none(statement.filter(([re]) => !re.test(text)).map(([, what]) => what), 'parts of the not-saved statement missing from F1-S4');
  const link = theLink(page.root, TO_SCENARIO);
  assert.equal(link.getAttribute('href'), ctx.routes.scenario(ALPHA), 'the link goes to routes.scenario(trendId)');
  assert.none(wholeWordHits(text, EVALUATIVE), 'evaluative words in F1-S4');
});

// ------------------------------------------------------------------------------------------ M6-U11

test('M6-U11 F1-E3: a reveal bundle that fails validation is withheld and the gut reading is kept', DOM, async ({ root }) => {
  const T = await load('trend');
  const invalid = await fixtureModule('invalid/reveal-no-counter-evidence.js');
  const { ctx } = await screenContext({ random: seededRandom(11), overrides: { [`data/reveal/${ALPHA}.js`]: invalid } });
  const page = await mount(root);
  await openTrend(page, T, ctx, ALPHA);
  await recordGut(page, { lens: 'threat' });
  const text = textOf(page.root);
  assert.includes(
    text,
    'The readings for this trend were withheld because their content failed validation. Your gut reading is kept for this session.',
    'the F1-E3 notice',
  );
  const html = page.html();
  const leaked = revealStrings(invalid).map(marker).filter((m) => html.includes(m));
  assert.none(leaked, 'reading or interrogation strings rendered in F1-E3');
  assert.equal(readingElements(page.root).length, 0, 'reading elements in F1-E3');
  assert.equal(page.root.querySelectorAll('[data-control="judgement"], [data-field="rationale"]').length, 0, 'judgement controls in F1-E3');
  assert.equal(buttonsByText(page.root, COMMIT).length, 0, 'Commit judgement buttons in F1-E3');
  const kept = optionFor(page.root, 'gut-call', 'threat');
  const echo = page.root.querySelector('[data-echo="gut-call"]');
  assert.ok((kept && kept.checked && !isEditable(kept)) || (echo && /threat/i.test(textOf(echo))), 'the locked gut reading (threat) is shown');
});

// ------------------------------------------------------------------------------------------ M6-U12

test('M6-U12 an unknown trend shows F1-E1; a trend with two reading references is withheld entirely (F1-E2)', DOM, async ({ root }) => {
  const T = await load('trend');
  const page = await mount(root);
  {
    const { ctx } = await screenContext();
    await openTrend(page, T, ctx, 'trend-does-not-exist');
    assert.includes(textOf(page.root), 'This trend card does not exist in this build.', 'F1-E1 notice');
    const back = Array.from(page.root.querySelectorAll('a[href]')).filter((a) => a.getAttribute('href').endsWith('#/trends'));
    assert.ok(back.length >= 1, 'F1-E1 links to the trend index (#/trends)');
  }
  {
    const invalid = await fixtureModule('invalid/trend-two-readings.js');
    const content = await loadContent({ from: 'fixtures' });
    const { ctx, calls } = await screenContext({ overrides: { 'data/trends.js': invalid } });
    await openTrend(page, T, ctx, ALPHA);
    assert.includes(textOf(page.root), 'This trend card was withheld because its content failed validation.', 'F1-E2 notice');
    const alpha = invalid.find((t) => t.id === ALPHA);
    const forbidden = [alpha.title, ...alpha.signalIds.map((id) => content.signals.find((s) => s.id === id).title), marker(alpha.summary), marker(alpha.intuitionPrompt)];
    const html = page.html();
    assert.none(forbidden.filter((s) => html.includes(s)), 'parts of the withheld trend in the page');
    assert.equal(lensOptions(page.root, 'gut-call').length, 0, 'gut-reading options in F1-E2');
    assert.equal(calls.loadReveal.length, 0, 'loadReveal calls for a withheld trend');
  }
});

// ------------------------------------------------------------------------------------------ M6-U14

test('M6-U14 every trend-screen text field has autocomplete="off" and nothing typed enters the URL', DOM, async ({ root }) => {
  const T = await load('trend');
  const { ctx } = await screenContext({ random: seededRandom(14) });
  const page = await mount(root);
  const missing = [];
  const audit = () => {
    for (const el of page.root.querySelectorAll('input, textarea')) {
      if (el.type === 'radio' || el.type === 'checkbox') {
        if (el.getAttribute('autocomplete') !== 'off') missing.push(`${el.tagName.toLowerCase()}[type=${el.type}][value=${el.value}]`);
      } else if (el.getAttribute('autocomplete') !== 'off') {
        missing.push(`${el.tagName.toLowerCase()}[data-field=${el.getAttribute('data-field')}]`);
      }
    }
  };
  await openTrend(page, T, ctx, ALPHA);
  audit();
  await recordGut(page, { lens: 'threat', reason: 'zebra-test-reason' });
  audit();
  await fillJudgement(page, { lens: 'noise', rationale: 'zebra-test-rationale', answer: 'zebra-test-answer' });
  audit();
  assert.none([...new Set(missing)], 'inputs or textareas without autocomplete="off"');
  for (const where of [window.location.href, page.win.location.href]) {
    for (const typed of ['zebra-test-reason', 'zebra-test-answer', 'zebra-test-rationale']) {
      assert.notIncludes(decodeURIComponent(where), typed, 'location.href');
    }
  }
});

// ------------------------------------------------------------------------------------------ M6-U15

test('M6-U15 F1-E0: with loadTrends failing, the index, the trend and the scenario routes say so and load nothing else', DOM, async ({ root }) => {
  const I = await load('trendIndex');
  const T = await load('trend');
  const Sc = await load('scenario');
  const { ctx, calls } = await screenContext({ fail: ['loadTrends'], flow: 'interactive' });
  const page = await mount(root);
  const notice = 'Trend cards could not be loaded in this build.';
  await show(page, I.renderTrendIndex, ctx);
  assert.includes(textOf(page.root), notice, '#/trends');
  await show(page, T.renderTrend, ctx, ALPHA);
  assert.includes(textOf(page.root), notice, '#/trend/trend-fixture-alpha');
  await show(page, Sc.renderScenario, ctx, ALPHA);
  assert.includes(textOf(page.root), notice, '#/scenario/trend-fixture-alpha');
  assert.equal(calls.loadReveal.length, 0, 'loadReveal calls');
  assert.equal(calls.loadConversation.length, 0, 'loadConversation calls');
  assert.ok(calls.loadTrends.length >= 1, 'the screens did ask for the trends (the stub was reached)');
});

// ------------------------------------------------------------------------------------------ M6-U16

function px(value) {
  return Number.parseFloat(value) || 0;
}

function weight(value) {
  if (value === 'normal') return 400;
  if (value === 'bold') return 700;
  return Number.parseFloat(value) || 400;
}

function hasVisibleBorder(style) {
  return ['Top', 'Right', 'Bottom', 'Left'].some((s) => px(style[`border${s}Width`]) > 0 && style[`border${s}Style`] !== 'none' && style[`border${s}Style`] !== 'hidden');
}

/** The element that directly holds a question's text. */
function questionTextElement(question, text) {
  const walker = question.ownerDocument.createTreeWalker(question, 4);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.data.includes(marker(text))) return n.parentElement;
  return question;
}

test('M6-U16 Q-1: every question has its answer field beneath it; skipping is a quiet link after the last question', DOM, async ({ root }) => {
  const T = await load('trend');
  const { ctx } = await screenContext({ random: seededRandom(16) });
  const page = await mount(root);
  await openTrend(page, T, ctx, ALPHA);
  await recordGut(page, { lens: 'threat' });
  const r = page.root;
  const doc = page.doc;
  const area = r.querySelector('[data-area="interrogation"]');
  assert.ok(area, 'the interrogation area ([data-area="interrogation"])');
  const bundle = await alphaBundle();
  const i = bundle.interrogation;
  const questionsData = [...i.provenanceChecks, ...i.assumptionProbes, ...i.preMortem];
  const questions = Array.from(area.querySelectorAll('[data-question]'));
  assert.equal(questions.length, questionsData.length, 'one question element per interrogation question');
  const problems = [];

  // Q, A, Q, A … in document order: each question's own field comes after it and before the next.
  const sequence = Array.from(area.querySelectorAll('[data-question], [data-field="answer"]'));
  const kinds = sequence.map((el) => (el.matches('[data-question]') && !el.matches('[data-field="answer"]') ? 'Q' : 'A')).join('');
  if (kinds !== 'QA'.repeat(questionsData.length)) problems.push(`questions and answer fields in document order are ${kinds}, expected ${'QA'.repeat(questionsData.length)}`);
  const answers = fields(area, 'answer');
  questions.forEach((q, k) => {
    const a = answers[k];
    if (!a) return;
    const qText = questionsData.find((d) => d.id === q.getAttribute('data-question'));
    if (!qText) {
      problems.push(`question element ${q.getAttribute('data-question')} is not a question of the bundle`);
      return;
    }
    const textEl = questionTextElement(q, qText.text);
    if (!isVisible(a)) problems.push(`answer field ${k + 1} is not visible without further action (hidden, or in a closed <details>)`);
    if (a.getBoundingClientRect().top < textEl.getBoundingClientRect().bottom - 1) problems.push(`answer field ${k + 1} is not rendered beneath its question`);
    const caption = Array.from(a.labels || []).map(textOf).join(' ');
    if (!caption.includes('Your answer (optional)')) problems.push(`answer field ${k + 1} is not captioned "Your answer (optional)" (labels: ${JSON.stringify(caption)})`);
    if (!hasVisibleBorder(doc.defaultView.getComputedStyle(a))) problems.push(`answer field ${k + 1} has no visible border`);
  });

  // One skip control, after the last question in document order and on screen.
  const skips = [...buttonsByText(r, SKIP), ...linksByText(r, SKIP)];
  if (skips.length !== 1) problems.push(`expected one "${SKIP}" control, found ${skips.length}`);
  const skip = skips[0];
  const lastQ = questions[questions.length - 1];
  const lastA = answers[answers.length - 1];
  if (skip && lastQ) {
    if (!precedes(lastQ, skip) || (lastA && !precedes(lastA, skip))) problems.push('the skip control does not follow the last question and its field in document order');
    if (lastA && skip.getBoundingClientRect().top < lastA.getBoundingClientRect().bottom - 1) problems.push('the skip control is not rendered below the last answer field');
    const qStyle = doc.defaultView.getComputedStyle(questionTextElement(lastQ, questionsData[questionsData.length - 1].text));
    const s = doc.defaultView.getComputedStyle(skip);
    const bg = s.backgroundColor.replace(/\s/g, '');
    if (!(bg === 'transparent' || bg === 'rgba(0,0,0,0)' || /^rgba\(\d+,\d+,\d+,0\)$/.test(bg))) problems.push(`skip control background-color is ${s.backgroundColor}, expected transparent`);
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
      if (!(px(s[`border${side}Width`]) === 0 || s[`border${side}Style`] === 'none')) problems.push(`skip control has a ${side.toLowerCase()} border (${s[`border${side}Width`]} ${s[`border${side}Style`]})`);
    }
    if (px(s.fontSize) > px(qStyle.fontSize)) problems.push(`skip control font-size ${s.fontSize} exceeds the question text's ${qStyle.fontSize}`);
    if (weight(s.fontWeight) > weight(qStyle.fontWeight)) problems.push(`skip control font-weight ${s.fontWeight} exceeds the question text's ${qStyle.fontWeight}`);
  }

  // The first focusable element of the interrogation area is the first answer field.
  const first = focusables(area)[0];
  if (first !== answers[0]) problems.push(`the first focusable element in the interrogation area is ${first ? first.outerHTML.slice(0, 80) : 'nothing'}, not the first answer field`);

  // Skipping writes nothing, disables nothing, and moves focus to the first judgement option.
  if (skip && answers.length) {
    await type(answers[0], 'zebra-test-answer');
    await click(skip);
    if (answers[0].value !== 'zebra-test-answer') problems.push('skipping changed a draft answer');
    const disabled = fields(r, 'answer').filter((a) => !isEditable(a));
    if (disabled.length) problems.push(`skipping disabled ${disabled.length} answer field(s)`);
    const firstOption = lensOptions(r, 'judgement')[0];
    if (doc.activeElement !== firstOption) problems.push(`after skipping, focus is on ${doc.activeElement ? doc.activeElement.outerHTML.slice(0, 80) : 'nothing'}, not the first judgement option`);
  }
  const hint = textOf(r.querySelector('[data-hint="commit"]'));
  if (!hint) problems.push('no commit hint ([data-hint="commit"]) in F1-S2');
  if (/answer|question/i.test(hint)) problems.push(`the commit hint mentions answers or questions: ${JSON.stringify(hint)}`);
  assert.none(problems, 'Q-1 violations');
});

// ------------------------------------------------------------------------------------------ M6-U17

function yoursProblems(elements, what) {
  const problems = [];
  if (elements.length === 0) problems.push(`${what}: not found`);
  for (const el of elements) {
    if (labelOf(el) !== 'yours') problems.push(`${what}: data-label is ${JSON.stringify(labelOf(el))}, expected "yours"`);
    if (!findBadge(el, 'Yours')) problems.push(`${what}: no visible "Yours" badge`);
  }
  return problems;
}

test('M6-U17 every viewer entry in F1 carries yours; readings and questions carry ai-generated', DOM, async ({ root }) => {
  const T = await load('trend');
  const { ctx } = await screenContext({ random: seededRandom(17) });
  const page = await mount(root);
  const r = page.root;
  const problems = [];
  await openTrend(page, T, ctx, ALPHA);
  problems.push(...yoursProblems(Array.from(r.querySelectorAll('[data-control="gut-call"]')), 'F1-S1 gut-reading control'));
  problems.push(...yoursProblems(fields(r, 'reason'), 'F1-S1 reason field'));
  await recordGut(page, { lens: 'threat', reason: 'zebra-test-reason' });
  problems.push(...yoursProblems(fields(r, 'answer'), 'F1-S2 answer field'));
  problems.push(...yoursProblems(Array.from(r.querySelectorAll('[data-control="judgement"]')), 'F1-S2 judgement control'));
  problems.push(...yoursProblems(fields(r, 'rationale'), 'F1-S2 rationale field'));
  for (const el of [...readingElements(r), ...r.querySelectorAll('[data-question]')]) {
    if (labelOf(el) !== 'ai-generated') problems.push(`reading or question ${el.getAttribute('data-reading') || el.getAttribute('data-question')}: data-label ${JSON.stringify(labelOf(el))}, expected "ai-generated"`);
  }
  await fillJudgement(page, { lens: 'noise', rationale: 'zebra-test-rationale', answer: 'zebra-test-answer' });
  await commit(page);
  for (const kind of ['gut-call', 'reason', 'answer', 'committed-lens', 'rationale']) {
    problems.push(...yoursProblems(Array.from(r.querySelectorAll(`[data-echo="${kind}"]`)), `F1-S4 echo of ${kind}`));
  }
  // The echoes show what was entered.
  for (const [kind, typed] of [['reason', 'zebra-test-reason'], ['answer', 'zebra-test-answer'], ['rationale', 'zebra-test-rationale']]) {
    const echoes = Array.from(r.querySelectorAll(`[data-echo="${kind}"]`));
    if (echoes.length && !echoes.some((e) => textOf(e).includes(typed))) problems.push(`F1-S4 echo of ${kind} does not show ${typed}`);
  }
  // Every element showing the viewer's typed text is labelled yours (nearest label).
  for (const typed of ['zebra-test-reason', 'zebra-test-answer', 'zebra-test-rationale']) {
    for (const el of smallestContaining(r, typed)) {
      const labelled = el.closest('[data-label]');
      if (!labelled || labelled.getAttribute('data-label') !== 'yours') problems.push(`text ${typed} is shown under label ${labelled ? labelled.getAttribute('data-label') : 'none'}`);
    }
  }
  assert.none(problems, 'label problems on viewer entries');
});
