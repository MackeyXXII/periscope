// Test tooling for Periscope. Never imported by the page.
//
// DOM helpers for the screen tests (*.browser.mjs) and the whole-app tests
// (docs/04-module-design.md, "How a test file is written so that it runs in both", item 7). Every
// function here needs a real DOM; a test that uses them declares `needs: ['dom']`, so under Node it
// is skipped before any of this runs. Nothing here fetches anything: documents are loaded by
// <iframe>, modules by import().
//
//   mount(host, { width, height })   A fresh same-origin document in an <iframe> inside `host` (the
//                                    runner's scratch root), with assets/css/main.css linked, so
//                                    that computed styles are the page's own. Resolves to
//                                    { frame, win, doc, root, html(), text() }; `root` is an empty
//                                    #app element to render a screen into. The iframe is removed
//                                    with the scratch root.
//   appFrame(host, { width, height, hash, options })
//                                    Loads tests/app-host.html (the same static elements as
//                                    index.html) in a same-origin <iframe> of the given size and has
//                                    it call start(options). Resolves to { frame, win, doc, error,
//                                    navigate(hash) } once start() has settled. One at a time.
//   settle(), waitFor(pred, what)    Let pending promises and timers run; poll for a condition.
//   click(el), type(el, text), choose(radio)
//                                    Viewer actions, with the events a real browser fires.
//   installStorageSpy(windows)       Replaces localStorage, sessionStorage, indexedDB, caches and
//                                    document.cookie on each window by recording stubs (M6-U9,
//                                    M6-U25). Returns { accesses, restore() }.
//   serialise(doc)                   document.documentElement.outerHTML: attributes, comments and
//                                    <template> contents included (M6-U1, M6-U20).
//   buttonsByText, elementsByText, smallestContaining, isVisible, isEditable, focusables, labelOf,
//   findBadge                        Queries used by several screen tests. findBadge finds a badge by
//                                    its data-badge hook (never data-label), as the module design's
//                                    DOM hooks table fixes it.
//
// Added by the Test Engineer on 5 October 2026 for the M6, M8 and M9 tests; aligned on 5 October
// 2026 with the DOM hooks table of docs/04-module-design.md (data-area, data-badge).

import { repoUrl } from './env.mjs';

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 800;

// ------------------------------------------------------------------------------------------ timing

