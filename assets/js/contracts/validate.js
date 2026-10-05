// M1 Data contracts: the runtime validator (docs/03-architecture.md, section 6.2; signatures in
// docs/04-module-design.md, M1). One check per entity and container, each returning { ok: true } or
// { ok: false, errors } with `errors` an array of messages, and never throwing, whatever it is
// given. It guards the invariants at the moment content reaches the page: closed shapes, fixed
// labels, a deep scan for banned field names, and the rules JSON Schema cannot express (timestamp
// order, level-name membership, agreement between two records).
//
// The checks for the interactive F5 (conversation questions, scenario record) are deferred with it
// (F5 static, decision of 5 Oct 2026) and are not written in this release.

import {
  LABELS,
  LENSES,
  PRODUCERS,
  MATURITY_STATUSES,
  READINESS_CATEGORY_KEYS,
  PRACTICE_KEYS,
  BANNED_NAME_TOKENS,
  ID_PATTERNS,
  LEVEL_NAME_PLACEHOLDER,
  MATURITY_LEVEL_NAMES,
} from './vocabulary.js';
import {
  BRIEF_SIGNAL_CAP,
  QUOTE_MAX_WORDS,
  REPLAY_WINDOW_START,
  REPLAY_WINDOW_END,
  QUESTIONS_PER_GROUP_MAX,
} from './constants.js';

// ------------------------------------------------------------------------------- primitive rules
// Each mirrors a definition in schemas/common.schema.json.

