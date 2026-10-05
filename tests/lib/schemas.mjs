// Test tooling for Periscope. Never imported by the page.
//
// Every contract in schemas/, loaded with ES import attributes (no fetch), keyed by file name.
// Adding a schema file means adding one import here; M1-U7 and M10-U9 fail if this list and
// schemas/ disagree (the listing part runs under Node).

import brief from '../../schemas/brief.schema.json' with { type: 'json' };
import common from '../../schemas/common.schema.json' with { type: 'json' };
import conversationQuestions from '../../schemas/conversation-questions.schema.json' with { type: 'json' };
import freezeManifest from '../../schemas/freeze-manifest.schema.json' with { type: 'json' };
import governance from '../../schemas/governance.schema.json' with { type: 'json' };
import interrogation from '../../schemas/interrogation.schema.json' with { type: 'json' };
import judgement from '../../schemas/judgement.schema.json' with { type: 'json' };
import logEntry from '../../schemas/log-entry.schema.json' with { type: 'json' };
import readinessProfile from '../../schemas/readiness-profile.schema.json' with { type: 'json' };
import reading from '../../schemas/reading.schema.json' with { type: 'json' };
import revealBundle from '../../schemas/reveal-bundle.schema.json' with { type: 'json' };
import scenarioRecord from '../../schemas/scenario-record.schema.json' with { type: 'json' };
import signal from '../../schemas/signal.schema.json' with { type: 'json' };
import trend from '../../schemas/trend.schema.json' with { type: 'json' };

import { createValidator } from './mini-schema.mjs';

export const SCHEMAS = Object.freeze({
  'brief.schema.json': brief,
  'common.schema.json': common,
  'conversation-questions.schema.json': conversationQuestions,
  'freeze-manifest.schema.json': freezeManifest,
  'governance.schema.json': governance,
  'interrogation.schema.json': interrogation,
  'judgement.schema.json': judgement,
  'log-entry.schema.json': logEntry,
  'readiness-profile.schema.json': readinessProfile,
  'reading.schema.json': reading,
  'reveal-bundle.schema.json': revealBundle,
  'scenario-record.schema.json': scenarioRecord,
  'signal.schema.json': signal,
  'trend.schema.json': trend,
});

export const SCHEMA_FILES = Object.freeze(Object.keys(SCHEMAS));

let shared = null;
/** One validator over every schema, created on first use (so a keyword error surfaces in a test). */
export function contractValidator() {
  if (!shared) shared = createValidator(SCHEMAS);
  return shared;
}

/** Which schema validates which content module, by data/ path. */
export function schemaForModule(dataPath) {
  if (dataPath === 'data/freeze.js') return { schema: 'freeze-manifest.schema.json', each: false };
  if (dataPath === 'data/signals.js') return { schema: 'signal.schema.json', each: true };
  if (dataPath === 'data/trends.js') return { schema: 'trend.schema.json', each: true };
  if (dataPath === 'data/log.js') return { schema: 'log-entry.schema.json', each: true };
  if (dataPath === 'data/brief.js') return { schema: 'brief.schema.json', each: false };
  if (dataPath === 'data/readiness.js') return { schema: 'readiness-profile.schema.json', each: false };
  if (dataPath === 'data/governance.js') return { schema: 'governance.schema.json', each: false };
  if (dataPath.startsWith('data/reveal/')) return { schema: 'reveal-bundle.schema.json', each: false };
  if (dataPath.startsWith('data/conversation/')) return { schema: 'conversation-questions.schema.json', each: false };
  return null;
}
