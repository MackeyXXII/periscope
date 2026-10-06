// M9 Honesty and provenance layer: the demo-wide statement (C-5; docs/03-architecture.md,
// section 8). The shell renders it on every screen, with the freeze date from the manifest. It is
// interface copy, not content, so it carries no data-content and no data-label (C-5 rule 6, M9-U8).

import { formatDate } from './sources.js';

/**
 * <p class="demo-statement">All content was produced offline and frozen on <date>; nothing in this
 * demo calls an AI service or the network.</p>, the date being the manifest's frozenOn as
 * formatDate renders it. Throws a TypeError if the manifest has no valid frozenOn.
 */
export function renderDemoStatement(manifest) {
  if (manifest === null || typeof manifest !== 'object') throw new TypeError('renderDemoStatement: the freeze manifest is not an object');
  const date = formatDate(manifest.frozenOn);
  const p = document.createElement('p');
  p.className = 'demo-statement';
  p.textContent = `All content was produced offline and frozen on ${date}; nothing in this demo calls an AI service or the network.`;
  return p;
}