const DATE = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
const DATE_TIME = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/;
const HTTPS = /^https:\/\/\S+$/;
const HTTPS_MAX_LENGTH = 2000;
const ONE_LINE = /^[^\r\n]*\S[^\r\n]*$/;
const ONE_LINE_MAX_LENGTH = 200;
const QUESTION = /\S.*\?\s*$/u;
const SLUG = /^[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$/;
const ROLE_MAX_LENGTH = 40;
const LANGUAGE = /^[a-z]{2}$/;
const PAGE = /^[0-9]{1,4}(-[0-9]{1,4})?$/;
const BRIEF_ID = /^brief-[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const READINESS_ID = /^readiness-[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$/;
/** freeze-manifest.schema.json, modules.items.pattern. */
const MANIFEST_PATH = /^data\/([a-z][a-z0-9-]*|(reveal|conversation)\/trend-[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*)\.js$/;
const MANIFEST_SELF = /^data\/freeze\.js$/;

/** Who may author a replayed past judgement (log-entry.schema.json, authoredBy). */
const REPLAY_AUTHORS = Object.freeze(['rival-reader', 'interrogator']);

/** The governance statements Level 2 requires, pinned by identifier (governance.schema.json). */
const GOVERNANCE_IMPLEMENTED = Object.freeze([
  'open-web-sources-frozen',
  'no-viewer-data-stored-or-sent',
  'no-live-ai',
  'no-accounts-cookies-analytics',
]);
const GOVERNANCE_NOT_IMPLEMENTED = Object.freeze(['own-data-ingestion', 'cross-session-persistence', 'role-aware-model']);
const GOVERNANCE_IMPLEMENTED_MIN = 4;
const GOVERNANCE_NOT_IMPLEMENTED_MIN = 3;

const READINESS_CATEGORY_COUNT = 5;
const PRACTICE_COUNT = 3;
const LENS_COUNT = 3;

const PROVENANCE_KEYS = Object.freeze(['sourceUrl', 'publisher', 'publishedOn', 'retrievedOn', 'producedBy', 'producedOn', 'frozenOn']);
const EXTERNAL_KEYS = Object.freeze(['sourceUrl', 'publisher', 'publishedOn', 'retrievedOn']);

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isString = (v) => typeof v === 'string';
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const hasText = (v) => isString(v) && /\S/.test(v);
const isDate = (v) => isString(v) && DATE.test(v);
const isDateTime = (v) => isString(v) && DATE_TIME.test(v);
const isHttps = (v) => isString(v) && v.length <= HTTPS_MAX_LENGTH && HTTPS.test(v);
const isOneLine = (v) => isString(v) && v.length <= ONE_LINE_MAX_LENGTH && ONE_LINE.test(v);
const isQuestion = (v) => isString(v) && v.length >= 2 && QUESTION.test(v);
const matches = (re, v) => isString(v) && re.test(v);
const describe = (v) => {
  try {
    return JSON.stringify(v) ?? String(v);
  } catch {
    return String(v);
  }
};

// ------------------------------------------------------------------------------- the error sink

function sink() {
  const errors = [];
  return {
    errors,
    add(path, message) {
      errors.push(`${path || '/'}: ${message}`);
    },
  };
}

/**
 * Checks that `value` is an object holding every key in `required` and no key outside `allowed`.
 * Returns false (after recording why) if `value` is not an object at all.
 */
function shape(e, path, value, required, optional = []) {
  if (!isObject(value)) {
    e.add(path, `expected an object, found ${describe(value)}`);
    return false;
  }
  const allowed = new Set([...required, ...optional]);
  for (const key of required) if (!has(value, key)) e.add(path, `missing required property "${key}"`);
  for (const key of Object.keys(value)) if (!allowed.has(key)) e.add(`${path}/${key}`, 'property not in the contract');
  return true;
}

function text(e, path, v) {
  if (!hasText(v)) e.add(path, 'expected non-empty text with a non-whitespace character');
}

function date(e, path, v) {
  if (!isDate(v)) e.add(path, `expected an ISO date YYYY-MM-DD, found ${describe(v)}`);
}

function dateTime(e, path, v) {
  if (!isDateTime(v)) e.add(path, `expected an ISO instant from toISOString(), found ${describe(v)}`);
}

function constant(e, path, v, expected) {
  if (v !== expected) e.add(path, `expected ${describe(expected)}, found ${describe(v)}`);
}

function oneOf(e, path, v, list) {
  if (!list.includes(v)) e.add(path, `expected one of ${list.join(', ')}, found ${describe(v)}`);
}

function pattern(e, path, v, re, what) {
  if (!matches(re, v)) e.add(path, `expected ${what}, found ${describe(v)}`);
}

function generatedText(e, path, v) {
  if (!shape(e, path, v, ['text', 'label'])) return;
  text(e, `${path}/text`, v.text);
  constant(e, `${path}/label`, v.label, 'ai-generated');
}

function sourceRef(e, path, v) {
  if (!shape(e, path, v, ['url', 'publisher', 'publishedOn', 'retrievedOn'], ['title'])) return;
  if (!isHttps(v.url)) e.add(`${path}/url`, `expected an https URL, found ${describe(v.url)}`);
  text(e, `${path}/publisher`, v.publisher);
  if (has(v, 'title')) text(e, `${path}/title`, v.title);
  date(e, `${path}/publishedOn`, v.publishedOn);
  date(e, `${path}/retrievedOn`, v.retrievedOn);
}

function reportCitation(e, path, v) {
  if (!shape(e, path, v, ['url', 'publisher', 'title', 'publishedOn', 'retrievedOn', 'page'])) return;
  if (!isHttps(v.url)) e.add(`${path}/url`, `expected an https URL, found ${describe(v.url)}`);
  text(e, `${path}/publisher`, v.publisher);
  text(e, `${path}/title`, v.title);
  date(e, `${path}/publishedOn`, v.publishedOn);
  date(e, `${path}/retrievedOn`, v.retrievedOn);
  pattern(e, `${path}/page`, v.page, PAGE, 'a page such as "9" or "9-11"');
}

function array(e, path, v, { min = 0, max = Infinity, unique = false } = {}) {
  if (!Array.isArray(v)) {
    e.add(path, `expected an array, found ${describe(v)}`);
    return false;
  }
  if (v.length < min) e.add(path, `expected at least ${min} item(s), found ${v.length}`);
  if (v.length > max) e.add(path, `expected at most ${max} item(s), found ${v.length}`);
  if (unique) {
    const seen = new Set();
    v.forEach((item, i) => {
      const key = describe(item);
      if (seen.has(key)) e.add(`${path}/${i}`, 'duplicate item');
      seen.add(key);
    });
  }
  return true;
}

/** Each of `keys` occurs exactly once as `item[field]` in `items`. */
function eachOnce(e, path, items, field, keys) {
  for (const key of keys) {
    const n = items.filter((item) => isObject(item) && item[field] === key).length;
    if (n !== 1) e.add(path, `expected exactly one item with ${field} "${key}", found ${n}`);
  }
}

/**
 * Provenance (common.schema.json $defs/provenance and its three refinements, DM-3).
 *   kind 'published': a real, published item; the four external-source fields are set.
 *   kind 'frozen':    a fixture; either all four set or all four null; never the viewer.
 *   kind 'session':   the viewer's own record; no external source, the viewer alone, never frozen.
 */
function provenance(e, path, v, kind) {
  if (!shape(e, path, v, PROVENANCE_KEYS)) return;
  const nulls = EXTERNAL_KEYS.filter((k) => v[k] === null).length;
  if (nulls !== 0 && nulls !== EXTERNAL_KEYS.length) {
    e.add(path, 'sourceUrl, publisher, publishedOn and retrievedOn must be all set or all null');
  }
  if (v.sourceUrl !== null && !isHttps(v.sourceUrl)) e.add(`${path}/sourceUrl`, `expected an https URL or null, found ${describe(v.sourceUrl)}`);
  if (v.publisher !== null) text(e, `${path}/publisher`, v.publisher);
  for (const k of ['publishedOn', 'retrievedOn', 'producedOn', 'frozenOn']) {
    if (v[k] !== null) date(e, `${path}/${k}`, v[k]);
  }
  if (array(e, `${path}/producedBy`, v.producedBy, { min: 1, unique: true })) {
    v.producedBy.forEach((p, i) => oneOf(e, `${path}/producedBy/${i}`, p, PRODUCERS));
  }
  const producedBy = Array.isArray(v.producedBy) ? v.producedBy : [];
  if (kind === 'published' || kind === 'frozen') {
    if (producedBy.includes('viewer')) e.add(`${path}/producedBy`, 'a frozen entity is never produced by the viewer');
    if (v.producedOn === null) e.add(`${path}/producedOn`, 'a frozen entity has a production date');
    if (v.frozenOn === null) e.add(`${path}/frozenOn`, 'a frozen entity has a freeze date');
  }
  if (kind === 'published' && nulls !== 0) e.add(path, 'a published item carries its external source');
  if (kind === 'session') {
    if (nulls !== EXTERNAL_KEYS.length) e.add(path, "the viewer's own record has no external source");
    if (producedBy.length !== 1 || producedBy[0] !== 'viewer') e.add(`${path}/producedBy`, 'expected ["viewer"]');
    if (v.producedOn !== null) e.add(`${path}/producedOn`, 'expected null');
    if (v.frozenOn !== null) e.add(`${path}/frozenOn`, 'expected null');
  }
}

// ------------------------------------------------------------------------------- deep scans

/** Splits a key into lower-case tokens at camelCase boundaries, hyphens, underscores, dots and spaces. */
function nameTokens(name) {
  return String(name)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((t) => t.toLowerCase());
}

/** Calls visit(key, value, path) for every own key of every object at any depth. Never throws. */
function walkKeys(value, visit) {
  const seen = new Set();
  (function walk(v, path) {
    if (v === null || typeof v !== 'object' || seen.has(v)) return;
    seen.add(v);
    if (Array.isArray(v)) {
      v.forEach((item, i) => walk(item, `${path}/${i}`));
      return;
    }
    for (const key of Object.keys(v)) {
      visit(key, v[key], `${path}/${key}`);
      walk(v[key], `${path}/${key}`);
    }
  })(value, '');
}

/**
 * The paths of every key, at any depth, containing a banned token (BANNED_NAME_TOKENS), for
 * example ['/readings/0/score']. An empty array when there are none. Never throws.
 */
export function findBannedKeys(value) {
  const found = [];
  try {
    walkKeys(value, (key, _child, path) => {
      if (nameTokens(key).some((t) => BANNED_NAME_TOKENS.includes(t))) found.push(path);
    });
  } catch {
    found.push('/ (the value could not be scanned)');
  }
  return found;
}

/** Every key named `label`, at any depth, holds a value from the six-value vocabulary. */
function labelsInVocabulary(e, value) {
  walkKeys(value, (key, child, path) => {
    if (key === 'label' && !LABELS.includes(child)) e.add(path, `label ${describe(child)} is not in the vocabulary`);
  });
}

/** Runs one check with the shared deep scans, and turns any exception into a rejection. */
function run(value, body) {
  const e = sink();
  try {
    for (const path of findBannedKeys(value)) e.add(path, 'banned field name (no ranking, invariant 1)');
    labelsInVocabulary(e, value);
    body(e);
  } catch (error) {
    e.add('/', `the check could not complete: ${error && error.message}`);
  }
  return e.errors.length === 0 ? { ok: true } : { ok: false, errors: e.errors };
}

// ------------------------------------------------------------------------------- entities

/** A Signal: URL, publisher, both dates, summary, relevance note; quote within QUOTE_MAX_WORDS. */
export function checkSignal(signal) {
  return run(signal, (e) => {
    const s = signal;
    if (!shape(e, '', s, ['id', 'title', 'sourceLanguage', 'summary', 'relevanceNote', 'label', 'provenance'], ['quote', 'windowNote'])) return;
    pattern(e, '/id', s.id, ID_PATTERNS.signalId, 'a signal identifier');
    text(e, '/title', s.title);
    pattern(e, '/sourceLanguage', s.sourceLanguage, LANGUAGE, 'a two-letter language code');
    generatedText(e, '/summary', s.summary);
    generatedText(e, '/relevanceNote', s.relevanceNote);
    if (has(s, 'quote')) {
      text(e, '/quote', s.quote);
      if (isString(s.quote)) {
        const words = s.quote.split(/\s+/).filter(Boolean).length;
        if (words > QUOTE_MAX_WORDS) e.add('/quote', `${words} words, more than QUOTE_MAX_WORDS (${QUOTE_MAX_WORDS})`);
      }
    }
    if (has(s, 'windowNote') && !isOneLine(s.windowNote)) e.add('/windowNote', 'expected one line of text');
    constant(e, '/label', s.label, 'real');
    provenance(e, '/provenance', s.provenance, 'published');
  });
}

/**
 * The Brief container: its shape and at most BRIEF_SIGNAL_CAP signal identifiers. Per-signal checks
 * are checkSignal's; resolving the identifiers is the screen's (F2-S2).
 */
export function checkBrief(brief) {
  return run(brief, (e) => {
    const b = brief;
    if (!shape(e, '', b, ['id', 'periodStart', 'periodEnd', 'signalIds', 'label', 'provenance'])) return;
    pattern(e, '/id', b.id, BRIEF_ID, 'brief-<periodEnd>');
    date(e, '/periodStart', b.periodStart);
    date(e, '/periodEnd', b.periodEnd);
    if (array(e, '/signalIds', b.signalIds, { max: BRIEF_SIGNAL_CAP, unique: true })) {
      b.signalIds.forEach((id, i) => pattern(e, `/signalIds/${i}`, id, ID_PATTERNS.signalId, 'a signal identifier'));
    }
    constant(e, '/label', b.label, 'frozen');
    provenance(e, '/provenance', b.provenance, 'frozen');
  });
}

/** The three reading references of a Trend: exactly one per lens (invariant 1). */
function readingReferences(e, path, refs) {
  if (!array(e, path, refs, { min: LENS_COUNT, max: LENS_COUNT })) return;
  refs.forEach((r, i) => {
    if (!shape(e, `${path}/${i}`, r, ['lens', 'readingId'])) return;
    oneOf(e, `${path}/${i}/lens`, r.lens, LENSES);
    pattern(e, `${path}/${i}/readingId`, r.readingId, ID_PATTERNS.readingId, 'a reading identifier');
  });
  eachOnce(e, path, refs, 'lens', LENSES);
}

/**
 * A Trend: three references, one per lens; non-empty title, summary and intuition prompt; every
 * signalId resolves in `signals` (the Signal array).
 */
export function checkTrend(trend, signals) {
  return run(trend, (e) => {
    const t = trend;
    if (!shape(e, '', t, ['id', 'title', 'summary', 'intuitionPrompt', 'signalIds', 'readings', 'label', 'provenance'])) return;
    pattern(e, '/id', t.id, ID_PATTERNS.trendId, 'a trend identifier');
    text(e, '/title', t.title);
    text(e, '/summary', t.summary);
    text(e, '/intuitionPrompt', t.intuitionPrompt);
    if (array(e, '/signalIds', t.signalIds, { min: 1, unique: true })) {
      const known = new Set(Array.isArray(signals) ? signals.filter(isObject).map((s) => s.id) : []);
      if (!Array.isArray(signals)) e.add('/signalIds', 'no Signal list was given to resolve the identifiers against');
      t.signalIds.forEach((id, i) => {
        pattern(e, `/signalIds/${i}`, id, ID_PATTERNS.signalId, 'a signal identifier');
        if (Array.isArray(signals) && !known.has(id)) e.add(`/signalIds/${i}`, `${describe(id)} resolves to no Signal`);
      });
    }
    readingReferences(e, '/readings', t.readings);
    constant(e, '/label', t.label, 'ai-generated');
    provenance(e, '/provenance', t.provenance, 'frozen');
  });
}

function claim(e, path, c) {
  if (!shape(e, path, c, ['claim', 'source'], ['signalId'])) return;
  text(e, `${path}/claim`, c.claim);
  sourceRef(e, `${path}/source`, c.source);
  if (has(c, 'signalId')) pattern(e, `${path}/signalId`, c.signalId, ID_PATTERNS.signalId, 'a signal identifier');
}

function reading(e, path, r, trendId) {
  if (!shape(e, path, r, ['id', 'trendId', 'lens', 'text', 'evidence', 'counterEvidence', 'disconfirmingCondition', 'label', 'provenance'])) return;
  pattern(e, `${path}/id`, r.id, ID_PATTERNS.readingId, 'a reading identifier');
  constant(e, `${path}/trendId`, r.trendId, trendId);
  oneOf(e, `${path}/lens`, r.lens, LENSES);
  text(e, `${path}/text`, r.text);
  for (const group of ['evidence', 'counterEvidence']) {
    if (array(e, `${path}/${group}`, r[group], { min: 1 })) r[group].forEach((c, i) => claim(e, `${path}/${group}/${i}`, c));
  }
  text(e, `${path}/disconfirmingCondition`, r.disconfirmingCondition);
  constant(e, `${path}/label`, r.label, 'ai-generated');
  provenance(e, `${path}/provenance`, r.provenance, 'frozen');
}

function questionGroup(e, path, group) {
  if (!array(e, path, group, { min: 1, max: QUESTIONS_PER_GROUP_MAX })) return;
  group.forEach((q, i) => {
    if (!shape(e, `${path}/${i}`, q, ['id', 'text'])) return;
    pattern(e, `${path}/${i}/id`, q.id, ID_PATTERNS.questionId, 'a question identifier');
    if (!isQuestion(q.text)) e.add(`${path}/${i}/text`, 'expected a question ending with "?"');
  });
}

function interrogation(e, path, q, trendId) {
  if (!shape(e, path, q, ['id', 'trendId', 'provenanceChecks', 'assumptionProbes', 'preMortem', 'label', 'provenance'])) return;
  pattern(e, `${path}/id`, q.id, ID_PATTERNS.interrogationId, 'an interrogation identifier');
  constant(e, `${path}/trendId`, q.trendId, trendId);
  for (const group of ['provenanceChecks', 'assumptionProbes', 'preMortem']) questionGroup(e, `${path}/${group}`, q[group]);
  constant(e, `${path}/label`, q.label, 'ai-generated');
  provenance(e, `${path}/provenance`, q.provenance, 'frozen');
}

/**
 * A reveal bundle against its Trend: three Readings whose lenses and identifiers match the Trend's
 * references, every trendId equal to trend.id, evidence, counter-evidence and a disconfirming
 * condition on each, and an Interrogation with one to QUESTIONS_PER_GROUP_MAX questions per group.
 */
export function checkRevealBundle(bundle, trend) {
  return run(bundle, (e) => {
    const b = bundle;
    if (!isObject(trend) || !isString(trend.id) || !Array.isArray(trend.readings)) {
      e.add('/', 'no valid Trend was given to check the bundle against');
      return;
    }
    if (!shape(e, '', b, ['trendId', 'readings', 'interrogation'])) return;
    constant(e, '/trendId', b.trendId, trend.id);
    if (array(e, '/readings', b.readings, { min: LENS_COUNT, max: LENS_COUNT })) {
      b.readings.forEach((r, i) => reading(e, `/readings/${i}`, r, trend.id));
      eachOnce(e, '/readings', b.readings, 'lens', LENSES);
      b.readings.forEach((r, i) => {
        if (!isObject(r)) return;
        const ref = trend.readings.find((x) => isObject(x) && x.lens === r.lens);
        if (!ref || ref.readingId !== r.id) {
          e.add(`/readings/${i}/id`, `${describe(r.id)} is not the reading the Trend holds for lens ${describe(r.lens)}`);
        }
      });
    }
    interrogation(e, '/interrogation', b.interrogation, trend.id);
  });
}

// ------------------------------------------------------------------------------- readiness (F3)

function category(e, path, c) {
  if (!shape(e, path, c, ['key', 'name', 'answers', 'finding'])) return;
  oneOf(e, `${path}/key`, c.key, READINESS_CATEGORY_KEYS);
  text(e, `${path}/name`, c.name);
  if (array(e, `${path}/answers`, c.answers, { min: 1 })) {
    c.answers.forEach((a, i) => {
      if (!shape(e, `${path}/answers/${i}`, a, ['question', 'answer'])) return;
      text(e, `${path}/answers/${i}/question`, a.question);
      text(e, `${path}/answers/${i}/answer`, a.answer);
    });
  }
  text(e, `${path}/finding`, c.finding);
}

/** One practice of a verified profile, against the ordered verified level names. */
function verifiedPractice(e, path, p, levelNames) {
  const at = levelNames.indexOf(p.levelName);
  if (at < 0) {
    e.add(`${path}/levelName`, `${describe(p.levelName)} is not a verified level name`);
    return;
  }
  const successor = at + 1 < levelNames.length ? levelNames[at + 1] : null;

  if (p.betweenLevels !== null) {
    if (shape(e, `${path}/betweenLevels`, p.betweenLevels, ['lowerLevelName', 'upperLevelName'])) {
      // The lower-level rule (D-1): the lower of the two levels is the one assigned.
      constant(e, `${path}/betweenLevels/lowerLevelName`, p.betweenLevels.lowerLevelName, p.levelName);
      if (successor === null || p.betweenLevels.upperLevelName !== successor) {
        e.add(`${path}/betweenLevels/upperLevelName`, 'expected the level the report places directly above the assigned one');
      }
    }
  }

  if (shape(e, `${path}/explanation`, p.explanation, ['text', 'citation'])) {
    generatedText(e, `${path}/explanation/text`, p.explanation.text);
    reportCitation(e, `${path}/explanation/citation`, p.explanation.citation);
  }

  const next = p.nextLevel;
  if (!isObject(next)) {
    e.add(`${path}/nextLevel`, 'expected the next level or the citation showing there is none');
  } else if (successor === null) {
    if (shape(e, `${path}/nextLevel`, next, ['noLevelAboveCitation'])) {
      reportCitation(e, `${path}/nextLevel/noLevelAboveCitation`, next.noLevelAboveCitation);
    }
  } else if (shape(e, `${path}/nextLevel`, next, ['levelName', 'description', 'citation'])) {
    constant(e, `${path}/nextLevel/levelName`, next.levelName, successor);
    generatedText(e, `${path}/nextLevel/description`, next.description);
    reportCitation(e, `${path}/nextLevel/citation`, next.citation);
  }
}

/**
 * The readiness profile: five categories, three practices, and the placeholder rule while
 * unverified; once verified, level names from `levelNames` (MATURITY_LEVEL_NAMES unless injected),
 * the lower-level and next-level rules, and `ai-generated` on every explanation text and next-level
 * description (Red-team finding B1).
 */
export function checkReadiness(profile, { levelNames = MATURITY_LEVEL_NAMES } = {}) {
  return run(profile, (e) => {
    const r = profile;
    if (!shape(e, '', r, ['id', 'subject', 'framework', 'categories', 'maturity', 'label', 'provenance'])) return;
    pattern(e, '/id', r.id, READINESS_ID, 'readiness-<slug>');
    text(e, '/subject', r.subject);
    if (shape(e, '/framework', r.framework, ['name', 'citation', 'label'])) {
      text(e, '/framework/name', r.framework.name);
      sourceRef(e, '/framework/citation', r.framework.citation);
      constant(e, '/framework/label', r.framework.label, 'real');
    }
    if (array(e, '/categories', r.categories, { min: READINESS_CATEGORY_COUNT, max: READINESS_CATEGORY_COUNT })) {
      r.categories.forEach((c, i) => category(e, `/categories/${i}`, c));
      eachOnce(e, '/categories', r.categories, 'key', READINESS_CATEGORY_KEYS);
    }
    constant(e, '/label', r.label, 'fictional');
    provenance(e, '/provenance', r.provenance, 'frozen');

    const m = r.maturity;
    if (!shape(e, '/maturity', m, ['status', 'report', 'practices'])) return;
    oneOf(e, '/maturity/status', m.status, MATURITY_STATUSES);
    const practicesOk = array(e, '/maturity/practices', m.practices, { min: PRACTICE_COUNT, max: PRACTICE_COUNT });
    if (practicesOk) eachOnce(e, '/maturity/practices', m.practices, 'key', PRACTICE_KEYS);
    const practices = practicesOk ? m.practices : [];
    const shaped = practices.map((p, i) => {
      const path = `/maturity/practices/${i}`;
      if (!shape(e, path, p, ['key', 'name', 'levelName', 'betweenLevels', 'explanation', 'nextLevel'])) return null;
      oneOf(e, `${path}/key`, p.key, PRACTICE_KEYS);
      text(e, `${path}/name`, p.name);
      text(e, `${path}/levelName`, p.levelName);
      return p;
    });

    if (m.status === 'unverified') {
      if (m.report !== null) e.add('/maturity/report', 'expected null while the level names are unverified');
      shaped.forEach((p, i) => {
        if (!p) return;
        const path = `/maturity/practices/${i}`;
        constant(e, `${path}/levelName`, p.levelName, LEVEL_NAME_PLACEHOLDER);
        for (const k of ['betweenLevels', 'explanation', 'nextLevel']) {
          if (p[k] !== null) e.add(`${path}/${k}`, 'expected null while the level names are unverified');
        }
      });
    } else if (m.status === 'verified') {
      sourceRef(e, '/maturity/report', m.report);
      const names = Array.isArray(levelNames) ? levelNames : [];
      if (names.length === 0) {
        e.add('/maturity/status', 'the profile is verified but no verified level names are known');
        return;
      }
      shaped.forEach((p, i) => {
        if (p) verifiedPractice(e, `/maturity/practices/${i}`, p, names);
      });
    }
  });
}

// ------------------------------------------------------------------------------- governance (F3, R8)

function governanceStatements(e, path, list, min, pinned) {
  if (!array(e, path, list, { min })) return;
  list.forEach((item, i) => {
    if (!shape(e, `${path}/${i}`, item, ['id', 'text', 'verifiedBy'])) return;
    pattern(e, `${path}/${i}/id`, item.id, SLUG, 'a slug');
    text(e, `${path}/${i}/text`, item.text);
    // Every statement in both lists names the tests that verify it (Red-team finding N5).
    if (array(e, `${path}/${i}/verifiedBy`, item.verifiedBy, { min: 1, unique: true })) {
      item.verifiedBy.forEach((id, j) => pattern(e, `${path}/${i}/verifiedBy/${j}`, id, ID_PATTERNS.testId, 'a test identifier'));
    }
  });
  eachOnce(e, path, list, 'id', pinned);
}

/**
 * The governance container: the required statements, verifiedBy on every item of both lists, every
 * argument paragraph sourced and labelled ai-generated, the container labelled real. An empty
 * argument is valid (N6 option (b), decided by Miguel, 5 Oct 2026): the screen then shows F3-S3a.
 */
export function checkGovernance(container) {
  return run(container, (e) => {
    const g = container;
    if (!shape(e, '', g, ['id', 'implemented', 'notImplemented', 'argument', 'label', 'provenance'])) return;
    constant(e, '/id', g.id, 'governance');
    governanceStatements(e, '/implemented', g.implemented, GOVERNANCE_IMPLEMENTED_MIN, GOVERNANCE_IMPLEMENTED);
    governanceStatements(e, '/notImplemented', g.notImplemented, GOVERNANCE_NOT_IMPLEMENTED_MIN, GOVERNANCE_NOT_IMPLEMENTED);
    if (array(e, '/argument', g.argument, { min: 0 })) {
      g.argument.forEach((p, i) => {
        if (!shape(e, `/argument/${i}`, p, ['id', 'text', 'sources', 'label'])) return;
        pattern(e, `/argument/${i}/id`, p.id, SLUG, 'a slug');
        text(e, `/argument/${i}/text`, p.text);
        if (array(e, `/argument/${i}/sources`, p.sources, { min: 1 })) {
          p.sources.forEach((s, j) => sourceRef(e, `/argument/${i}/sources/${j}`, s));
        }
        constant(e, `/argument/${i}/label`, p.label, 'ai-generated');
      });
    }
    constant(e, '/label', g.label, 'real');
    provenance(e, '/provenance', g.provenance, 'frozen');
  });
}

// ------------------------------------------------------------------------------- decision log (F4)

/**
 * One replay entry: its shape and labels; every original signal published inside the replay
 * window; the outcome published after every original signal; and the K-7 date order
 * asOfDate <= authoredOn <= attachedOn <= frozenOn, with asOfDate on or after the latest original
 * signal and before the outcome's publication.
 */
export function checkLogEntry(entry) {
  return run(entry, (e) => {
    const x = entry;
    if (!shape(e, '', x, ['id', 'originalSignals', 'pastJudgement', 'outcome', 'calibrationNote', 'label', 'provenance'], ['role'])) return;
    pattern(e, '/id', x.id, ID_PATTERNS.entryId, 'a replay entry identifier');

    const signalDates = [];
    if (array(e, '/originalSignals', x.originalSignals, { min: 1 })) {
      x.originalSignals.forEach((s, i) => {
        const path = `/originalSignals/${i}`;
        if (!shape(e, path, s, ['title', 'summary', 'source', 'label'])) return;
        text(e, `${path}/title`, s.title);
        generatedText(e, `${path}/summary`, s.summary);
        sourceRef(e, `${path}/source`, s.source);
        constant(e, `${path}/label`, s.label, 'real');
        const published = isObject(s.source) ? s.source.publishedOn : undefined;
        if (isDate(published)) {
          signalDates.push(published);
          if (published < REPLAY_WINDOW_START || published > REPLAY_WINDOW_END) {
            e.add(`${path}/source/publishedOn`, `${published} is outside the replay window ${REPLAY_WINDOW_START} to ${REPLAY_WINDOW_END}`);
          }
        }
      });
    }
    const latestSignal = signalDates.length ? signalDates.reduce((a, b) => (b > a ? b : a)) : null;

    const j = x.pastJudgement;
    if (shape(e, '/pastJudgement', j, ['lens', 'rationale', 'asOfDate', 'authoredOn', 'authoredBy', 'label'])) {
      oneOf(e, '/pastJudgement/lens', j.lens, LENSES);
      text(e, '/pastJudgement/rationale', j.rationale);
      date(e, '/pastJudgement/asOfDate', j.asOfDate);
      date(e, '/pastJudgement/authoredOn', j.authoredOn);
      if (array(e, '/pastJudgement/authoredBy', j.authoredBy, { min: 1, unique: true })) {
        j.authoredBy.forEach((a, i) => oneOf(e, `/pastJudgement/authoredBy/${i}`, a, REPLAY_AUTHORS));
      }
      constant(e, '/pastJudgement/label', j.label, 'replay');
    }

    const o = x.outcome;
    if (shape(e, '/outcome', o, ['summary', 'source', 'attachedOn', 'label'])) {
      generatedText(e, '/outcome/summary', o.summary);
      sourceRef(e, '/outcome/source', o.source);
      date(e, '/outcome/attachedOn', o.attachedOn);
      constant(e, '/outcome/label', o.label, 'real');
    }

    generatedText(e, '/calibrationNote', x.calibrationNote);
    if (has(x, 'role') && !(matches(SLUG, x.role) && x.role.length <= ROLE_MAX_LENGTH)) e.add('/role', 'expected a role slug');
    constant(e, '/label', x.label, 'replay');
    provenance(e, '/provenance', x.provenance, 'frozen');

    // Date order (M8-U1, M8-U7). Compared only where every date involved is well formed; a
    // malformed date has already been reported above.
    const outcomePublished = isObject(o) && isObject(o.source) && isDate(o.source.publishedOn) ? o.source.publishedOn : null;
    const asOf = isObject(j) && isDate(j.asOfDate) ? j.asOfDate : null;
    const authored = isObject(j) && isDate(j.authoredOn) ? j.authoredOn : null;
    const attached = isObject(o) && isDate(o.attachedOn) ? o.attachedOn : null;
    const frozen = isObject(x.provenance) && isDate(x.provenance.frozenOn) ? x.provenance.frozenOn : null;
    if (outcomePublished && latestSignal && !(outcomePublished > latestSignal)) {
      e.add('/outcome/source/publishedOn', 'the outcome must be published after every original signal');
    }
    if (asOf && latestSignal && asOf < latestSignal) e.add('/pastJudgement/asOfDate', 'earlier than the latest original signal');
    if (asOf && outcomePublished && !(asOf < outcomePublished)) e.add('/pastJudgement/asOfDate', "not before the outcome's publication");
    if (asOf && authored && asOf > authored) e.add('/pastJudgement/authoredOn', 'earlier than asOfDate');
    if (authored && attached && authored > attached) e.add('/outcome/attachedOn', 'earlier than pastJudgement.authoredOn');
    if (attached && frozen && attached > frozen) e.add('/outcome/attachedOn', 'later than provenance.frozenOn');
  });
}

/** The log container: an array. Each entry is checked, and withheld if it fails, by checkLogEntry. */
export function checkLog(log) {
  if (Array.isArray(log)) return { ok: true };
  return { ok: false, errors: [`/: expected an array of log entries, found ${describe(log)}`] };
}

// ------------------------------------------------------------------------------- the viewer's judgement (F1)

/**
 * A Judgement: the intuition record present, the order intuition.recordedAt <= readingsRevealedAt
 * <= committedAt, a committed lens, a rationale with a non-whitespace character, label yours and
 * session provenance.
 */
export function checkJudgement(judgement) {
  return run(judgement, (e) => {
    const j = judgement;
    if (!shape(e, '', j, ['trendId', 'intuition', 'readingsRevealedAt', 'promptAnswers', 'committedLens', 'rationale', 'committedAt', 'label', 'provenance'], ['role'])) return;
    pattern(e, '/trendId', j.trendId, ID_PATTERNS.trendId, 'a trend identifier');
    const intuition = j.intuition;
    if (shape(e, '/intuition', intuition, ['gutCall', 'reason', 'recordedAt'])) {
      oneOf(e, '/intuition/gutCall', intuition.gutCall, LENSES);
      if (intuition.reason !== null && !isOneLine(intuition.reason)) e.add('/intuition/reason', 'expected one line of text or null');
      dateTime(e, '/intuition/recordedAt', intuition.recordedAt);
    }
    dateTime(e, '/readingsRevealedAt', j.readingsRevealedAt);
    if (array(e, '/promptAnswers', j.promptAnswers)) {
      j.promptAnswers.forEach((a, i) => {
        if (!shape(e, `/promptAnswers/${i}`, a, ['questionId', 'answer'])) return;
        pattern(e, `/promptAnswers/${i}/questionId`, a.questionId, ID_PATTERNS.questionId, 'a question identifier');
        text(e, `/promptAnswers/${i}/answer`, a.answer);
      });
    }
    oneOf(e, '/committedLens', j.committedLens, LENSES);
    text(e, '/rationale', j.rationale);
    dateTime(e, '/committedAt', j.committedAt);
    if (has(j, 'role') && !(matches(SLUG, j.role) && j.role.length <= ROLE_MAX_LENGTH)) e.add('/role', 'expected a role slug');
    constant(e, '/label', j.label, 'yours');
    provenance(e, '/provenance', j.provenance, 'session');

    // Intuition before AI (invariant 2), made checkable by three timestamps. ISO instants in the
    // fixed toISOString() form compare correctly as strings.
    const recorded = isObject(intuition) && isDateTime(intuition.recordedAt) ? intuition.recordedAt : null;
    const revealed = isDateTime(j.readingsRevealedAt) ? j.readingsRevealedAt : null;
    const committed = isDateTime(j.committedAt) ? j.committedAt : null;
    if (recorded && revealed && revealed < recorded) e.add('/readingsRevealedAt', 'earlier than intuition.recordedAt');
    if (revealed && committed && committed < revealed) e.add('/committedAt', 'earlier than readingsRevealedAt');
  });
}

// ------------------------------------------------------------------------------- the freeze manifest

/**
 * The freeze manifest: frozenOn and pipelineRunOn are ISO dates; modules is a non-empty,
 * duplicate-free list of data module paths that includes the manifest itself. loadFreeze treats a
 * failure here as it treats a module that cannot be loaded: the start-up message G-E1 stays.
 */
export function checkFreezeManifest(manifest) {
  return run(manifest, (e) => {
    const m = manifest;
    if (!shape(e, '', m, ['frozenOn', 'pipelineRunOn', 'modules'])) return;
    date(e, '/frozenOn', m.frozenOn);
    date(e, '/pipelineRunOn', m.pipelineRunOn);
    if (array(e, '/modules', m.modules, { min: 1, unique: true })) {
      m.modules.forEach((p, i) => pattern(e, `/modules/${i}`, p, MANIFEST_PATH, 'a data module path'));
      if (!m.modules.some((p) => matches(MANIFEST_SELF, p))) e.add('/modules', 'the manifest does not list itself');
    }
  });
}
