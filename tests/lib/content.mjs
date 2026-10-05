// Test tooling for Periscope. Never imported by the page.
//
// The content source (docs/04-module-design.md, "Content source"). Content tests ask this module
// for content instead of importing data/ or fixtures themselves, so that one switch decides what
// they assert on.
//
//   loadContent({ from })   from: 'fixtures' | 'data' | undefined.
//                           undefined means: 'data' if CONTENT_FROZEN (tests/lib/stage.mjs) is
//                           true, otherwise 'fixtures'.
//
// Convention used by the M1 tests, and recommended for every "T, G3" test: register the fixture
// part with { from: 'fixtures' } (it keeps running after G3, so the fixtures stay valid) and the
// data part as a separate test with `needs: ['data']` and { from: 'data' }, so that before G3 it is
// reported as skipped with "needs data/ (G3)" and after G3 a missing data/ fails.
//
// Resolves to:
//   {
//     from,                    'fixtures' or 'data'
//     freeze,                  the freeze manifest (data/freeze.js)
//     signals, trends, brief, readiness, governance, log,
//     reveal,                  { [trendId]: reveal bundle }, from data/reveal/<trendId>.js
//     conversation,            { [trendId]: conversation questions }, possibly empty
//     modules,                 Map from data/ path (as listed in the manifest) to its default export
//     readinessVerified,       fixtures only: the synthetic verified profile; null for data
//   }
// Values are the modules' own objects: tests must not mutate them (use clone()).

import { CONTENT_FROZEN } from './stage.mjs';
import { repoUrl, repoPath } from './env.mjs';

const FIXTURE_DIR = 'tests/fixtures/content/';

/** Where a data/ path lives among the synthetic fixtures. */
export function fixturePathFor(dataPath) {
  if (!dataPath.startsWith('data/')) throw new Error(`not a data/ path: ${dataPath}`);
  const rest = dataPath.slice('data/'.length);
  if (rest === 'readiness.js') return `${FIXTURE_DIR}readiness-unverified.js`;
  return FIXTURE_DIR + rest;
}

export async function loadContent({ from } = {}) {
  const source = from || (CONTENT_FROZEN ? 'data' : 'fixtures');
  if (source !== 'fixtures' && source !== 'data') throw new Error(`unknown content source: ${source}`);
  const pathFor = source === 'data' ? (p) => p : fixturePathFor;

  const freezeUrl = repoUrl(pathFor('data/freeze.js'));
  let freeze;
  try {
    freeze = (await import(freezeUrl.href)).default;
  } catch (error) {
    const why =
      source === 'data'
        ? 'data/freeze.js could not be imported although CONTENT_FROZEN is true (G3 freeze incomplete?)'
        : `the synthetic manifest ${repoPath(freezeUrl)} could not be imported`;
    throw new Error(`${why}: ${error && error.message}`);
  }
  if (!freeze || !Array.isArray(freeze.modules)) {
    throw new Error(`${repoPath(freezeUrl)} has no modules list`);
  }

  const modules = new Map();
  for (const dataPath of freeze.modules) {
    const url = repoUrl(pathFor(dataPath));
    try {
      modules.set(dataPath, dataPath === 'data/freeze.js' ? freeze : (await import(url.href)).default);
    } catch (error) {
      throw new Error(`module listed in the manifest could not be imported: ${repoPath(url)} (${error && error.message})`);
    }
  }

  const reveal = {};
  const conversation = {};
  for (const [dataPath, value] of modules) {
    const m = /^data\/(reveal|conversation)\/(.+)\.js$/.exec(dataPath);
    if (m && m[1] === 'reveal') reveal[m[2]] = value;
    if (m && m[1] === 'conversation') conversation[m[2]] = value;
  }

  let readinessVerified = null;
  if (source === 'fixtures') {
    readinessVerified = (await import(repoUrl(`${FIXTURE_DIR}readiness-verified.js`).href)).default;
  }

  return {
    from: source,
    freeze,
    signals: modules.get('data/signals.js'),
    trends: modules.get('data/trends.js'),
    brief: modules.get('data/brief.js'),
    readiness: modules.get('data/readiness.js'),
    governance: modules.get('data/governance.js'),
    log: modules.get('data/log.js'),
    reveal,
    conversation,
    modules,
    readinessVerified,
  };
}

/** The synthetic session records (tests/fixtures/session/). */
export async function loadSession() {
  const judgement = (await import(repoUrl('tests/fixtures/session/judgement.js').href)).default;
  const scenarioRecord = (await import(repoUrl('tests/fixtures/session/scenario-record.js').href)).default;
  return { judgement, scenarioRecord };
}

/** A deep copy of a JSON value, for mutation in memory. */
export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
