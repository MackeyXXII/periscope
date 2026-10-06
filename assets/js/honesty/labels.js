// M9 Honesty and provenance layer: the visible honesty badge (docs/04-module-design.md, M9;
// docs/03-architecture.md, section 8).
//
// renderLabel(value) returns the badge a screen places inside the element that carries
// data-content and data-label (beside it, within the same wrapper, for a form control). The badge
// carries data-badge, never data-label, so a count of data-label values is a count of labelled
// elements (M9-U9). Every screen calls this one function, so peers always carry byte-identical
// label markup (C-5 rule 4). The display texts come from vocabulary.js, their one home.
//
// No DOM is touched at import time: `document` is read only when a badge is rendered.

import { LABELS, LABEL_DISPLAY } from '../contracts/vocabulary.js';

/**
 * The visible badge for one of the six label values:
 * <span class="label-badge" data-badge="<value>">LABEL_DISPLAY[value]</span>.
 * Throws a TypeError for anything outside the vocabulary, including a display form such as "Yours".
 */
export function renderLabel(value) {
  if (typeof value !== 'string' || !LABELS.includes(value)) {
    throw new TypeError(`renderLabel: ${JSON.stringify(value)} is not one of the six honesty labels (${LABELS.join(', ')})`);
  }
  const badge = document.createElement('span');
  badge.className = 'label-badge';
  badge.setAttribute('data-badge', value);
  badge.textContent = LABEL_DISPLAY[value];
  return badge;
}

/**
 * The fictional premise of the demo (L2 F1, "Tracewell's name, wherever it appears as content:
 * fictional"; docs/03-architecture.md, section 8). One sentence, kept here so the brief and every
 * trend card show the same words. It is not a peer of signals or readings and states no reading.
 */
export const FICTIONAL_PREMISE =
  'Tracewell is a fictional four-person observability start-up in Linz, the founding team this demo is written for. The signals and their sources are real.';

/**
 * The premise as one content element: <p class="premise" data-content data-label="fictional">
 * with the fictional badge inside. `doc` is the document the screen renders into.
 */
export function renderPremise(doc = document) {
  const p = doc.createElement('p');
  p.className = 'premise';
  p.setAttribute('data-content', '');
  p.setAttribute('data-label', 'fictional');
  p.textContent = FICTIONAL_PREMISE + ' ';
  p.appendChild(renderLabel('fictional'));
  return p;
}
