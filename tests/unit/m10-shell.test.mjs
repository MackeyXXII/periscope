// M10 UI shell and navigation: unit tests M10-U1, M10-U2, M10-U3 (static part), M10-U4 and M10-U9.
// The start-up part of M10-U3 and M10-U5 to M10-U8 need a real DOM and are in m10-shell.browser.mjs.
// Written from docs/04-module-design.md (M10) before the shell is implemented (test-first rule).
//
// The static audits read raw file text through readText(), so in the browser runner they are
// skipped with "needs Node"; their self-checks (the scanner and the patterns recognise
// what they must) run in both runners. Comments are removed before matching by the scanner in
// tests/lib/strip-comments.mjs, as the module design specifies.
//
// Status at G2: M10-U1 and M10-U2 pass on the seeded placeholder files under Node (their comments
// mention fetch() and data/, which the comment rule ignores); M10-U3 fails because the placeholder
// index.html has no element #startup-failure; M10-U4 fails because assets/js/shell/router.js,
// routes.js and nav.js do not exist yet. M10-U9 passes.

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { IS_NODE, importUnderTest, readText, listFiles, exists, repoUrl } from '../lib/env.mjs';
import { SHIPPED_FILES, SCHEMA_FILES, FILES } from '../lib/files.mjs';
import {
  codeOf, kindOf, stripJsComments, stripCssComments, stripHtmlComments, blankStrings, inlineScripts,
} from '../lib/strip-comments.mjs';
import { TEST_FILES } from './index.mjs';

const STARTUP_FAILURE_TEXT =
  'The demo could not load. It makes no network requests. If you opened this file directly from your disk, some browsers block it; please use the hosted version.';

// ------------------------------------------------------------------------------------------ files

/** index.html and every file under assets/: the real listing under Node, the inventory otherwise. */
async function shippedFiles() {
  if (IS_NODE) {
    const assets = (await listFiles(repoUrl('assets/'))).map((f) => `assets/${f}`);
    return ['index.html', ...assets];
  }
  return [...SHIPPED_FILES];
}

/** Every file in data/: the manifest's list, and under Node also the directory listing. */
async function dataFiles() {
  const manifest = (await importUnderTest(repoUrl('data/freeze.js'))).default;
  const files = new Set(manifest.modules);
  if (IS_NODE) {
    for (const f of await listFiles(repoUrl('data/'))) {
      if (!f.split('/').some((s) => s.startsWith('.'))) files.add(`data/${f}`);
    }
  }
  return [...files].sort();
}

function snippet(code, index) {
  const line = code.slice(0, index).split('\n').length;
  const text = code.slice(Math.max(0, index - 20), index + 40).replace(/\s+/g, ' ').trim();
  return `line ~${line}: …${text}…`;
}

/** Every match of every pattern in the code of every file, as problem strings. */
async function audit(files, patterns) {
  const problems = [];
  for (const file of files) {
    const code = codeOf(file, await readText(repoUrl(file)));
    problems.push(...auditText(file, code, patterns));
  }
  return problems;
}

function auditText(file, code, patterns) {
  const problems = [];
  for (const [what, re] of patterns) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
    for (const m of code.matchAll(g)) problems.push(`${file}: ${what} (${snippet(code, m.index)})`);
  }
  return problems;
}

// ------------------------------------------------------------------------------------------ M10-U1
// Scope: the shipped files, index.html, assets/ and data/. tests/ and pipeline/ are not shipped
// files and are out of scope here; they contain no fetch() either (DM-11 recorded as not needed,
// 5 Oct 2026).

const REMOTE = String.raw`(?:https?:|\/\/)`;
const Q = String.raw`["'\x60]`;