/** Lets microtasks and a few macrotask turns run, so that async handlers can finish. */
export async function settle(turns = 3) {
  for (let i = 0; i < turns; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

/** Polls `predicate` until it returns a truthy value; throws, naming `what`, after `timeout` ms. */
export async function waitFor(predicate, what, timeout = 2000) {
  const started = Date.now();
  for (;;) {
    const value = predicate();
    if (value) return value;
    if (Date.now() - started > timeout) throw new Error(`timed out after ${timeout} ms waiting for ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

// ------------------------------------------------------------------------------------------ documents

function makeFrame(host, width, height) {
  if (!host) throw new Error('mount: no scratch host element (this helper runs only in the browser runner)');
  const frame = host.ownerDocument.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = `width:${width}px;height:${height}px;border:0;display:block;`;
  return frame;
}

function loaded(frame) {
  return new Promise((resolve, reject) => {
    frame.addEventListener('load', () => resolve(), { once: true });
    frame.addEventListener('error', () => reject(new Error('iframe failed to load')), { once: true });
  });
}

/** A fresh document with the page's stylesheet and an empty #app root. */
export async function mount(host, { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = {}) {
  const frame = makeFrame(host, width, height);
  const css = repoUrl('assets/css/main.css').href;
  frame.srcdoc =
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    `<link rel="stylesheet" href="${css}"></head><body><div id="app"></div></body></html>`;
  const ready = loaded(frame);
  host.appendChild(frame);
  await ready;
  const win = frame.contentWindow;
  const doc = frame.contentDocument;
  const root = doc.getElementById('app');
  return {
    frame,
    win,
    doc,
    root,
    html: () => serialise(doc),
    text: () => doc.body.textContent,
    /** Empties the root, as navigating to another screen would. */
    clear: () => root.replaceChildren(),
  };
}

/**
 * Loads tests/app-host.html with the given options handed to start(). The host page reads them
 * from window.parent.__periscopeAppHost and reports back when start() has settled.
 */
export async function appFrame(host, { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, hash = '', options = {} } = {}) {
  const parentWin = host.ownerDocument.defaultView;
  if (parentWin.__periscopeAppHost) throw new Error('appFrame: another app frame is still loading');
  const frame = makeFrame(host, width, height);
  let resolveStarted;
  const started = new Promise((resolve) => {
    resolveStarted = resolve;
  });
  parentWin.__periscopeAppHost = {
    options: () => options,
    started: (error) => resolveStarted(error || null),
  };
  try {
    frame.src = repoUrl('tests/app-host.html').href + (hash ? (hash.startsWith('#') ? hash : `#${hash}`) : '');
    host.appendChild(frame);
    const error = await Promise.race([
      started,
      new Promise((_, reject) => setTimeout(() => reject(new Error('app host did not report start() within 4 s')), 4000)),
    ]);
    const win = frame.contentWindow;
    return {
      frame,
      win,
      doc: frame.contentDocument,
      error,
      async navigate(next) {
        win.location.hash = next.startsWith('#') ? next : `#${next}`;
        await settle(5);
      },
    };
  } finally {
    delete parentWin.__periscopeAppHost;
  }
}

/** The whole document as markup, including attributes, comments and <template> contents. */
export function serialise(doc) {
  return doc.documentElement.outerHTML;
}

// ------------------------------------------------------------------------------------------ actions

function eventIn(el, type, init = { bubbles: true }) {
  const Ctor = el.ownerDocument.defaultView.Event;
  return new Ctor(type, init);
}

export async function click(el) {
  if (!el) throw new Error('click: no element');
  el.click();
  await settle();
}

/** Types `text` into a field: sets its value and fires input and change, as typing would. */
export async function type(el, text) {
  if (!el) throw new Error('type: no element');
  el.focus();
  el.value = text;
  el.dispatchEvent(eventIn(el, 'input'));
  el.dispatchEvent(eventIn(el, 'change'));
  await settle();
}

/** Chooses a radio option (or any clickable option) the way a pointer would. */
export async function choose(option) {
  if (!option) throw new Error('choose: no option');
  option.click();
  await settle();
}

// ------------------------------------------------------------------------------------------ storage

const STORAGE_GLOBALS = ['localStorage', 'sessionStorage', 'indexedDB', 'caches'];

function recordingStub(name, accesses) {
  return new Proxy(
    {},
    {
      get(_, prop) {
        accesses.push(`${name}.${String(prop)}`);
        return () => undefined;
      },
      set(_, prop) {
        accesses.push(`${name}.${String(prop)} (set)`);
        return true;
      },
    },
  );
}

/**
 * Replaces the browser's storage entry points on each given window (and its document) with stubs
 * that record every access. Page code reads them as globals of its own realm, so pass the runner's
 * window as well as any frame the screen renders into.
 */
export function installStorageSpy(windows) {
  const accesses = [];
  const undo = [];
  for (const win of windows) {
    for (const name of STORAGE_GLOBALS) {
      const own = Object.getOwnPropertyDescriptor(win, name);
      const stub = recordingStub(name, accesses);
      Object.defineProperty(win, name, {
        configurable: true,
        get() {
          accesses.push(name);
          return stub;
        },
        set() {
          accesses.push(`${name} (set)`);
        },
      });
      undo.push(() => {
        if (own) Object.defineProperty(win, name, own);
        else delete win[name];
      });
    }
    const doc = win.document;
    const ownCookie = Object.getOwnPropertyDescriptor(doc, 'cookie');
    Object.defineProperty(doc, 'cookie', {
      configurable: true,
      get() {
        accesses.push('document.cookie (get)');
        return '';
      },
      set() {
        accesses.push('document.cookie (set)');
      },
    });
    undo.push(() => {
      if (ownCookie) Object.defineProperty(doc, 'cookie', ownCookie);
      else delete doc.cookie;
    });
  }
  return {
    accesses,
    /** Clears the record (used after the self-check that the stubs are in place). */
    reset() {
      accesses.length = 0;
    },
    restore() {
      while (undo.length) undo.pop()();
    },
  };
}

// ------------------------------------------------------------------------------------------ queries

/** Normalised visible-ish text of a node: whitespace collapsed and trimmed. */
export function textOf(node) {
  return String(node && node.textContent ? node.textContent : '').replace(/\s+/g, ' ').trim();
}

/** Every element under `root` whose normalised text equals `text`, innermost first excluded. */
export function elementsByText(root, text, selector = '*') {
  return Array.from(root.querySelectorAll(selector)).filter((el) => textOf(el) === text);
}

/** Buttons (and elements with role="button") whose text is exactly `text`. */
export function buttonsByText(root, text) {
  return elementsByText(root, text, 'button, [role="button"]').concat(
    Array.from(root.querySelectorAll('input[type="button"], input[type="submit"]')).filter((el) => el.value === text),
  );
}

/** Links whose text is exactly `text`. */
export function linksByText(root, text) {
  return elementsByText(root, text, 'a');
}

/** The innermost elements whose text contains `needle` (string or RegExp). */
export function smallestContaining(root, needle) {
  const test = (s) => (needle instanceof RegExp ? needle.test(s) : s.includes(needle));
  const all = Array.from(root.querySelectorAll('*')).filter((el) => test(textOf(el)));
  return all.filter((el) => !all.some((other) => other !== el && el.contains(other)));
}

/** Rendered: has a layout box and is not visibility:hidden, and no ancestor is a closed <details>. */
export function isVisible(el) {
  if (!el || !el.isConnected) return false;
  if (el.getClientRects().length === 0) return false;
  const style = el.ownerDocument.defaultView.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.visibility === 'collapse') return false;
  for (let a = el.parentElement; a; a = a.parentElement) {
    if (a.tagName === 'DETAILS' && !a.open && el.closest('summary') === null) return false;
    if (a.hidden) return false;
  }
  return !el.hidden;
}

/** A text field or option the viewer can change. */
export function isEditable(el) {
  if (!el) return false;
  if (el.disabled) return false;
  if (el.closest('fieldset[disabled]')) return false;
  if ('readOnly' in el && el.readOnly && el.type !== 'radio' && el.type !== 'checkbox') return false;
  if (el.getAttribute('aria-disabled') === 'true') return false;
  return true;
}

const FOCUSABLE =
  'a[href], button, input:not([type="hidden"]), textarea, select, summary, [tabindex], [contenteditable="true"]';

/** Elements under `root` that keyboard focus can reach, in document order. */
export function focusables(root) {
  return Array.from(root.querySelectorAll(FOCUSABLE)).filter(
    (el) => !el.disabled && el.getAttribute('tabindex') !== '-1' && !el.closest('fieldset[disabled]') && isVisible(el),
  );
}

/** The label value an element carries itself (its own data-label attribute), or null. */
export function labelOf(el) {
  return el ? el.getAttribute('data-label') : null;
}

/** The data-label values from the node outwards: the node's own (if an element) and its ancestors'. */
export function labelChain(node) {
  const out = [];
  for (let el = node.nodeType === 1 ? node : node.parentElement; el; el = el.parentElement) {
    if (el.hasAttribute('data-label')) out.push(el.getAttribute('data-label'));
  }
  return out;
}

/** Text nodes under `root` whose text contains `needle`. */
export function textNodesContaining(root, needle) {
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  const out = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.data.includes(needle)) out.push(n);
  return out;
}

const VOID_CONTROLS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'IMG']);

