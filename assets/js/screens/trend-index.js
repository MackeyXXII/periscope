// M6 Judgement and scenario capture: the trend index, F1-S0 (docs/02-system-requirements.md, F1;
// docs/04-module-design.md, M6).
//
// Trend titles in alphabetical order (C-4), each a link to its trend card, with the ordering note.
// One template for every item: no marker, count or emphasis distinguishes one trend (invariant 1).
// Nothing about any reading is loaded or shown here. A trend that fails its record check is
// withheld, never shown partially (C-3); the notice says how many.

import { checkTrend } from '../contracts/validate.js';
import { renderLabel } from '../honesty/labels.js';

const TEXT = Object.freeze({
  heading: 'Trends',
  orderNote: 'Listed alphabetically.',
  empty: 'No trend cards are available in this build.',
  loadFailed: 'Trend cards could not be loaded in this build.',
  withheldOne: '1 trend card was withheld because its content failed validation.',
  withheldMany: (n) => `${n} trend cards were withheld because their content failed validation.`,
});

function el(doc, tag, className, text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Alphabetical by title (English collation), ties by identifier: an order that says nothing about importance. */
function byTitle(a, b) {
  const t = a.title.localeCompare(b.title, 'en', { sensitivity: 'base' });
  if (t !== 0) return t;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** renderTrendIndex(root, ctx): F1-S0, F1-S0e or F1-E0. Resolves when the screen has rendered. */
export async function renderTrendIndex(root, ctx) {
  const doc = root.ownerDocument;
  root.appendChild(el(doc, 'h1', '', TEXT.heading));

  const [trends, signals] = await Promise.all([ctx.loader.loadTrends(), ctx.loader.loadSignals()]);
  if (!trends || trends.ok !== true || !signals || signals.ok !== true) {
    root.appendChild(el(doc, 'p', 'notice', TEXT.loadFailed));
    return;
  }

  const valid = trends.value.filter((t) => {
    const verdict = checkTrend(t, signals.value);
    return verdict && verdict.ok === true;
  });
  const withheld = trends.value.length - valid.length;

  if (valid.length === 0) {
    root.appendChild(el(doc, 'p', 'notice', TEXT.empty));
  } else {
    root.appendChild(el(doc, 'p', 'note', TEXT.orderNote));
    const list = el(doc, 'ul', 'card-list');
    for (const trend of valid.slice().sort(byTitle)) {
      const item = el(doc, 'li', 'card trend-item');
      item.setAttribute('data-content', '');
      item.setAttribute('data-label', trend.label);
      const link = el(doc, 'a', 'trend-link', trend.title);
      link.setAttribute('href', ctx.routes.trend(trend.id));
      item.append(link, renderLabel(trend.label));
      list.appendChild(item);
    }
    root.appendChild(list);
  }

  if (withheld > 0) {
    root.appendChild(el(doc, 'p', 'notice', withheld === 1 ? TEXT.withheldOne : TEXT.withheldMany(withheld)));
  }
}
