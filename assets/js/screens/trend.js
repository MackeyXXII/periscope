// M6 Judgement and scenario capture: the trend card, F1 (docs/02-system-requirements.md, F1;
// docs/03-architecture.md, sections 6.3 and 7; docs/04-module-design.md, M6).
//
// Intuition before AI (invariant 2). While the trend awaits the viewer's gut reading (F1-S1) this
// screen holds the Trend record, its signals and the trend's lens order, and nothing else: no
// reading, evidence, disconfirming condition or interrogation question exists in the DOM or in
// memory, because the reveal bundle has not been requested. loadReveal is called in exactly one
// place below, and only for a trend whose stage is past 'awaiting-intuition', that is, after
// recordIntuition has written and frozen the record. markReadingsRevealed is stamped after the
// bundle has loaded and passed its check, before any reading element is created.
//
// No ranking (invariant 1). The three readings, the gut-reading options and the judgement options
// all follow the trend's one random lens order (Q-2), and the three reading elements are built by
// one function from one template, so the position is the only thing that differs, and the note
// says it means nothing.
//
// A judgement requires a rationale (invariant 3). "Commit judgement" is disabled until
// canCommit(draft) holds, a line says what is missing (whatIsMissing), and the click handler checks
// canCommit again before calling commitJudgement, which refuses on its own as well (B4). There is
// no <form>, so no keyboard submit and no form submission can bypass the handlers, and nothing the
// viewer types can reach the URL.
//
// Labels (C-5): the fictional-premise line under the trend heading is fictional (L2 F1, B-1); it
// is shown at every stage, states no reading and needs no reveal bundle. Trend, intuition prompt, readings and questions are ai-generated; signals are real;
// every field the viewer types into and every echo of it is yours. Headings, buttons, captions,
// notes and notices are interface copy and carry no label.

import { checkTrend } from '../contracts/validate.js';
import { ID_PATTERNS } from '../contracts/vocabulary.js';
import { renderLabel, renderPremise } from '../honesty/labels.js';
import { renderSource } from '../honesty/sources.js';
import {
  lensOrderFor,
  recordsOf,
  stageOf,
  canRecord,
  recordIntuition,
  markReadingsRevealed,
  canCommit,
  whatIsMissing,
  commitJudgement,
} from '../state/session.js';
import { orderReadings } from '../state/lens-order.js';

const TEXT = Object.freeze({
  loadFailed: 'Trend cards could not be loaded in this build.',
  notFound: 'This trend card does not exist in this build.',
  withheld: 'This trend card was withheld because its content failed validation.',
  toIndex: 'Open the trend index',
  signalsHeading: 'Signals behind this trend',
  gutHeading: 'Your gut reading',
  gutLegend: 'Your gut reading of this trend',
  reasonCaption: 'Your reason, in one line (optional)',
  record: 'Record my gut reading',
  readingsHeading: 'The three readings',
  placeholder: 'The three readings appear once you have recorded your gut reading.',
  orderNote: 'The three readings are peers. Their order is random and means nothing.',
  evidence: 'Evidence',
  counterEvidence: 'Counter-evidence',
  disconfirming: 'What would disconfirm this reading',
  readingsWithheld:
    'The readings for this trend were withheld because their content failed validation. Your gut reading is kept for this session.',
  interrogationHeading: 'Questions before you judge',
  groups: Object.freeze({
    provenanceChecks: 'Provenance checks',
    assumptionProbes: 'Assumption probes',
    preMortem: 'Pre-mortem',
  }),
  answerCaption: 'Your answer (optional)',
  skip: 'Skip the questions',
  judgementHeading: 'Your judgement',
  judgementLegend: 'The reading you commit to',
  rationaleCaption: 'Your rationale',
  commit: 'Commit judgement',
  committedHeading: 'Your committed judgement',
  beforeHeading: 'Before the readings',
  afterHeading: 'After the readings',
  answersHeading: 'Your answers to the questions',
  echoGutCall: 'Gut reading',
  echoReason: 'Reason',
  echoCommittedLens: 'Committed reading',
  echoRationale: 'Rationale',
  notSaved:
    'This judgement is held only in this browser tab. It is not saved or sent anywhere, it will be gone on reload, and it does not appear in the decision log, which is a replay.',
  toScenario: 'Take this trend into your conversations',
});

