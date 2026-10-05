// Test tooling for Periscope. Never imported by the page.
//
// A skip is a test that cannot run here, for a named reason: a part that needs data/ before G3,
// a raw-file read in the browser runner, a DOM test under Node. It is never a pass. Throw
// `new Skip(reason)` (or call `skip(reason)`) from inside a test body; both runners report the
// test as skipped with that reason.

export class Skip extends Error {
  constructor(reason) {
    super(`skipped: ${reason}`);
    this.name = 'Skip';
    this.reason = reason;
  }
}

export function skip(reason) {
  throw new Skip(reason);
}

// Standard reasons, worded as in docs/04-module-design.md, "Conventions for every test below".
export const REASONS = Object.freeze({
  data: 'needs data/ (G3)',
  verified: 'maturity unverified (D-1)',
  questions: 'SCENARIO_FLOW is static (O-1)',
  dom: 'needs a real DOM: runs only from tests/run.html',
  fs: 'needs Node: directory listing or child process',
  text: 'needs Node or DM-11: reads raw file text, which the browser runner may not request until DM-11 is decided',
});
