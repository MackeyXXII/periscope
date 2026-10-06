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
