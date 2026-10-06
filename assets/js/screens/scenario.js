// M6 Judgement and scenario capture: F5 as the static screen F5-ST (docs/02-system-requirements.md,
// F5; docs/03-architecture.md, section 6.4; docs/04-module-design.md, M6-U24).
//
// F5 ships static in this release (decision of 5 October 2026). This screen checks the route's
// trend identifier exactly as the trend card does (F1-E0, F1-E1, F1-E2) and then describes scenario
// work in interface copy: no input field, no AI-generated content, no content element, no label,
// no data module of its own. It reads nothing from the session and changes nothing in it, whether
// or not a judgement has been committed. The `flow` key of the context is kept for the deferred
// interactive build and not read here.

import { checkTrend } from '../contracts/validate.js';
import { ID_PATTERNS } from '../contracts/vocabulary.js';

const TEXT = Object.freeze({
  loadFailed: 'Trend cards could not be loaded in this build.',
  notFound: 'This trend card does not exist in this build.',
  withheld: 'This trend card was withheld because its content failed validation.',
  toIndex: 'Open the trend index',
  heading: 'Scenario work from your own conversations',
  description: Object.freeze([
    'Scenario work starts from what you have heard in your own conversations with customers, partners, investors and others outside the company.',
    'You write how the trend could play out over the next twelve months before you see anything the machine has prepared.',
    'Only then does the machine offer a few questions, written offline, to take into your next conversations.',
  ]),
  staticNotice:
    'In this build the scenario step is described only: there is nothing to write here, and no conversation questions were prepared for this release.',
  toTrend: 'Back to the trend card',
});

function el(doc, tag, className, text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function linkParagraph(doc, href, text) {
  const p = el(doc, 'p');
  const a = el(doc, 'a', '', text);
  a.setAttribute('href', href);
  p.appendChild(a);
  return p;
}

/** renderScenario(root, ctx, trendId): F5-ST, or F1-E0, F1-E1 or F1-E2 on the scenario route. */
export async function renderScenario(root, ctx, trendId) {
  const doc = root.ownerDocument;
  const [trends, signals] = await Promise.all([ctx.loader.loadTrends(), ctx.loader.loadSignals()]);
  if (!trends || trends.ok !== true || !signals || signals.ok !== true) {
    root.appendChild(el(doc, 'p', 'notice', TEXT.loadFailed));
    return;
  }
  const known = typeof trendId === 'string' && ID_PATTERNS.trendId.test(trendId);
  const trend = known ? trends.value.find((t) => t !== null && typeof t === 'object' && t.id === trendId) : undefined;
  if (!trend) {
    root.append(el(doc, 'p', 'notice', TEXT.notFound), linkParagraph(doc, ctx.routes.trends(), TEXT.toIndex));
    return;
  }
  const verdict = checkTrend(trend, signals.value);
  if (!verdict || verdict.ok !== true) {
    root.append(el(doc, 'p', 'notice', TEXT.withheld), linkParagraph(doc, ctx.routes.trends(), TEXT.toIndex));
    return;
  }

  root.appendChild(el(doc, 'h1', '', TEXT.heading));
  root.appendChild(el(doc, 'p', '', TEXT.description.join(' ')));
  root.appendChild(el(doc, 'p', 'note', TEXT.staticNotice));
  root.appendChild(linkParagraph(doc, ctx.routes.trend(trend.id), TEXT.toTrend));
}
