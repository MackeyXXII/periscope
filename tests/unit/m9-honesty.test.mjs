// M9 Honesty and provenance layer: the part of M9-U2 that needs no DOM (formatDate).
// Everything else of M9 renders DOM and is in m9-honesty.browser.mjs.
// Written from docs/04-module-design.md (M9) before assets/js/honesty/* exists (test-first rule);
// at G2 it fails with "module under test could not be imported".
// The module design names M9's three files but not which exports formatDate, so the test takes it
// from whichever of labels.js, sources.js and statement.js exports it (tests/lib/screens.mjs).

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { honesty } from '../lib/screens.mjs';

test('M9-U2 formatDate("2026-10-05") is "5 October 2026"', async () => {
  const H = await honesty();
  assert.equal(typeof H.formatDate, 'function', 'an M9 file exports formatDate');
  assert.equal(H.formatDate('2026-10-05'), '5 October 2026', 'formatDate');
});
