// M6 Judgement and scenario capture: session state for F1 (docs/03-architecture.md, section 7.1;
// docs/04-module-design.md, M6 interface).
//
// One plain in-memory object per page load, created by main.js and handed to the M6 screens in the
// screen context. It is never attached to window, never held in a module-level singleton, never
// written to any browser storage and never sent anywhere (C-1): a reload discards it.
//
// Each trend's progress moves one way only: 'awaiting-intuition' -> 'intuition-recorded' ->
// 'committed'. The gates hold here as well as in the page (Red-team finding B4): recordIntuition
// refuses a draft without a lens, and commitJudgement refuses a draft without a lens and a
// rationale, and any Judgement that fails checkJudgement. Every refused call throws and changes
// nothing. The screens never make such a call, so a throw is a defect, never a normal path.
//
// The interactive F5 (scenario records) is deferred (F5 static, decision of 5 Oct 2026); its stage
// 'scenario-recorded' is never reached in this release.

import { LENSES, ID_PATTERNS } from '../contracts/vocabulary.js';
import { checkJudgement } from '../contracts/validate.js';
import { drawLensOrder } from './lens-order.js';

const AWAITING = 'awaiting-intuition';
const RECORDED = 'intuition-recorded';
const COMMITTED = 'committed';

/** The fixed toISOString() form, as checkJudgement requires (common.schema.json, dateTime). */
const ISO_INSTANT = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/;
/** The intuition reason is one line of at most this many characters (common.schema.json, oneLine). */
const REASON_MAX_LENGTH = 200;

const HINT_BOTH = 'Choose a reading and write a rationale to commit your judgement.';
const HINT_LENS = 'Choose a reading to commit your judgement.';
const HINT_RATIONALE = 'Write a rationale to commit your judgement.';

const isLens = (value) => typeof value === 'string' && LENSES.includes(value);
const hasText = (value) => typeof value === 'string' && /\S/.test(value);

function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) deepFreeze(value[key]);
  }
  return value;
}

function requireTrendId(trendId, fn) {
  if (typeof trendId !== 'string' || !ID_PATTERNS.trendId.test(trendId)) {
    throw new TypeError(`${fn}: ${JSON.stringify(trendId)} is not a trend identifier`);
  }
}

function requireInstant(now, fn) {
  if (typeof now !== 'string' || !ISO_INSTANT.test(now)) {
    throw new TypeError(`${fn}: ${JSON.stringify(now)} is not an ISO timestamp from toISOString()`);
  }
}

function requireSession(session, fn) {
  if (!session || !(session.trends instanceof Map) || typeof session.random !== 'function') {
    throw new TypeError(`${fn}: not a session from createSession()`);
  }
}

/**
 * The reason as it will be recorded: null for an absent, empty or whitespace-only reason;
 * otherwise the text trimmed, with any line break turned into a space (it is one line). Returns
 * undefined for a reason that cannot be recorded (not a string, or longer than one line allows).
 */
function normaliseReason(reason) {
  if (reason === null || reason === undefined) return null;
  if (typeof reason !== 'string') return undefined;
  const line = reason.replace(/[\r\n]+/g, ' ').trim();
  if (line === '') return null;
  return line.length <= REASON_MAX_LENGTH ? line : undefined;
}

/** The progress record of a trend, created on first use. */
function progress(session, trendId) {
  let p = session.trends.get(trendId);
  if (!p) {
    p = { lensOrder: null, intuition: null, readingsRevealedAt: null, judgement: null };
    session.trends.set(trendId, p);
  }
  return p;
}

/**
 * A new session. `random` is the source for the lens orders: Math.random in the page, a seeded
 * or stub source in tests.
 */
export function createSession({ random = Math.random } = {}) {
  if (typeof random !== 'function') throw new TypeError('createSession: random is not a function');
  return Object.freeze({ random, trends: new Map() });
}

/** The trend's lens order: drawn with the session's random source on the first call, the same array afterwards. */
export function lensOrderFor(session, trendId) {
  requireSession(session, 'lensOrderFor');
  requireTrendId(trendId, 'lensOrderFor');
  const p = progress(session, trendId);
  if (p.lensOrder === null) p.lensOrder = drawLensOrder(session.random);
  return p.lensOrder;
}

/** The trend's stage: 'awaiting-intuition', 'intuition-recorded' or 'committed'. */
export function stageOf(session, trendId) {
  requireSession(session, 'stageOf');
  const p = session.trends.get(trendId);
  if (!p || p.intuition === null) return AWAITING;
  return p.judgement === null ? RECORDED : COMMITTED;
}

/**
 * What the session holds for a trend, for the screens to show what was recorded when a trend card
 * is opened again: { stage, intuition, readingsRevealedAt, judgement }, each null until recorded.
 * The records are the frozen objects themselves; the returned object is frozen too.
 */
export function recordsOf(session, trendId) {
  requireSession(session, 'recordsOf');
  const p = session.trends.get(trendId);
  return Object.freeze({
    stage: stageOf(session, trendId),
    intuition: p ? p.intuition : null,
    readingsRevealedAt: p ? p.readingsRevealedAt : null,
    judgement: p ? p.judgement : null,
  });
}