/**
 * The visible badge that belongs to a labelled element (the DOM hooks table of
 * docs/04-module-design.md): an element with a data-badge attribute (equal to `value` when given)
 * and no data-label, whose text is exactly `display`, inside the element and not inside a nested
 * content element (a part's own badge does not count for its entity). For a form control, which
 * cannot hold children, the badge is looked for beside it, within the same wrapper (its parent),
 * outside any other content element. Returns the badge or null.
 */
export function findBadge(el, display, value = null) {
  const isVoid = VOID_CONTROLS.has(el.tagName);
  const scope = isVoid ? el.parentElement : el;
  if (!scope) return null;
  for (const candidate of scope.querySelectorAll('[data-badge]')) {
    if (candidate === el || textOf(candidate) !== display) continue;
    if (candidate.hasAttribute('data-label')) continue;
    if (value !== null && candidate.getAttribute('data-badge') !== value) continue;
    const owner = candidate.closest('[data-content]');
    const belongs = owner === null || owner === el || owner.contains(scope);
    if (belongs && isVisible(candidate)) return candidate;
  }
  return null;
}

/** Whether node `a` comes before node `b` in document order. */
export function precedes(a, b) {
  return Boolean(a.compareDocumentPosition(b) & 4 /* DOCUMENT_POSITION_FOLLOWING */);
}

/** A structural signature of an element: tag, class list and the same for every descendant. */
export function shape(el) {
  const kids = Array.from(el.children).map(shape).join(',');
  return `${el.tagName.toLowerCase()}[${Array.from(el.classList).join(' ')}](${kids})`;
}