/** M10-U1, as [what, pattern]. Relative references and <a href> to any address are allowed. */
export const NETWORK_PATTERNS = Object.freeze([
  ['fetch(', /\bfetch\s*\(/],
  ['XMLHttpRequest', /XMLHttpRequest/],
  ['WebSocket', /WebSocket/],
  ['EventSource', /EventSource/],
  ['sendBeacon', /sendBeacon/],
  ['<iframe>', /<iframe\b/i],
  ['remote import specifier', new RegExp(String.raw`\b(?:import|export)\b[^;'"\x60]*?\bfrom\s*${Q}\s*${REMOTE}`)],
  ['remote bare import', new RegExp(String.raw`\bimport\s*${Q}\s*${REMOTE}`)],
  ['remote import()', new RegExp(String.raw`\bimport\s*\(\s*${Q}\s*${REMOTE}`)],
  ['remote <script src>, <img src> or other src', new RegExp(String.raw`\bsrc\s*=\s*${Q}?\s*${REMOTE}`, 'i')],
  ['remote <link href>', new RegExp(String.raw`<link\b[^>]*\bhref\s*=\s*${Q}?\s*${REMOTE}`, 'i')],
  ['remote srcset', new RegExp(String.raw`\bsrcset\s*=\s*${Q}[^"'\x60]*${REMOTE}`, 'i')],
  ['remote CSS @import', new RegExp(String.raw`@import\s+(?:url\(\s*)?${Q}?\s*${REMOTE}`, 'i')],
  ['remote url()', new RegExp(String.raw`\burl\(\s*${Q}?\s*${REMOTE}`, 'i')],
]);

test('M10-U1 the network audit recognises every forbidden construct and ignores comments only', () => {
  const mustMatch = [
    ['a.js', 'const r = await fetch("x.json");'],
    ['a.js', 'window.fetch ("x")'],
    ['a.js', 'new XMLHttpRequest()'],
    ['a.js', 'new WebSocket(u)'],
    ['a.js', 'new EventSource(u)'],
    ['a.js', 'navigator.sendBeacon(u, b)'],
    ['a.html', '<IFRAME src="x.html"></IFRAME>'],
    ['a.js', "import { x } from 'https://cdn.example.org/x.js';"],
    ['a.js', 'import x from "//cdn.example.org/x.js";'],
    ['a.js', "import 'http://cdn.example.org/side.js';"],
    ['a.js', 'export * from "https://cdn.example.org/x.js";'],
    ['a.js', 'const m = import(\x60https://cdn.example.org/x.js\x60);'],
    ['a.html', '<script src="https://cdn.example.org/lib.js"></script>'],
    ['a.html', '<link rel="stylesheet" href="https://fonts.example.org/css">'],
    ['a.html', '<img src="//images.example.org/a.png" alt="">'],
    ['a.html', '<img srcset="a.png 1x, https://images.example.org/b.png 2x" alt="">'],
    ['a.js', "img.src = 'https://images.example.org/a.png';"],
    ['a.css', '@import url("https://fonts.example.org/x.css");'],
    ['a.css', "@import 'https://fonts.example.org/x.css';"],
    ['a.css', 'body { background: url(https://images.example.org/a.png); }'],
    ['a.css', "@font-face { font-family: X; src: url('//fonts.example.org/x.woff2'); }"],
    ['a.js', 'const s = "https://x"; fetch(s);'],
    ['a.js', '/* unterminated comment fetch("x")'],
    ['a.html', '<!-- unterminated comment <script src="https://x/y.js">'],
  ];
  const mustNotMatch = [
    ['a.js', '// no fetch() or XHR at runtime'],
    ['a.js', '/* new XMLHttpRequest() */ const a = 1;'],
    ['a.js', "import { x } from './x.js';"],
    ['a.js', 'const doi = "https://doi.org/10.1787/aa573076-en";'],
    ['a.html', '<a href="https://example.org/source">source</a>'],
    ['a.html', '<!-- no fetch() or XHR at runtime --><p>text</p>'],
    ['a.html', '<link rel="stylesheet" href="assets/css/main.css">'],
    ['a.css', '/* fonts from https://fonts.example.org are not used */ body { font-family: system-ui; }'],
    ['a.css', 'body { background: url(images/a.png); }'],
  ];
  const problems = [];
  for (const [file, text] of mustMatch) {
    if (auditText(file, codeOf(file, text), NETWORK_PATTERNS).length === 0) problems.push(`not detected in ${file}: ${text}`);
  }
  for (const [file, text] of mustNotMatch) {
    const hits = auditText(file, codeOf(file, text), NETWORK_PATTERNS);
    if (hits.length) problems.push(`false match in ${file}: ${text} (${hits.join('; ')})`);
  }
  // The scanner keeps string literals and drops only comments.
  if (stripJsComments('const u = "https://x"; // c') !== 'const u = "https://x"; ') problems.push('scanner damaged a string literal');
  if (!stripCssComments('a { b: c } /* x').includes('/* x')) problems.push('scanner dropped an unterminated CSS comment');
  if (stripHtmlComments('a<!-- b -->c') !== 'a c') problems.push('scanner did not remove an HTML comment');
  assert.none(problems, 'audit self-check failures');
});

test('M10-U1 index.html and assets/ make no network request and reference no remote resource', async () => {
  const files = await shippedFiles();
  assert.ok(files.includes('index.html') && files.some((f) => f.startsWith('assets/js/')), 'the file set covers index.html and assets/js/');
  assert.none(await audit(files, NETWORK_PATTERNS), 'network references in shipped files');
});

test('M10-U1 data/ makes no network request and references no remote resource', { needs: ['data'] }, async () => {
  assert.none(await audit(await dataFiles(), NETWORK_PATTERNS), 'network references in data/');
});

// ------------------------------------------------------------------------------------------ M10-U2

// M10-U2 as revised on 5 October 2026: code only, not content prose. In JavaScript (including the
// inline scripts of index.html), comments are removed and the contents of every string literal
// blanked; then no identifier use of the eight names, as a whole word, bare or after ".". Before
// blanking (comments removed), no bracket access with a string literal naming any of them, such
// as window['caches'] or document["cookie"].
const STORAGE_NAMES = ['localStorage', 'sessionStorage', 'indexedDB', 'caches', 'serviceWorker', 'cookieStore'];

/** Identifier uses, matched on code with comments removed and strings blanked. */
export const STORAGE_PATTERNS = Object.freeze([
  ...STORAGE_NAMES.map((name) => [name, new RegExp(String.raw`(?<![\w$])${name}(?![\w$])`)]),
  ['document.cookie', /(?<![\w$])document\s*\.\s*cookie(?![\w$])/],
  ['navigator.storage', /(?<![\w$])navigator\s*\.\s*storage(?![\w$])/],
]);

/** Bracket access by a string literal, matched on code with comments removed but strings intact. */
export const STORAGE_BRACKET_PATTERNS = Object.freeze([
  [
    'bracket access by string to a storage name',
    new RegExp(String.raw`[\w$)\]]\s*\[\s*(["'\x60])(?:${STORAGE_NAMES.join('|')})\1\s*\]`),
  ],
  ['bracket access document["cookie"]', /(?<![\w$])document\s*\[\s*(["'`])cookie\1\s*\]/],
  ['bracket access navigator["storage"]', /(?<![\w$])navigator\s*\[\s*(["'`])storage\1\s*\]/],
]);

/** The JavaScript code units of a file, comments removed: the file itself, or index.html's inline scripts. */
function scriptUnits(file, text) {
  if (kindOf(file) === 'js') return [codeOf(file, text)];
  if (kindOf(file) === 'html') return inlineScripts(text).map((s) => stripJsComments(s));
  return [];
}

/** Every M10-U2 problem in one file's text. */
export function storageProblems(file, text) {
  const problems = [];
  scriptUnits(file, text).forEach((code, k) => {
    const where = kindOf(file) === 'html' ? `${file} inline script ${k + 1}` : file;
    problems.push(...auditText(where, code, STORAGE_BRACKET_PATTERNS));
    problems.push(...auditText(where, blankStrings(code), STORAGE_PATTERNS));
  });
  return problems;
}

async function storageAudit(files) {
  const problems = [];
  for (const file of files) problems.push(...storageProblems(file, await readText(repoUrl(file))));
  return problems;
}

test('M10-U2 the storage audit recognises identifier and bracket uses and ignores comments and prose in strings', () => {
  const mustMatch = [
    ['a.js', 'localStorage.setItem("a", "b")'],
    ['a.js', 'window.sessionStorage'],
    ['a.js', 'indexedDB.open("x")'],
    ['a.js', 'document.cookie = "a=b"'],
    ['a.js', 'document . cookie'],
    ['a.js', 'caches.open("v1")'],
    ['a.js', 'navigator.serviceWorker.register("sw.js")'],
    ['a.js', 'navigator.storage.persist()'],
    ['a.js', 'await cookieStore.get("a")'],
    ['a.js', 'window.cookieStore'],
    ["a.js", "window['caches'].open('v1')"],
    ['a.js', 'globalThis["localStorage"]'],
    ['a.js', 'self[`indexedDB`]'],
    ['a.js', "document['cookie'] = 'a=b'"],
    ['a.js', 'navigator["storage"].persist()'],
    ['a.js', 'const t = `${localStorage.length}`;'],
    ['a.js', '/* unterminated comment localStorage'],
    ['index.html', '<p>x</p><script type="module">window.localStorage.clear();</script>'],
    ['index.html', "<script>window['sessionStorage']</script>"],
  ];
  const mustNotMatch = [
    ['a.js', '// nothing is stored in localStorage'],
    ['a.js', '/* document.cookie is never set */ let a;'],
    ['a.js', 'const summary = "Vendors add caches and localStorage-like tiers to the collector.";'],
    ['a.js', "const s = 'document.cookie and navigator.storage are prose here';"],
    ['a.js', 'export default { "tags": ["caches"], "summary": "cookieStore" };'],
    ['a.js', 'const myCaches = 1; const cachesize = 2;'],
    ['index.html', '<!-- <script>localStorage.clear()</script> --><p>localStorage is prose in HTML</p>'],
    ['index.html', '<script type="module" src="assets/js/main.js"></script>'],
    ['a.css', '.caches { color: red; }'],
  ];
  const problems = [];
  for (const [file, text] of mustMatch) if (storageProblems(file, text).length === 0) problems.push(`not detected in ${file}: ${text}`);
  for (const [file, text] of mustNotMatch) {
    const hits = storageProblems(file, text);
    if (hits.length) problems.push(`false match in ${file}: ${text} (${hits.join('; ')})`);
  }
  // The blanking step keeps quotes, line breaks and template substitutions.
  if (blankStrings('a("xy")\n`p${q}r`') !== 'a("  ")\n` ${q} `') problems.push(`blankStrings output ${JSON.stringify(blankStrings('a("xy")\n`p${q}r`'))}`);
  assert.none(problems, 'audit self-check failures');
});

test('M10-U2 index.html and assets/ use no browser storage', async () => {
  assert.none(await storageAudit(await shippedFiles()), 'storage references in shipped files');
});

test('M10-U2 data/ uses no browser storage', { needs: ['data'] }, async () => {
  assert.none(await storageAudit(await dataFiles()), 'storage references in data/');
});

// ------------------------------------------------------------------------------------------ M10-U3

function textContentOfMarkup(markup) {
  return markup.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** The problems with index.html's static start-up elements; `css` is assets/css/main.css. */
export function startupMarkupProblems(html, css) {
  const problems = [];
  const code = stripHtmlComments(html);
  if (!/<html\b[^>]*\blang\s*=\s*["']?en["'\s>]/i.test(code)) problems.push('no <html lang="en">');
  if (!/<meta\b[^>]*\bname\s*=\s*["']?viewport\b/i.test(code)) problems.push('no viewport meta element');
  const opening = /<([a-z][a-z0-9]*)\b([^>]*\bid\s*=\s*["']?startup-failure["'\s>][^>]*)>/i.exec(code);
  if (!opening) {
    problems.push('no element with id="startup-failure"');
  } else {
    const [whole, tag, attrs] = opening;
    if (/(^|\s)hidden(\s|=|$|\/)/i.test(attrs)) problems.push('#startup-failure has the hidden attribute');
    if (/\bstyle\s*=\s*["'][^"']*(display\s*:\s*none|visibility\s*:\s*hidden)/i.test(attrs)) problems.push('#startup-failure is hidden by an inline style');
    const rest = code.slice(opening.index + whole.length);
    const close = new RegExp(`</${tag}\\s*>`, 'i').exec(rest);
    if (!close) problems.push(`#startup-failure: no closing </${tag}>`);
    else {
      const text = textContentOfMarkup(rest.slice(0, close.index));
      if (text !== STARTUP_FAILURE_TEXT) problems.push(`#startup-failure text is ${JSON.stringify(text)}`);
    }
  }
  const modules = code.match(/<script\b[^>]*\btype\s*=\s*["']?module\b[^>]*>/gi) || [];
  if (modules.length !== 1) problems.push(`${modules.length} module scripts, expected exactly one`);

  // main.css must not hide it: any rule whose selector names #startup-failure.
  const cssCode = stripCssComments(css);
  for (const m of cssCode.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    if (!/#startup-failure\b/.test(m[1])) continue;
    if (/display\s*:\s*none|visibility\s*:\s*(hidden|collapse)|content-visibility\s*:\s*hidden/i.test(m[2])) {
      problems.push(`assets/css/main.css hides #startup-failure: ${m[1].trim()} { ${m[2].trim()} }`);
    }
  }
  return problems;
}

test('M10-U3 the static check recognises a correct and a broken start-up message', () => {
  const good =
    '<!DOCTYPE html><html lang="en"><head><meta name="viewport" content="width=device-width"></head><body>' +
    `<p id="startup-failure">${STARTUP_FAILURE_TEXT}</p><div id="app"></div>` +
    '<script type="module" src="assets/js/main.js"></script></body></html>';
  assert.deepEqual(startupMarkupProblems(good, 'body { margin: 0; }'), []);
  const broken = [
    [good.replace('lang="en"', 'lang="de"'), ''],
    [good.replace('<p id="startup-failure">', '<p id="startup-failure" hidden>'), ''],
    [good.replace('please use the hosted version.', 'please try again.'), ''],
    [good.replace('</body>', '<script type="module">start()</script></body>'), ''],
    [good, '#startup-failure { display: none; }'],
    [good.replace(/<p id="startup-failure">[\s\S]*?<\/p>/, `<!-- <p id="startup-failure">${STARTUP_FAILURE_TEXT}</p> -->`), ''],
  ];
  broken.forEach(([html, css], i) => assert.ok(startupMarkupProblems(html, css).length > 0, `broken case ${i} is detected`));
});

test('M10-U3 index.html has lang, viewport, the visible static start-up message and one module script', async () => {
  const html = await readText(repoUrl('index.html'));
  const css = await readText(repoUrl('assets/css/main.css'));
  assert.none(startupMarkupProblems(html, css), 'start-up markup problems in index.html');
});

// ------------------------------------------------------------------------------------------ M10-U4

const M6_SCREENS = Object.freeze(['assets/js/screens/trend-index.js', 'assets/js/screens/trend.js', 'assets/js/screens/scenario.js']);

/**
 * The permitted import edges, exactly as tabled in docs/04-module-design.md (M10, "Permitted import
 * edges", revised 5 October 2026); paths relative to assets/js/:
 *   main.js                  shell/*, screens/*, state/*, honesty/*, contracts/*
 *   shell/*                  other shell/* files, screens/*, state/*, honesty/*, contracts/*;
 *                            shell/routes.js imports nothing
 *   screens/*                honesty/*, contracts/*, shell/routes.js; the M6 screens
 *                            (trend-index.js, trend.js, scenario.js) also state/*
 *   state/*                  other state/* files, contracts/*
 *   honesty/*                other honesty/* files, contracts/*
 *   contracts/load.js        contracts/validate.js, vocabulary.js, constants.js
 *   contracts/validate.js    contracts/vocabulary.js, constants.js
 *   contracts/vocabulary.js, constants.js   nothing
 * No other edge: no screen imports another screen, no screen outside M6 imports state/*, nothing
 * under contracts/ imports outside contracts/, and nothing imports main.js.
 */
export function permittedEdge(from, to) {
  const dir = (p) => {
    const m = /^assets\/js\/(shell|screens|state|honesty|contracts)\/[^/]+$/.exec(p);
    return m ? m[1] : null;
  };
  const fromDir = dir(from);
  const toDir = dir(to);
  if (from === to || to === 'assets/js/main.js' || toDir === null) return false;
  const C = (name) => `assets/js/contracts/${name}`;
  if (from === 'assets/js/main.js') return ['shell', 'screens', 'state', 'honesty', 'contracts'].includes(toDir);
  if (fromDir === 'shell') {
    if (from === 'assets/js/shell/routes.js') return false;
    return ['shell', 'screens', 'state', 'honesty', 'contracts'].includes(toDir);
  }
  if (fromDir === 'screens') {
    if (toDir === 'honesty' || toDir === 'contracts' || to === 'assets/js/shell/routes.js') return true;
    return toDir === 'state' && M6_SCREENS.includes(from);
  }
  if (fromDir === 'state') return toDir === 'state' || toDir === 'contracts';
  if (fromDir === 'honesty') return toDir === 'honesty' || toDir === 'contracts';
  if (from === C('load.js')) return [C('validate.js'), C('vocabulary.js'), C('constants.js')].includes(to);
  if (from === C('validate.js')) return [C('vocabulary.js'), C('constants.js')].includes(to);
  return false;
}

const STATIC_IMPORT = /\bimport\s+(?:[\w$*{}\s,]+?\s+from\s+)?["']([^"']+)["']/g;
const EXPORT_FROM = /\bexport\s+(?:\*(?:\s+as\s+[\w$]+)?|\{[^}]*\})\s+from\s+["']([^"']+)["']/g;

/** The import specifiers of a JavaScript file's code (comments already removed). */
export function importSpecifiers(code) {
  return [...code.matchAll(STATIC_IMPORT), ...code.matchAll(EXPORT_FROM)].map((m) => m[1]);
}

function resolveSpecifier(fromPath, specifier) {
  if (!/^\.{1,2}\//.test(specifier)) return { error: `non-relative specifier ${JSON.stringify(specifier)}` };
  const base = new URL(fromPath, 'file:///repo/');
  const resolved = new URL(specifier, base);
  if (!resolved.href.startsWith('file:///repo/')) return { error: `specifier ${specifier} leaves the repository` };
  return { path: decodeURIComponent(resolved.pathname.slice('/repo/'.length)) };
}

/** Every problem M10-U4 names, for a map from repository path to file text. */
export function importGraphProblems(files) {
  const problems = [];
  const graph = new Map();
  for (const [path, text] of files) {
    if (path === 'index.html') {
      const html = stripHtmlComments(text);
      if (/<link\b[^>]*\brel\s*=\s*["']?[^"'>]*\b(modulepreload|prefetch|preload)\b/i.test(html)) {
        problems.push('index.html: has a modulepreload, prefetch or preload link');
      }
      for (const m of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']?([^"'\s>]+)/gi)) {
        const r = resolveSpecifier(path, m[1]);
        if (r.path && /^(pipeline|schemas|tests)\//.test(r.path)) problems.push(`index.html: loads ${r.path}`);
      }
      continue;
    }
    if (!/^assets\/js\/.+\.m?js$/.test(path)) continue;
    const code = codeOf(path, text);
    const edges = [];
    for (const specifier of importSpecifiers(code)) {
      const r = resolveSpecifier(path, specifier);
      if (r.error) {
        problems.push(`${path}: ${r.error}`);
        continue;
      }
      if (/^(pipeline|schemas|tests)\//.test(r.path)) problems.push(`${path}: imports from ${r.path}`);
      else if (!permittedEdge(path, r.path)) problems.push(`${path}: import of ${r.path} is not a permitted edge`);
      edges.push(r.path);
    }
    graph.set(path, edges);
    if (path !== 'assets/js/contracts/load.js') {
      if (code.includes('data/')) problems.push(`${path}: contains the string "data/" (only contracts/load.js may)`);
      if (/\bimport\s*\(/.test(code)) problems.push(`${path}: calls import( (only contracts/load.js may)`);
    }
    if (/\bloadReveal\b/.test(code) && !['assets/js/contracts/load.js', 'assets/js/screens/trend.js'].includes(path)) {
      problems.push(`${path}: names loadReveal (only contracts/load.js and screens/trend.js may)`);
    }
    // The interactive F5 is deferred (F5 static, decision of 5 Oct 2026) and must not be half-built:
    // loadConversation is named nowhere and state/scenario.js does not exist. (When F5 is built,
    // loadConversation may be named only in contracts/load.js and screens/scenario.js.)
    if (/\bloadConversation\b/.test(code)) {
      problems.push(`${path}: names loadConversation (deferred with the interactive F5; named nowhere in this release)`);
    }
    if (path === 'assets/js/state/scenario.js') {
      problems.push(`${path}: exists, but the interactive F5 is deferred and state/scenario.js is not written in this release`);
    }
  }
  // Cycles, by depth-first search.
  const state = new Map();
  const visit = (node, trail) => {
    if (state.get(node) === 'done') return;
    if (state.get(node) === 'active') {
      problems.push(`import cycle: ${[...trail.slice(trail.indexOf(node)), node].join(' -> ')}`);
      return;
    }
    state.set(node, 'active');
    for (const next of graph.get(node) || []) if (graph.has(next)) visit(next, [...trail, node]);
    state.set(node, 'done');
  };
  for (const node of graph.keys()) visit(node, []);
  return problems;
}

test('M10-U4 the import-graph check recognises every forbidden edge, string and call', () => {
  const good = new Map([
    ['index.html', '<script type="module" src="assets/js/main.js"></script>'],
    ['assets/js/main.js', "import { renderBrief } from './screens/brief.js';\nimport { route } from './shell/router.js';\n// data/ is loaded by contracts/load.js\n"],
    ['assets/js/shell/router.js', "import { routes } from './routes.js';\nimport { renderNav } from './nav.js';\nimport { createSession } from '../state/session.js';"],
    ['assets/js/shell/nav.js', "import { routes } from './routes.js';"],
    ['assets/js/screens/brief.js', "import { routes } from '../shell/routes.js';\nimport { renderLabel } from '../honesty/labels.js';"],
    ['assets/js/screens/trend.js', "import { createSession } from '../state/session.js';\nloader.loadReveal(id);"],
    ['assets/js/state/session.js', "import { drawLensOrder } from './lens-order.js';\nimport { LENSES } from '../contracts/vocabulary.js';"],
    ['assets/js/state/lens-order.js', "import { LENSES } from '../contracts/vocabulary.js';"],
    ['assets/js/honesty/labels.js', "import { LABELS } from '../contracts/vocabulary.js';"],
    ['assets/js/honesty/sources.js', "import { renderLabel } from './labels.js';"],
    ['assets/js/contracts/load.js', "import { X } from './constants.js';\nimport { checkTrend } from './validate.js';\nconst p = `../../data/${name}.js`; await import(p); loadReveal;"],
    ['assets/js/contracts/validate.js', "import { LABELS } from './vocabulary.js';\nimport { QUOTE_MAX_WORDS } from './constants.js';"],
    ['assets/js/shell/routes.js', 'export const routes = {};'],
  ]);
  assert.deepEqual(importGraphProblems(good), []);
  const bad = [
    ['assets/js/state/session.js', "import { x } from '../honesty/labels.js';"],
    ['assets/js/state/session.js', "import { routes } from '../shell/routes.js';"],
    ['assets/js/contracts/validate.js', "import { x } from './load.js';"],
    ['assets/js/contracts/vocabulary.js', "import { x } from './constants.js';"],
    ['assets/js/contracts/load.js', "import { x } from '../honesty/labels.js';"],
    ['assets/js/shell/router.js', "import { start } from '../main.js';"],
    ['assets/js/screens/brief.js', "import { x } from '../shell/router.js';"],
    ['assets/js/honesty/labels.js', "import { x } from '../state/session.js';"],
    ['assets/js/screens/log.js', "import { x } from '../state/session.js';"],
    ['assets/js/screens/brief.js', "import { x } from '../screens/log.js';"],
    ['assets/js/honesty/labels.js', "import { x } from '../screens/brief.js';"],
    ['assets/js/shell/routes.js', "import { x } from '../contracts/vocabulary.js';"],
    ['assets/js/screens/brief.js', "import data from '../../data/signals.js';"],
    ['assets/js/screens/brief.js', "const m = await import('./x.js');"],
    ['assets/js/screens/brief.js', 'loader.loadReveal(id);'],
    ['assets/js/screens/trend.js', 'loader.loadConversation(id);'],
    ['assets/js/contracts/load.js', 'export function loadConversation(id) {}'],
    ['assets/js/screens/scenario.js', 'loader.loadConversation(id);'],
    ['assets/js/state/scenario.js', 'export const canRecordScenario = () => false;'],
    ['assets/js/main.js', "import { x } from '../../tests/lib/env.mjs';"],
    ['assets/js/main.js', "export * from '../../schemas/x.js';"],
    ['index.html', '<link rel="modulepreload" href="assets/js/main.js">'],
  ];
  bad.forEach(([path, text], i) => {
    assert.ok(importGraphProblems(new Map([[path, text]])).length > 0, `forbidden case ${i} (${path}) is detected`);
  });
  const cycle = new Map([
    ['assets/js/contracts/load.js', "import './validate.js';"],
    ['assets/js/contracts/validate.js', "import './load.js';"],
  ]);
  assert.ok(importGraphProblems(cycle).some((p) => p.startsWith('import cycle')), 'a cycle is detected');
});

test('M10-U4 the import graph of assets/js/ has only permitted edges, no cycles and one data/ gateway', async () => {
  const files = await shippedFiles();
  // The shell's files from "Lives in": without them there is no graph to check, and the test must
  // not pass on the placeholder.
  const required = ['assets/js/main.js', 'assets/js/shell/router.js', 'assets/js/shell/routes.js', 'assets/js/shell/nav.js'];
  const missing = [];
  for (const f of required) {
    if (IS_NODE ? !(await exists(repoUrl(f))) : !files.includes(f)) missing.push(f);
  }
  assert.none(missing, 'M10 files not implemented yet (expected before implementation, test-first rule)');
  const texts = new Map();
  for (const f of files) if (f === 'index.html' || f.startsWith('assets/js/')) texts.set(f, await readText(repoUrl(f)));
  assert.none(importGraphProblems(texts), 'import-graph violations');
});

// ------------------------------------------------------------------------------------------ M10-U9

/** Paths with a segment that begins with a dot (schemas/.gitkeep) are housekeeping, not files. */
const notDotted = (f) => !f.split('/').some((s) => s.startsWith('.'));

test('M10-U9 tests/lib/files.mjs lists exactly the files under assets/ and schemas/ plus index.html', { needs: ['fs'] }, async () => {
  // Guard: the dot rule ignores dot segments at any depth and nothing else.
  assert.deepEqual(['.gitkeep', 'a/.b/c.js', 'a/b.js', 'x.json'].filter(notDotted), ['a/b.js', 'x.json']);
  const assets = (await listFiles(repoUrl('assets/'))).filter(notDotted).map((f) => `assets/${f}`);
  const schemas = (await listFiles(repoUrl('schemas/'))).filter(notDotted).map((f) => `schemas/${f}`);
  assert.deepEqual([...SHIPPED_FILES].sort(), ['index.html', ...assets].sort(), 'SHIPPED_FILES against index.html and assets/');
  assert.deepEqual([...SCHEMA_FILES].sort(), schemas.sort(), 'SCHEMA_FILES against schemas/');
  assert.equal(FILES.length, SHIPPED_FILES.length + SCHEMA_FILES.length, 'FILES is the union of both lists');
});

test('M10-U9 tests/unit/index.mjs lists every *.test.mjs and *.browser.mjs file in tests/unit/', { needs: ['fs'] }, async () => {
  const present = (await listFiles(repoUrl('tests/unit/')))
    .filter((f) => !f.includes('/') && /\.(test|browser)\.mjs$/.test(f))
    .map((f) => `./${f}`)
    .sort();
  assert.deepEqual([...TEST_FILES].sort(), present, 'TEST_FILES against tests/unit/');
});