/** True only when the draft's gutCall is one of the three lenses (and any reason fits on one line). */
export function canRecord(draft) {
  if (!draft || typeof draft !== 'object') return false;
  return isLens(draft.gutCall) && normaliseReason(draft.reason) !== undefined;
}

/**
 * Records the gut reading and returns the frozen intuition record { gutCall, reason, recordedAt }.
 * An empty or whitespace reason becomes null. Throws, changing nothing, unless canRecord(draft)
 * holds, or if the trend already has an intuition record.
 */
export function recordIntuition(session, trendId, draft, now) {
  requireSession(session, 'recordIntuition');
  requireTrendId(trendId, 'recordIntuition');
  if (!canRecord(draft)) throw new Error('recordIntuition: a gut reading needs one of the three lenses');
  requireInstant(now, 'recordIntuition');
  if (stageOf(session, trendId) !== AWAITING) throw new Error(`recordIntuition: ${trendId} already has a gut reading`);
  const record = Object.freeze({ gutCall: draft.gutCall, reason: normaliseReason(draft.reason), recordedAt: now });
  progress(session, trendId).intuition = record;
  return record;
}

/**
 * Stamps the time the readings were revealed and returns it. Called by the trend screen after
 * loadReveal has succeeded and before the reading elements are created. Throws if the trend has no
 * intuition record, if it was already stamped, or if `now` is earlier than the intuition record.
 */
export function markReadingsRevealed(session, trendId, now) {
  requireSession(session, 'markReadingsRevealed');
  requireTrendId(trendId, 'markReadingsRevealed');
  requireInstant(now, 'markReadingsRevealed');
  const p = session.trends.get(trendId);
  if (!p || p.intuition === null) throw new Error(`markReadingsRevealed: ${trendId} has no gut reading recorded`);
  if (p.readingsRevealedAt !== null) throw new Error(`markReadingsRevealed: the readings of ${trendId} were already revealed`);
  if (now < p.intuition.recordedAt) throw new Error('markReadingsRevealed: the time is earlier than the gut reading');
  p.readingsRevealedAt = now;
  return now;
}

/** True only when committedLens is one of the three lenses and the rationale holds a non-whitespace character. */
export function canCommit(draft) {
  if (!draft || typeof draft !== 'object') return false;
  return isLens(draft.committedLens) && hasText(draft.rationale);
}

/** The line saying what is still missing before a commit, or "" when nothing is. */
export function whatIsMissing(draft) {
  const d = draft && typeof draft === 'object' ? draft : {};
  const lens = isLens(d.committedLens);
  const rationale = hasText(d.rationale);
  if (!lens && !rationale) return HINT_BOTH;
  if (!lens) return HINT_LENS;
  if (!rationale) return HINT_RATIONALE;
  return '';
}

/** The prompt answers as recorded: blank answers omitted. Throws on a malformed entry. */
function promptAnswersOf(list) {
  if (list === undefined || list === null) return [];
  if (!Array.isArray(list)) throw new TypeError('commitJudgement: promptAnswers is not an array');
  const out = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') throw new TypeError('commitJudgement: a prompt answer is not an object');
    if (!hasText(item.answer)) continue;
    out.push({ questionId: item.questionId, answer: item.answer });
  }
  return out;
}

/**
 * Commits the judgement and returns the frozen Judgement. Throws, changing nothing, if the readings
 * have not been revealed for the trend (markReadingsRevealed), unless canCommit(draft) holds, if
 * the trend is already committed, or unless the assembled Judgement passes checkJudgement (B4).
 */
export function commitJudgement(session, trendId, draft, now) {
  requireSession(session, 'commitJudgement');
  requireTrendId(trendId, 'commitJudgement');
  const stage = stageOf(session, trendId);
  if (stage === COMMITTED) throw new Error(`commitJudgement: ${trendId} already has a committed judgement`);
  const p = session.trends.get(trendId);
  if (stage !== RECORDED || p.readingsRevealedAt === null) {
    throw new Error(`commitJudgement: the readings of ${trendId} have not been revealed`);
  }
  if (!canCommit(draft)) throw new Error(`commitJudgement: ${whatIsMissing(draft)}`);
  const judgement = {
    trendId,
    intuition: { gutCall: p.intuition.gutCall, reason: p.intuition.reason, recordedAt: p.intuition.recordedAt },
    readingsRevealedAt: p.readingsRevealedAt,
    promptAnswers: promptAnswersOf(draft.promptAnswers),
    committedLens: draft.committedLens,
    rationale: draft.rationale,
    committedAt: now,
    label: 'yours',
    provenance: {
      sourceUrl: null,
      publisher: null,
      publishedOn: null,
      retrievedOn: null,
      producedBy: ['viewer'],
      producedOn: null,
      frozenOn: null,
    },
  };
  const verdict = checkJudgement(judgement);
  if (!verdict || verdict.ok !== true) {
    throw new Error(`commitJudgement: the judgement failed its contract check (${(verdict && verdict.errors || []).join('; ')})`);
  }
  p.judgement = deepFreeze(judgement);
  return p.judgement;
}
