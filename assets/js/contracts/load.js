// M1 Data contracts: the loader, the one gate every data module passes through
// (docs/03-architecture.md, section 6.1). No other page code imports from data/ or calls import().
//
// Each data module is loaded by dynamic import() from a fixed path, validated with validate.js,
// deep-frozen and memoised for the rest of the page load. A dynamic import fails alone, so one bad
// data file costs only the screen that needed it, which turns the typed failure into its own error
// state. Every loader function resolves to { ok: true, value } or { ok: false, reason, withheld }
// and never throws. The per-item loaders (signals for F2, log entries for F4) resolve to the valid
// items plus `withheld`, the number of items that failed their check.
//
// Reveal bundles hold the readings, which may exist in the page only after the viewer's intuition
// record (invariant 2, section 6.3). loadReveal builds a path only from an identifier that matches
// the trend identifier pattern and appears in the loaded trend list, and is called only by the
// trend screen after the record exists. The interactive F5 and its loader function are deferred
// (F5 static, decision of 5 Oct 2026) and are not written in this release.

import {
  checkFreezeManifest,
  checkSignal,
  checkBrief,
  checkReadiness,
  checkGovernance,
  checkLog,
  checkLogEntry,
  checkRevealBundle,
} from './validate.js';
import { ID_PATTERNS, MATURITY_LEVEL_NAMES } from './vocabulary.js';

/** Fixed module paths, relative to this file. */
const DATA = '../../../data/';
const PATHS = Object.freeze({
  freeze: `${DATA}freeze.js`,
  signals: `${DATA}signals.js`,
  trends: `${DATA}trends.js`,
  brief: `${DATA}brief.js`,
  readiness: `${DATA}readiness.js`,
  governance: `${DATA}governance.js`,
  log: `${DATA}log.js`,
});
const revealPath = (trendId) => `${DATA}reveal/${trendId}.js`;

/** The page's importer: a dynamic import relative to this module. Tests inject their own. */
const defaultImporter = (path) => import(path);

/** A deep copy, then frozen at every depth, so no screen can alter content it was given. */
function deepFrozenCopy(value) {
  const copy = JSON.parse(JSON.stringify(value));
  (function freeze(v) {
    if (v !== null && typeof v === 'object') {
      Object.freeze(v);
      for (const key of Object.keys(v)) freeze(v[key]);
    }
  })(copy);
  return copy;
}

const failure = (reason) => ({ ok: false, reason, withheld: 0 });

function summarise(errors) {
  const list = Array.isArray(errors) ? errors : [];
  const shown = list.slice(0, 5).join('; ');
  return list.length > 5 ? `${shown}; and ${list.length - 5} more` : shown;
}

/**
 * createLoader({ importer, levelNames }) returns the loader functions. `importer` maps a module
 * path to a promise of the module (default: dynamic import); `levelNames` is passed to
 * checkReadiness (default: MATURITY_LEVEL_NAMES).
 */
export function createLoader({ importer = defaultImporter, levelNames = MATURITY_LEVEL_NAMES } = {}) {
  const memo = new Map();

  /** Imports one module and resolves to its default export, or to a failure with the reason. */
  async function importDefault(path) {
    try {
      const mod = await importer(path);
      if (!mod || !Object.prototype.hasOwnProperty.call(mod, 'default')) return { failed: `${path} has no default export` };
      return { value: mod.default };
    } catch (error) {
      return { failed: `${path} could not be imported: ${error && error.message}` };
    }
  }

  /** Memoises one loader result per key for the rest of the page load; never rejects. */
  function once(key, body) {
    if (!memo.has(key)) {
      memo.set(
        key,
        Promise.resolve()
          .then(body)
          .catch((error) => failure(`${key} could not be loaded: ${error && error.message}`)),
      );
    }
    return memo.get(key);
  }

  /** A whole-module loader: the module passes its check or the screen shows its error state. */
  function whole(key, path, check) {
    return once(key, async () => {
      const got = await importDefault(path);
      if (got.failed) return failure(got.failed);
      const verdict = check(got.value);
      if (!verdict || verdict.ok !== true) return failure(`${path} failed validation: ${summarise(verdict && verdict.errors)}`);
      return { ok: true, value: deepFrozenCopy(got.value) };
    });
  }

  /** A per-item loader: the list must be an array; items that fail their check are withheld and counted. */
  function perItem(key, path, checkList, checkItem) {
    return once(key, async () => {
      const got = await importDefault(path);
      if (got.failed) return failure(got.failed);
      const list = checkList(got.value);
      if (!list || list.ok !== true) return failure(`${path} failed validation: ${summarise(list && list.errors)}`);
      const kept = got.value.filter((item) => {
        const verdict = checkItem(item);
        return verdict && verdict.ok === true;
      });
      return { ok: true, value: deepFrozenCopy(kept), withheld: got.value.length - kept.length };
    });
  }

  const isArray = (v) => (Array.isArray(v) ? { ok: true } : { ok: false, errors: ['/: expected an array'] });

  const loadFreeze = () => whole('freeze', PATHS.freeze, checkFreezeManifest);
  const loadSignals = () => perItem('signals', PATHS.signals, isArray, checkSignal);
  // The trend list is checked only as a list here: each trend record is checked by the screen with
  // checkTrend, so that one failing trend is withheld alone (F1-E2) rather than the whole list.
  const loadTrends = () => whole('trends', PATHS.trends, isArray);
  const loadBrief = () => whole('brief', PATHS.brief, checkBrief);
  const loadReadiness = () => whole('readiness', PATHS.readiness, (v) => checkReadiness(v, { levelNames }));
  const loadGovernance = () => whole('governance', PATHS.governance, checkGovernance);
  const loadLog = () => perItem('log', PATHS.log, checkLog, checkLogEntry);

  /**
   * The reveal bundle of one trend. Refuses, without importing anything, an identifier that does
   * not match the trend identifier pattern or does not appear in the loaded trend list.
   */
  async function loadReveal(trendId) {
    try {
      if (typeof trendId !== 'string' || !ID_PATTERNS.trendId.test(trendId)) {
        return failure(`${JSON.stringify(trendId)} is not a trend identifier`);
      }
      const trends = await loadTrends();
      if (!trends.ok) return failure(`the trend list is not available: ${trends.reason}`);
      const trend = trends.value.find((t) => t !== null && typeof t === 'object' && t.id === trendId);
      if (!trend) return failure(`${trendId} is not in the trend list`);
      return await once(`reveal:${trendId}`, async () => {
        const path = revealPath(trendId);
        const got = await importDefault(path);
        if (got.failed) return failure(got.failed);
        const verdict = checkRevealBundle(got.value, trend);
        if (!verdict || verdict.ok !== true) return failure(`${path} failed validation: ${summarise(verdict && verdict.errors)}`);
        return { ok: true, value: deepFrozenCopy(got.value) };
      });
    } catch (error) {
      return failure(`the reveal bundle could not be loaded: ${error && error.message}`);
    }
  }

  return Object.freeze({
    loadFreeze,
    loadSignals,
    loadTrends,
    loadBrief,
    loadReadiness,
    loadGovernance,
    loadLog,
    loadReveal,
  });
}
