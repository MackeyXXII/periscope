// Test tooling for Periscope. Never imported by the page.
//
// Helpers shared by the contract tests (M1) and the later content tests (M4-U3 and others):
// the banned-name tokens of M1-U2, name tokenising, and walkers over schemas and JSON values.

import { walkSchema } from './mini-schema.mjs';

/**
 * The banned name tokens, exactly as listed in M1-U2 (docs/04-module-design.md). This list is the
 * test's own; vocabulary.js has a BANNED_NAME_TOKENS used by validate.js at runtime.
 */
export const BANNED_TOKENS = Object.freeze([
  'score', 'scores', 'scoring', 'rank', 'ranks', 'ranked', 'ranking', 'confidence', 'priority',
  'priorities', 'prioritise', 'prioritised', 'prioritize', 'prioritized', 'weight', 'weighting',
  'likelihood', 'probability', 'importance', 'rating', 'featured', 'highlight', 'recommended',
  'recommendation', 'top', 'best', 'winner',
]);

/**
 * Splits a property name into lower-case tokens at camelCase boundaries and hyphens (as M1-U2
 * specifies), and also at underscores, dots and spaces, which only makes the check stricter:
 * 'topScore' -> ['top', 'score']; 'is-featured' -> ['is', 'featured']; 'RANK_2' -> ['rank', '2'].
 */
export function nameTokens(name) {
  return String(name)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((t) => t.toLowerCase());
}

/** The banned tokens a name contains, or an empty array. */
export function bannedTokensIn(name) {
  return nameTokens(name).filter((t) => BANNED_TOKENS.includes(t));
}

/** Every subschema of a schema, as [{ node, at }]. */
export function subschemas(schema, where = '#') {
  const out = [];
  walkSchema(schema, where, (node, at) => out.push({ node, at }));
  return out;
}

/** Every key of every object anywhere in a JSON value, as [{ key, path }]. */
export function allKeys(value, path = '') {
  const out = [];
  (function visit(v, p) {
    if (Array.isArray(v)) v.forEach((item, i) => visit(item, `${p}/${i}`));
    else if (v !== null && typeof v === 'object') {
      for (const [k, child] of Object.entries(v)) {
        out.push({ key: k, path: `${p}/${k}` });
        visit(child, `${p}/${k}`);
      }
    }
  })(value, path);
  return out;
}

/** JSON-pointer-like paths (arrays of keys) of every object anywhere in a value, root included. */
export function objectPaths(value) {
  const out = [];
  (function visit(v, p) {
    if (Array.isArray(v)) v.forEach((item, i) => visit(item, [...p, i]));
    else if (v !== null && typeof v === 'object') {
      out.push(p);
      for (const [k, child] of Object.entries(v)) visit(child, [...p, k]);
    }
  })(value, []);
  return out;
}

/** Paths of every property named `name` anywhere in a value. */
export function pathsOfKey(value, name) {
  return objectPaths(value)
    .filter((p) => Object.prototype.hasOwnProperty.call(getAt(value, p), name))
    .map((p) => [...p, name]);
}

export function getAt(value, path) {
  return path.reduce((v, k) => v[k], value);
}

export function setAt(value, path, newValue) {
  getAt(value, path.slice(0, -1))[path[path.length - 1]] = newValue;
}

export function deleteAt(value, path) {
  const parent = getAt(value, path.slice(0, -1));
  const key = path[path.length - 1];
  if (Array.isArray(parent)) parent.splice(key, 1);
  else delete parent[key];
}

export function showPath(path) {
  return `/${path.join('/')}`;
}
