// Test tooling for Periscope. Never imported by the page.
//
// The environment shim: the only place where a test learns whether it runs under `node --test` or
// in the browser runner tests/run.html, and the only place that touches Node built-ins.
//
// The rule that shapes this file: no fetch() and no XMLHttpRequest anywhere in the repository,
// tests included, unless Miguel approves DM-11 (docs/03-architecture.md, section 15). So:
//
// - JSON is loaded with ES import attributes (`with { type: 'json' }`), which works in current Node
//   and Chromium without any request of the test's own making: see importJson() and
//   tests/lib/schemas.mjs.
// - JavaScript modules (fixtures, data/, code under test) are loaded with import().
// - Raw file text (static audits, byte-for-byte comparisons) is read with node:fs only. In the
//   browser, readText() throws a Skip whose reason names "Node or DM-11", so such a test is
//   reported as skipped and never passes silently.
// - Directory listings and child processes are Node only; in the browser they skip.
//
// Test files import from here; they never import node:* themselves, and never touch document,
// window or process at top level.

import { Skip, REASONS } from './skip.mjs';

export const IS_NODE =
  typeof process !== 'undefined' && !!(process.versions && process.versions.node);
export const IS_BROWSER = !IS_NODE && typeof window !== 'undefined' && typeof document !== 'undefined';

/** The repository root as a URL (file: under Node, http(s): in the browser runner). */
export const REPO_ROOT = new URL('../../', import.meta.url);

/** A URL for a repository-relative path such as 'schemas/trend.schema.json'. */
export function repoUrl(relativePath) {
  return new URL(relativePath, REPO_ROOT);
}

/** The repository-relative path of a URL inside the repository, for messages. */
export function repoPath(url) {
  const href = String(url instanceof URL ? url.href : url);
  return href.startsWith(REPO_ROOT.href) ? decodeURIComponent(href.slice(REPO_ROOT.href.length)) : href;
}

/** Imports a Node built-in such as 'node:fs/promises'. Skips in the browser. */
export async function nodeBuiltin(name, reason = REASONS.fs) {
  if (!IS_NODE) throw new Skip(reason);
  return import(name);
}

/** Reads a file as UTF-8 text. Node only; in the browser it skips with the DM-11 reason. */
export async function readText(url) {
  const fs = await nodeBuiltin('node:fs/promises', REASONS.text);
  return fs.readFile(toUrl(url), 'utf8');
}

/** Whether a file or directory exists. Node only. */
export async function exists(url) {
  const fs = await nodeBuiltin('node:fs/promises');
  try {
    await fs.stat(toUrl(url));
    return true;
  } catch {
    return false;
  }
}

/**
 * Lists the files under a directory URL, recursively, as paths relative to that directory, with
 * forward slashes, sorted. Node only. Dotfiles are included; callers decide what to ignore and say
 * why.
 */
export async function listFiles(dirUrl) {
  const fs = await nodeBuiltin('node:fs/promises');
  const root = toUrl(dirUrl);
  const base = root.href.endsWith('/') ? root : new URL(root.href + '/');
  const out = [];
  async function walk(url, prefix) {
    const entries = await fs.readdir(url, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) await walk(new URL(`${encodeURIComponent(e.name)}/`, url), `${prefix}${e.name}/`);
      else out.push(`${prefix}${e.name}`);
    }
  }
  await walk(base, '');
  return out.sort();
}

/** Loads a JSON file through an import attribute (no fetch). Works in Node and in the browser. */
export async function importJson(url) {
  const mod = await import(toUrl(url).href, { with: { type: 'json' } });
  return mod.default;
}

/**
 * Imports a module that is under test or produced by the pipeline (assets/js/…, pipeline/…,
 * data/…). If it does not exist yet, the test fails with a message that names the file and says
 * why: at G2 no page or pipeline code exists, and that failure is the test-first rule working.
 */
export async function importUnderTest(url) {
  const u = toUrl(url);
  try {
    return await import(u.href);
  } catch (error) {
    const err = new Error(
      `module under test could not be imported: ${repoPath(u)} (${error && error.message}). ` +
        'Before the module is implemented this failure is expected (test-first rule).',
    );
    err.cause = error;
    throw err;
  }
}

function toUrl(url) {
  if (url instanceof URL) return url;
  return new URL(String(url), REPO_ROOT);
}
