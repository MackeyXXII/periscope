// Test tooling for Periscope. Never imported by the page.
//
// The project's own assertions, so that `node --test` and the browser runner execute the same
// code (node:assert is not available in the browser). Every assertion throws an AssertionError
// with a readable message; an optional last argument adds context such as a file and a path.

export class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AssertionError';
  }
}

function fail(message, context) {
  throw new AssertionError(context ? `${context}: ${message}` : message);
}

function show(value) {
  try {
    const s = JSON.stringify(value);
    if (s === undefined) return String(value);
    return s.length > 300 ? `${s.slice(0, 300)}…` : s;
  } catch {
    return String(value);
  }
}

/** Structural equality of JSON-like values, Maps and Sets. Key order of objects is ignored. */
export function isDeepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Map || b instanceof Map) {
    if (!(a instanceof Map && b instanceof Map) || a.size !== b.size) return false;
    for (const [k, v] of a) if (!b.has(k) || !isDeepEqual(v, b.get(k))) return false;
    return true;
  }
  if (a instanceof Set || b instanceof Set) {
    if (!(a instanceof Set && b instanceof Set) || a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => isDeepEqual(v, b[i]));
  }
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && isDeepEqual(a[k], b[k]));
}

export const assert = Object.freeze({
  fail,

  ok(value, message = 'expected a truthy value', context) {
    if (!value) fail(`${message} (got ${show(value)})`, context);
  },

  equal(actual, expected, context) {
    if (!Object.is(actual, expected)) fail(`expected ${show(expected)}, got ${show(actual)}`, context);
  },

  notEqual(actual, unexpected, context) {
    if (Object.is(actual, unexpected)) fail(`expected a value other than ${show(unexpected)}`, context);
  },

  deepEqual(actual, expected, context) {
    if (!isDeepEqual(actual, expected)) {
      fail(`values differ\n  expected: ${show(expected)}\n  actual:   ${show(actual)}`, context);
    }
  },

  match(text, regex, context) {
    if (typeof text !== 'string' || !regex.test(text)) fail(`expected ${show(text)} to match ${regex}`, context);
  },

  includes(haystack, needle, context) {
    const has = typeof haystack === 'string' ? haystack.includes(needle) : Array.from(haystack).includes(needle);
    if (!has) fail(`expected ${show(haystack)} to include ${show(needle)}`, context);
  },

  notIncludes(haystack, needle, context) {
    const has = typeof haystack === 'string' ? haystack.includes(needle) : Array.from(haystack).includes(needle);
    if (has) fail(`expected ${show(haystack)} not to include ${show(needle)}`, context);
  },

  /** Passes if fn throws; `expected` may be an Error class or a RegExp tested on the message. */
  throws(fn, expected, context) {
    let threw = false;
    let error;
    try {
      fn();
    } catch (e) {
      threw = true;
      error = e;
    }
    if (!threw) fail('expected the function to throw, and it did not', context);
    checkError(error, expected, context);
    return error;
  },

  /** Passes if the promise (or async function) rejects. */
  async rejects(promiseOrFn, expected, context) {
    let rejected = false;
    let error;
    try {
      await (typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn);
    } catch (e) {
      rejected = true;
      error = e;
    }
    if (!rejected) fail('expected a rejection, and the promise resolved', context);
    checkError(error, expected, context);
    return error;
  },

  /** Collects many failures and throws once, listing all of them. Use for "no file has X" audits. */
  none(problems, what, context) {
    if (problems.length > 0) {
      const list = problems.slice(0, 40).map((p) => `  - ${p}`).join('\n');
      const more = problems.length > 40 ? `\n  … and ${problems.length - 40} more` : '';
      fail(`${problems.length} ${what}:\n${list}${more}`, context);
    }
  },
});

function checkError(error, expected, context) {
  if (expected === undefined) return;
  if (expected instanceof RegExp) {
    if (!expected.test(String(error && error.message))) {
      fail(`error message ${show(error && error.message)} does not match ${expected}`, context);
    }
  } else if (typeof expected === 'function' && !(error instanceof expected)) {
    fail(`expected an error of type ${expected.name}, got ${error && error.name}`, context);
  }
}
