// M1 Data contracts: the one source of every closed vocabulary the contracts and the page share
// (docs/03-architecture.md, section 6.2, mechanism 1). schemas/*.json repeat these values; the
// M1-U5 unit test fails if a schema enumeration or identifier pattern differs from its constant
// here. This module imports nothing.

/** The six honesty labels (CLAUDE.md invariant 5; DM-1 added `yours`). The label states origin (DM-2). */
export const LABELS = Object.freeze(['real', 'ai-generated', 'frozen', 'fictional', 'replay', 'yours']);

/** The visible badge text for each label (docs/03-architecture.md, section 8). */
export const LABEL_DISPLAY = Object.freeze({
  real: 'Real',
  'ai-generated': 'AI-generated',
  frozen: 'Frozen',
  fictional: 'Fictional',
  replay: 'Replay',
  yours: 'Yours',
});

/**
 * The three rival lenses, in alphabetical order. Peers: this order carries no meaning, and the page
 * shows the readings in an order drawn at random per trend per page load (Q-2).
 */
export const LENSES = Object.freeze(['noise', 'opportunity', 'threat']);

/** Who may have produced an entity (common.schema.json $defs/producer). */
export const PRODUCERS = Object.freeze([
  'scout',
  'trend-analyst',
  'rival-reader',
  'interrogator',
  'verifier',
  'brief-editor',
  'architect',
  'persona-researcher',
  'project-author',
  'viewer',
]);

/** Whether the maturity level names have been confirmed against the report itself (D-1). */
export const MATURITY_STATUSES = Object.freeze(['unverified', 'verified']);

/** The five readiness categories, in the order the paper presents them (DM-8). Source order, not importance. */
export const READINESS_CATEGORY_KEYS = Object.freeze([
  'strategic-alignment',
  'resources',
  'knowledge',
  'culture',
  'data',
]);

/** The foresight practices that each receive a maturity level, in the order R2 names them (D-1, O-3). */
export const PRACTICE_KEYS = Object.freeze(['scanning', 'trend-analysis', 'scenario-work']);

/**
 * The core banned name tokens (invariant 1; M1-U2). A key containing any of them, after splitting
 * at camelCase boundaries and hyphens, is refused at any depth by findBannedKeys in validate.js.
 * The extended schema-only tokens of Red-team finding N3 are deliberately not here: they apply to
 * schema property names only and live in the M1-U2 test.
 */
export const BANNED_NAME_TOKENS = Object.freeze([
  'score', 'scores', 'scoring',
  'rank', 'ranks', 'ranked', 'ranking',
  'confidence',
  'priority', 'priorities', 'prioritise', 'prioritised', 'prioritize', 'prioritized',
  'weight', 'weighting',
  'likelihood', 'probability', 'importance', 'rating',
  'featured', 'highlight', 'recommended', 'recommendation',
  'top', 'best', 'winner',
]);

/**
 * Identifier patterns, equal to the `pattern` of each `*Id` definition in common.schema.json
 * (M1-U5). Every slug segment begins with a letter, so no identifier can be a sequence number.
 */
export const ID_PATTERNS = Object.freeze({
  signalId: /^sig-[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$/,
  trendId: /^trend-[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$/,
  readingId: /^reading-[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*-(noise|opportunity|threat)$/,
  interrogationId: /^interrogation-[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$/,
  conversationId: /^conversation-[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$/,
  questionId: /^q-[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$/,
  entryId: /^replay-[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$/,
  testId: /^(M([1-9]|10)-U[1-9][0-9]?|AUDIT-[1-6])$/,
});

/** The level-name placeholder shown until the level names are verified (CLAUDE.md, D-1). */
export const LEVEL_NAME_PLACEHOLDER = 'LEVEL_NAME_UNVERIFIED';

/**
 * The verified maturity level names, in the order the report presents them; their only home in
 * the code (docs/03-architecture.md, section 5.4). Empty until the Verifier has re-opened p. 9 of
 * the report and Miguel has set the status to verified (D-1). The order is the report's structure,
 * used only to check "lower" and "next"; it is never rendered as a scale.
 */
export const MATURITY_LEVEL_NAMES = Object.freeze([
  'AI for analysis augmentation',
  'AI as creative sparring partner',
  'AI integrated and customized into workflow',
]);
