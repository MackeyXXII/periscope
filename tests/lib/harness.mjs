// Test tooling for Periscope. Never imported by the page.
//
// The harness: "write once, run in both" (docs/04-module-design.md, "How a test file is written so
// that it runs in both"). Every test file registers its tests through `test()` from here and
// nothing else, and then runs unchanged
//
//   - under `node --test` from the repository root (Node 22 or later), where each test is handed
//     to node:test, and
//   - in the browser runner tests/run.html, served from a static origin, where tests are collected
//     in a registry and executed in sequence, each with a fresh scratch root and a time limit.
//
// A test file looks like this:
//
//   import { test } from '../lib/harness.mjs';
//   import { assert } from '../lib/assert.mjs';
//   import { importUnderTest, repoUrl } from '../lib/env.mjs';
//
//   test('M1-U15 constants.js holds the DM-9 values', async () => {
//     const c = await importUnderTest(repoUrl('assets/js/contracts/constants.js'));
//     assert.equal(c.BRIEF_SIGNAL_CAP, 5);
//   });
//
//   test('M1-U16 every data entity has a pass verdict', { needs: ['data'] }, async () => { … });
//
// Names. A test's name begins with its identifier from docs/04-module-design.md (M<n>-U<k>), or
// AUDIT-<n> for an invariant audit, INT-<name> for an integration test or SYS-<name> for a system
// test, followed by a space and a sentence. The harness throws at registration otherwise, so an
// untraceable test cannot exist.
//
// Needs. `needs` lists conditions the test cannot run without. An unmet need turns the test into a
// skip with a named reason; it never passes:
//   dom        a real DOM (browser runner only)
//   fs         Node: directory listings, child processes
//   data       CONTENT_FROZEN in tests/lib/stage.mjs, i.e. data/ exists from G3
//   verified   the frozen readiness profile in data/ has maturity.status "verified" (D-1)
//   deferred   never met in this release: the test belongs to the interactive F5, which is designed
//              but not built (F5 static, decision of 5 Oct 2026). Replaces the retired `questions`.
// A test may also skip from inside its body with `skip(reason)`; readText() does so in the browser.
//
// Context. The test function receives `{ root }`: a fresh, empty element in the browser runner
// (removed afterwards), null under Node.

import { Skip, REASONS, skip } from './skip.mjs';
import { IS_NODE, importUnderTest, repoUrl } from './env.mjs';
import { CONTENT_FROZEN } from './stage.mjs';

export { Skip, skip, REASONS };

export const NAME_PATTERN = /^(M([1-9]|10)-U[1-9][0-9]?|AUDIT-[1-6]|INT-[A-Za-z0-9-]+|SYS-[A-Za-z0-9-]+) \S/;
export const KNOWN_NEEDS = Object.freeze(['dom', 'fs', 'data', 'verified', 'deferred']);
export const DEFAULT_TIMEOUT_MS = 5000;

const nodeTest = IS_NODE ? (await import('node:test')).test : null;
const registry = [];

/**
 * Registers a test. `test(name, fn)` or `test(name, { needs, timeout }, fn)`.
 * `fn` may be async and receives `{ root }`.
 */
export function test(name, optionsOrFn, maybeFn) {
  const options = typeof optionsOrFn === 'function' ? {} : optionsOrFn || {};
  const fn = typeof optionsOrFn === 'function' ? optionsOrFn : maybeFn;
  if (typeof name !== 'string' || !NAME_PATTERN.test(name)) {
    throw new Error(`test name must begin with its identifier (for example "M1-U3 …"): ${JSON.stringify(name)}`);
  }
  if (typeof fn !== 'function') throw new Error(`test ${name} has no function`);
  const needs = options.needs || [];
  for (const need of needs) {
    if (!KNOWN_NEEDS.includes(need)) throw new Error(`test ${name} declares an unknown need: ${need}`);
  }
  const entry = { name, needs, timeout: options.timeout || DEFAULT_TIMEOUT_MS, fn };

  if (IS_NODE) {
    nodeTest(name, { timeout: entry.timeout }, async (t) => {
      const reason = await unmetNeed(needs);
      if (reason) {
        t.skip(reason);
        return;
      }
      try {
        await fn({ root: null });
      } catch (error) {
        if (error instanceof Skip) {
          t.skip(error.reason);
          return;
        }
        throw error;
      }
    });
  } else {
    registry.push(entry);
  }
}

/** Returns the reason the first unmet need is unmet, or null if every need is met. */
export async function unmetNeed(needs) {
  for (const need of needs) {
    if (need === 'dom' && (IS_NODE || typeof document === 'undefined')) return REASONS.dom;
    if (need === 'fs' && !IS_NODE) return REASONS.fs;
    if (need === 'data' && !CONTENT_FROZEN) return REASONS.data;
    if (need === 'verified') {
      if (!CONTENT_FROZEN) return `${REASONS.data}; ${REASONS.verified}`;
      const readiness = await importUnderTest(repoUrl('data/readiness.js'));
      if (!readiness.default || !readiness.default.maturity || readiness.default.maturity.status !== 'verified') {
        return REASONS.verified;
      }
    }
    if (need === 'deferred') return REASONS.deferred;
  }
  return null;
}

/** The tests registered so far in the browser (empty under Node, where node:test holds them). */
export function registeredTests() {
  return registry.slice();
}

/**
 * Browser only: runs every registered test whose name starts with `filter` (if given), in
 * registration order, one at a time. Calls `onResult({ name, id, status, reason, ms })` after each,
 * with status 'pass', 'fail' or 'skip'. Resolves to the list of results.
 */
export async function runRegistered({ filter = '', scratchHost = null, onResult = () => {} } = {}) {
  const results = [];
  for (const entry of registry) {
    if (filter && !entry.name.startsWith(filter)) continue;
    const id = entry.name.split(' ')[0];
    const started = Date.now();
    let status = 'pass';
    let reason = '';
    let root = null;
    try {
      const unmet = await unmetNeed(entry.needs);
      if (unmet) throw new Skip(unmet);
      if (scratchHost && typeof document !== 'undefined') {
        root = document.createElement('div');
        root.dataset.testScratch = id;
        scratchHost.appendChild(root);
      }
      await withTimeout(Promise.resolve().then(() => entry.fn({ root })), entry.timeout, entry.name);
    } catch (error) {
      if (error instanceof Skip) {
        status = 'skip';
        reason = error.reason;
      } else {
        status = 'fail';
        reason = error && error.stack ? `${error.message}` : String(error);
      }
    } finally {
      if (root) root.remove();
    }
    const result = { name: entry.name, id, status, reason, ms: Date.now() - started };
    results.push(result);
    onResult(result);
  }
  return results;
}

function withTimeout(promise, ms, name) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms} ms: ${name}`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
