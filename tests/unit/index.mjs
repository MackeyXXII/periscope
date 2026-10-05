// Test tooling for Periscope. Never imported by the page.
//
// The list of every unit test file, for the browser runner (tests/run.html). `node --test` finds
// *.test.mjs files by itself; the browser cannot list a directory, so every *.test.mjs and every
// *.browser.mjs file in tests/unit/ must be listed here. M10-U9 (Node) fails if one is missing.
//
// Files are imported one by one with import() rather than by static import statements, so that
// one file that cannot load (for example because it statically imports a module that does not
// exist yet) is reported as a load failure of that file instead of blanking the whole run.

export const TEST_FILES = Object.freeze([
  './m1-contracts.test.mjs',
  './m1-freeze.test.mjs',
  './m2-briefs.test.mjs',
  './m3-signals.test.mjs',
  './m4-interpretation.test.mjs',
  './m5-brief.test.mjs',
  './m5-brief.browser.mjs',
]);

/** Imports every listed file; calls onError(file, error) for each one that fails to load. */
export async function importAll(onError = () => {}) {
  for (const file of TEST_FILES) {
    try {
      await import(new URL(file, import.meta.url).href);
    } catch (error) {
      onError(file, error);
    }
  }
}
