// M9 Honesty and provenance layer: the part of M9-U2 that needs no DOM (formatDate).
// Everything else of M9 renders DOM and is in m9-honesty.browser.mjs.
// Written from docs/04-module-design.md (M9) before assets/js/honesty/* exists (test-first rule);
// at G2 it fails with "module under test could not be imported".
// formatDate is exported by assets/js/honesty/sources.js (M9 Outputs, docs/04-module-design.md).

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { load } from '../lib/screens.mjs';

test('M9-U2 formatDate("2026-10-05") is "5 October 2026"', async () => {
  const S = await load('sources');
  assert.equal(typeof S.formatDate, 'function', 'assets/js/honesty/sources.js exports formatDate');
  assert.equal(S.formatDate('2026-10-05'), '5 October 2026', 'formatDate');
});