/** How each lens is named on screen. The order of this table is never used: lists follow the lens order. */
const LENS_NAME = Object.freeze({ opportunity: 'Opportunity', threat: 'Threat', noise: 'Noise' });

const QUESTION_GROUPS = Object.freeze(['provenanceChecks', 'assumptionProbes', 'preMortem']);

const REASON_MAX_LENGTH = 200;

// ------------------------------------------------------------------------------------------ DOM helpers

function el(doc, tag, className, text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Marks `node` as a content element with its label and appends the visible badge to `badgeHost` (default: node). */
function labelled(node, label, badgeHost = node) {
  node.setAttribute('data-content', '');
  node.setAttribute('data-label', label);
  badgeHost.appendChild(renderLabel(label));
  return node;
}

function notice(doc, text) {
  return el(doc, 'p', 'notice', text);
}

function linkParagraph(doc, href, text) {
  const p = el(doc, 'p');
  const a = el(doc, 'a', '', text);
  a.setAttribute('href', href);
  p.appendChild(a);
  return p;
}

/** Signals on a trend card follow the F2 rule (C-4): publication date, newest first; ties by identifier. */
function bySignalDate(a, b) {
  const da = a.provenance.publishedOn;
  const db = b.provenance.publishedOn;
  if (da !== db) return da < db ? 1 : -1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Evidence items within a reading (C-4): source publication date, oldest first; ties keep the fixture order. */
function byClaimDate(a, b) {
  const da = a.source.publishedOn;
  const db = b.source.publishedOn;
  return da < db ? -1 : da > db ? 1 : 0;
}

// ------------------------------------------------------------------------------------------ the trend record

/**
 * Loads the trend list and the signals and runs the F1 precondition-2 checks on the trend.
 * Resolves to { state: 'ok', trend, signals } or { state: 'load-failed' | 'not-found' | 'withheld' }.
 */
async function resolveTrend(ctx, trendId) {
  const [trends, signals] = await Promise.all([ctx.loader.loadTrends(), ctx.loader.loadSignals()]);
  if (!trends || trends.ok !== true || !signals || signals.ok !== true) return { state: 'load-failed' };
  if (typeof trendId !== 'string' || !ID_PATTERNS.trendId.test(trendId)) return { state: 'not-found' };
  const trend = trends.value.find((t) => t !== null && typeof t === 'object' && t.id === trendId);
  if (!trend) return { state: 'not-found' };
  const verdict = checkTrend(trend, signals.value);
  if (!verdict || verdict.ok !== true) return { state: 'withheld' };
  const own = trend.signalIds.map((id) => signals.value.find((s) => s.id === id));
  return { state: 'ok', trend, signals: own.sort(bySignalDate) };
}

function renderUnavailable(root, ctx, state) {
  const doc = root.ownerDocument;
  const text = state === 'load-failed' ? TEXT.loadFailed : state === 'withheld' ? TEXT.withheld : TEXT.notFound;
  root.appendChild(notice(doc, text));
  if (state !== 'load-failed') root.appendChild(linkParagraph(doc, ctx.routes.trends(), TEXT.toIndex));
}

// ------------------------------------------------------------------------------------------ parts shown at every stage

function trendHead(doc, trend) {
  const head = el(doc, 'header', 'trend-head');
  const h1 = el(doc, 'h1', '', trend.title);
  head.append(h1, el(doc, 'p', 'trend-summary', trend.summary));
  return labelled(head, trend.label, h1);
}

function signalsSection(doc, signals) {
  const section = el(doc, 'section', 'trend-signals');
  section.appendChild(el(doc, 'h2', '', TEXT.signalsHeading));
  const list = el(doc, 'ul', 'card-list');
  for (const s of signals) {
    const item = el(doc, 'li', 'card signal-ref');
    const source = renderSource({
      url: s.provenance.sourceUrl,
      publisher: s.provenance.publisher,
      publishedOn: s.provenance.publishedOn,
      title: s.title,
    });
    const link = source.querySelector('a');
    if (link) link.setAttribute('lang', s.sourceLanguage);
    item.appendChild(source);
    list.appendChild(labelled(item, s.label));
  }
  section.appendChild(list);
  return section;
}

/** One caption and one echo of the viewer's entry, as a <dt>/<dd> pair; the <dd> carries yours. */
function echoPair(doc, caption, kind, text) {
  const dt = el(doc, 'dt', '', caption);
  const dd = el(doc, 'dd', 'echo', text);
  dd.setAttribute('data-echo', kind);
  labelled(dd, 'yours');
  return [dt, dd];
}

function gutEchoList(doc, intuition) {
  const dl = el(doc, 'dl', 'echo-list');
  dl.append(...echoPair(doc, TEXT.echoGutCall, 'gut-call', LENS_NAME[intuition.gutCall]));
  if (intuition.reason !== null) dl.append(...echoPair(doc, TEXT.echoReason, 'reason', intuition.reason));
  return dl;
}

function readingsShell(doc) {
  const section = el(doc, 'section', 'trend-readings');
  const heading = el(doc, 'h2', '', TEXT.readingsHeading);
  heading.setAttribute('tabindex', '-1');
  const area = el(doc, 'div', 'readings-area');
  area.setAttribute('data-area', 'readings');
  section.append(heading, area);
  return { section, heading, area };
}

// ------------------------------------------------------------------------------------------ F1-S1

function lensControl(doc, control, name, lensOrder, legendText) {
  const fieldset = el(doc, 'fieldset', 'lens-control');
  fieldset.setAttribute('data-control', control);
  const legend = el(doc, 'legend', '', legendText);
  fieldset.appendChild(legend);
  const options = el(doc, 'div', 'lens-options');
  const radios = [];
  for (const lens of lensOrder) {
    const label = el(doc, 'label', 'lens-option');
    const radio = doc.createElement('input');
    radio.type = 'radio';
    radio.name = name;
    radio.value = lens;
    radio.setAttribute('autocomplete', 'off');
    label.append(radio, doc.createTextNode(LENS_NAME[lens]));
    options.appendChild(label);
    radios.push(radio);
  }
  fieldset.appendChild(options);
  labelled(fieldset, 'yours', legend);
  return { fieldset, radios };
}

/** A captioned text field the viewer types into, with its yours badge beside it in the same wrapper. */
function textField(doc, { id, caption, field, multiline, maxLength, questionId }) {
  const wrapper = el(doc, 'div', 'field');
  const head = el(doc, 'div', 'field-head');
  const label = el(doc, 'label', '', caption);
  label.setAttribute('for', id);
  head.append(label, renderLabel('yours'));
  const input = doc.createElement(multiline ? 'textarea' : 'input');
  if (!multiline) input.type = 'text';
  if (multiline) input.rows = 3;
  if (maxLength) input.maxLength = maxLength;
  input.id = id;
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('spellcheck', 'true');
  input.setAttribute('data-field', field);
  if (questionId) input.setAttribute('data-question-id', questionId);
  input.setAttribute('data-content', '');
  input.setAttribute('data-label', 'yours');
  wrapper.append(head, input);
  return { wrapper, input };
}

function chosen(radios) {
  const r = radios.find((x) => x.checked);
  return r ? r.value : null;
}

// ------------------------------------------------------------------------------------------ F1-S2

/** One reading element. The same function builds all three, so they share one template. */
function readingElement(doc, reading) {
  const item = el(doc, 'li', 'peer reading');
  item.setAttribute('data-reading', reading.lens);
  const lensHeading = el(doc, 'h3', 'reading-lens', LENS_NAME[reading.lens]);
  item.append(lensHeading, el(doc, 'p', 'reading-text', reading.text));
  for (const [caption, claims] of [[TEXT.evidence, reading.evidence], [TEXT.counterEvidence, reading.counterEvidence]]) {
    item.appendChild(el(doc, 'h4', 'reading-part', caption));
    const list = el(doc, 'ul', 'claims');
    for (const c of claims.slice().sort(byClaimDate)) {
      const li = el(doc, 'li', 'claim');
      li.append(el(doc, 'span', 'claim-text', c.claim), doc.createTextNode(' '), renderSource(c.source));
      list.appendChild(li);
    }
    item.appendChild(list);
  }
  item.append(el(doc, 'h4', 'reading-part', TEXT.disconfirming), el(doc, 'p', 'reading-disconfirm', reading.disconfirmingCondition));
  return labelled(item, reading.label, lensHeading);
}

function fillReadingsArea(doc, area, readings) {
  area.replaceChildren(el(doc, 'p', 'note', TEXT.orderNote));
  const list = el(doc, 'ul', 'peer-group');
  for (const r of readings) list.appendChild(readingElement(doc, r));
  area.appendChild(list);
}

function interrogationSection(doc, interrogation, label) {
  const section = el(doc, 'section', 'trend-interrogation');
  section.appendChild(el(doc, 'h2', '', TEXT.interrogationHeading));
  const area = el(doc, 'div', 'interrogation-area');
  area.setAttribute('data-area', 'interrogation');
  const answers = [];
  for (const group of QUESTION_GROUPS) {
    area.appendChild(el(doc, 'h3', 'question-group', TEXT.groups[group]));
    for (const q of interrogation[group]) {
      const item = el(doc, 'div', 'question-item');
      const question = el(doc, 'p', 'question', q.text);
      question.setAttribute('data-question', q.id);
      labelled(question, label);
      const { wrapper, input } = textField(doc, {
        id: `answer-${q.id}`,
        caption: TEXT.answerCaption,
        field: 'answer',
        multiline: true,
        questionId: q.id,
      });
      item.append(question, wrapper);
      area.appendChild(item);
      answers.push(input);
    }
  }
  const skipRow = el(doc, 'p', 'skip-row');
  const skip = el(doc, 'button', 'link-button', TEXT.skip);
  skip.type = 'button';
  skipRow.appendChild(skip);
  area.appendChild(skipRow);
  section.appendChild(area);
  return { section, answers, skip };
}

function judgementSection(doc, trendId, lensOrder) {
  const section = el(doc, 'section', 'trend-judgement');
  section.appendChild(el(doc, 'h2', '', TEXT.judgementHeading));
  const area = el(doc, 'div', 'judgement-area');
  area.setAttribute('data-area', 'judgement');
  const { fieldset, radios } = lensControl(doc, 'judgement', `judgement-${trendId}`, lensOrder, TEXT.judgementLegend);
  const { wrapper, input: rationale } = textField(doc, {
    id: `rationale-${trendId}`,
    caption: TEXT.rationaleCaption,
    field: 'rationale',
    multiline: true,
  });
  const hint = el(doc, 'p', 'hint');
  hint.setAttribute('data-hint', 'commit');
  hint.setAttribute('aria-live', 'polite');
  const actions = el(doc, 'div', 'actions');
  const button = el(doc, 'button', '', TEXT.commit);
  button.type = 'button';
  actions.appendChild(button);
  area.append(fieldset, wrapper, hint, actions);
  section.appendChild(area);
  return { section, radios, rationale, hint, button };
}

// ------------------------------------------------------------------------------------------ F1-S4

function committedSection(doc, ctx, trendId, judgement, questionText) {
  const section = el(doc, 'section', 'trend-committed');
  const heading = el(doc, 'h2', '', TEXT.committedHeading);
  heading.setAttribute('tabindex', '-1');
  section.appendChild(heading);

  const pair = el(doc, 'div', 'side-by-side');
  const before = el(doc, 'div', 'card');
  before.append(el(doc, 'h3', '', TEXT.beforeHeading), gutEchoList(doc, judgement.intuition));
  const after = el(doc, 'div', 'card');
  const afterList = el(doc, 'dl', 'echo-list');
  afterList.append(
    ...echoPair(doc, TEXT.echoCommittedLens, 'committed-lens', LENS_NAME[judgement.committedLens]),
    ...echoPair(doc, TEXT.echoRationale, 'rationale', judgement.rationale),
  );
  after.append(el(doc, 'h3', '', TEXT.afterHeading), afterList);
  pair.append(before, after);
  section.appendChild(pair);

  if (judgement.promptAnswers.length > 0) {
    section.appendChild(el(doc, 'h3', '', TEXT.answersHeading));
    const dl = el(doc, 'dl', 'echo-list answers-list');
    for (const a of judgement.promptAnswers) {
      const q = questionText.get(a.questionId);
      if (q) {
        const dt = el(doc, 'dt', 'question', q.text);
        dl.appendChild(labelled(dt, q.label));
      }
      const dd = el(doc, 'dd', 'echo', a.answer);
      dd.setAttribute('data-echo', 'answer');
      dl.appendChild(labelled(dd, 'yours'));
    }
    section.appendChild(dl);
  }

  section.appendChild(el(doc, 'p', 'note', TEXT.notSaved));
  section.appendChild(linkParagraph(doc, ctx.routes.scenario(trendId), TEXT.toScenario));
  return { section, heading };
}

// ------------------------------------------------------------------------------------------ the screen

/**
 * renderTrend(root, ctx, trendId): F1-S1 to F1-S4, F1-E0 to F1-E3. Resolves when the screen has
 * rendered, including, for a trend whose gut reading is already recorded, its readings.
 */
export async function renderTrend(root, ctx, trendId) {
  const doc = root.ownerDocument;
  const resolved = await resolveTrend(ctx, trendId);
  if (resolved.state !== 'ok') {
    renderUnavailable(root, ctx, resolved.state);
    return;
  }
  const { trend, signals } = resolved;
  const { session } = ctx;
  const id = trend.id;
  const rootWasConnected = root.isConnected;
  // The interrogation questions, kept only once the bundle has loaded, to caption the answers in F1-S4.
  let questionText = new Map();

  async function paint() {
    const lensOrder = lensOrderFor(session, id);
    const records = recordsOf(session, id);
    root.replaceChildren(trendHead(doc, trend), renderPremise(doc), signalsSection(doc, signals));

    if (records.stage === 'awaiting-intuition') {
      paintAwaiting(lensOrder);
      return null;
    }
    if (records.stage === 'committed') {
      if (questionText.size === 0 && records.judgement.promptAnswers.length > 0) {
        const reveal = await ctx.loader.loadReveal(id);
        if (reveal && reveal.ok === true) questionText = questionsOf(reveal.value.interrogation);
        if (rootWasConnected && !root.isConnected) return null;
      }
      const { section, heading } = committedSection(doc, ctx, id, records.judgement, questionText);
      root.replaceChildren(trendHead(doc, trend), renderPremise(doc), signalsSection(doc, signals), section);
      return heading;
    }

    // 'intuition-recorded': the gut reading is locked; only now may the readings be loaded.
    const gut = el(doc, 'section', 'trend-gut');
    gut.append(el(doc, 'h2', '', TEXT.gutHeading), gutEchoList(doc, records.intuition));
    const readings = readingsShell(doc);
    readings.area.appendChild(el(doc, 'p', 'note', TEXT.placeholder));
    root.append(gut, readings.section);

    const reveal = await ctx.loader.loadReveal(id);
    // If the viewer has moved to another screen meanwhile, nothing is shown and nothing is
    // stamped: the readings are revealed when the trend card is next open.
    if (!root.contains(readings.area) || (rootWasConnected && !root.isConnected)) return null;
    if (!reveal || reveal.ok !== true) {
      readings.area.replaceChildren(notice(doc, TEXT.readingsWithheld));
      return readings.heading;
    }
    if (recordsOf(session, id).readingsRevealedAt === null) markReadingsRevealed(session, id, ctx.now());
    const bundle = reveal.value;
    questionText = questionsOf(bundle.interrogation);
    fillReadingsArea(doc, readings.area, orderReadings(bundle.readings, lensOrder));
    const interrogation = interrogationSection(doc, bundle.interrogation, bundle.interrogation.label);
    const judgement = judgementSection(doc, id, lensOrder);
    root.append(interrogation.section, judgement.section);
    wireJudgement(interrogation, judgement);
    return readings.heading;
  }

  function questionsOf(interrogation) {
    const map = new Map();
    for (const group of QUESTION_GROUPS) for (const q of interrogation[group]) map.set(q.id, { text: q.text, label: interrogation.label });
    return map;
  }

  function paintAwaiting(lensOrder) {
    const section = el(doc, 'section', 'trend-gut');
    section.appendChild(el(doc, 'h2', '', TEXT.gutHeading));
    const prompt = el(doc, 'p', 'intuition-prompt', trend.intuitionPrompt);
    section.appendChild(labelled(prompt, trend.label));
    const { fieldset, radios } = lensControl(doc, 'gut-call', `gut-call-${id}`, lensOrder, TEXT.gutLegend);
    const { wrapper, input: reason } = textField(doc, {
      id: `reason-${id}`,
      caption: TEXT.reasonCaption,
      field: 'reason',
      multiline: false,
      maxLength: REASON_MAX_LENGTH,
    });
    const actions = el(doc, 'div', 'actions');
    const button = el(doc, 'button', '', TEXT.record);
    button.type = 'button';
    button.disabled = true;
    actions.appendChild(button);
    section.append(fieldset, wrapper, actions);

    const readings = readingsShell(doc);
    readings.area.appendChild(el(doc, 'p', 'note', TEXT.placeholder));
    root.append(section, readings.section);

    const draft = () => ({ gutCall: chosen(radios), reason: reason.value });
    const update = () => {
      button.disabled = !canRecord(draft());
    };
    for (const r of radios) r.addEventListener('change', update);
    reason.addEventListener('input', update);
    button.addEventListener('click', async () => {
      const d = draft();
      // The disabled control is not the only guard: the draft is checked again here, and
      // recordIntuition refuses on its own (B4).
      if (!canRecord(d) || stageOf(session, id) !== 'awaiting-intuition') {
        update();
        return;
      }
      recordIntuition(session, id, d, ctx.now());
      const focusTarget = await paint();
      if (focusTarget && focusTarget.isConnected) focusTarget.focus();
    });
  }

  function wireJudgement(interrogation, judgement) {
    const { radios, rationale, hint, button } = judgement;
    const draft = () => ({
      committedLens: chosen(radios),
      rationale: rationale.value,
      promptAnswers: interrogation.answers.map((a) => ({ questionId: a.getAttribute('data-question-id'), answer: a.value })),
    });
    const update = () => {
      const d = draft();
      button.disabled = !canCommit(d);
      hint.textContent = whatIsMissing(d);
    };
    for (const r of radios) r.addEventListener('change', update);
    rationale.addEventListener('input', update);
    update();
    // Skipping writes nothing and disables nothing; it moves focus to the first judgement option (Q-1).
    interrogation.skip.addEventListener('click', () => {
      if (radios[0]) radios[0].focus();
    });
    button.addEventListener('click', async () => {
      const d = draft();
      if (!canCommit(d) || stageOf(session, id) !== 'intuition-recorded') {
        update();
        return;
      }
      commitJudgement(session, id, d, ctx.now());
      const focusTarget = await paint();
      if (focusTarget && focusTarget.isConnected) focusTarget.focus();
    });
  }

  await paint();
}
