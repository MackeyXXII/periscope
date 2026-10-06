// M7 Readiness and maturity: the governance screen, R8 (docs/02-system-requirements.md, F3;
// docs/04-module-design.md, M7).
//
// F3-S3: two plainly headed lists, "Implemented in this demo" and "Not implemented", each item
// with the identifiers of the tests or audits that verify it (N5), both covered by the governance
// container's `real` label; then the argument for own-data ingestion's conditions, each paragraph
// with its own `ai-generated` label and its dated `real` sources.
//
// F3-S3a (N6 option (b), decided by Miguel on 5 October 2026): when the argument is empty, both
// lists exactly as in F3-S3 and, in its place, one sentence of interface copy with no label. No
// argument heading and no argument region are rendered, empty or otherwise. This is a shipping
// state. F3-E2 (the governance content could not be loaded) is a defence that must never ship.

import { renderLabel } from '../honesty/labels.js';
import { renderSource } from '../honesty/sources.js';

const TEXT = Object.freeze({
  heading: 'Governance',
  intro: 'What this demo does and does not do with data, stated plainly.',
  implemented: 'Implemented in this demo',
  notImplemented: 'Not implemented',
  listNote: 'Each statement names the tests that verify it.',
  verifiedBy: 'Verified by:',
  argumentHeading: 'What own-data ingestion would require before it could be built',
  sources: 'Sources:',
  argumentWithheld:
    'The argument for own-data ingestion is not shown in this build because its claims did not pass verification.',
  missing: 'The governance statement could not be shown.',
});

function el(doc, tag, className, text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Marks `node` as a content element with its label and appends the visible badge to `badgeHost` (default: node). */
function labelled(node, label, badgeHost = node) {
  node.setAttribute('data-content', '');
  node.setAttribute('data-label', label);
  badgeHost.appendChild(renderLabel(label));
  return node;
}

/** One list region: its heading, the line naming what the identifiers are (with the badge), and the items. */
function listRegion(doc, area, heading, items, label) {
  const section = el(doc, 'section', 'governance-list');
  section.setAttribute('data-area', area);
  const note = el(doc, 'p', 'meta', TEXT.listNote);
  section.append(el(doc, 'h2', '', heading), note);
  const list = el(doc, 'ul', 'card-list');
  for (const item of items) {
    const li = el(doc, 'li', 'card governance-item');
    li.append(el(doc, 'p', '', item.text), el(doc, 'p', 'meta', `${TEXT.verifiedBy} ${item.verifiedBy.join(', ')}`));
    list.appendChild(li);
  }
  section.appendChild(list);
  return labelled(section, label, note);
}

function argumentRegion(doc, paragraphs) {
  const section = el(doc, 'section', 'governance-argument');
  section.setAttribute('data-area', 'governance-argument');
  section.appendChild(el(doc, 'h2', '', TEXT.argumentHeading));
  for (const para of paragraphs) {
    const box = el(doc, 'div', 'argument-paragraph');
    const text = el(doc, 'p', '', para.text);
    const sources = el(doc, 'p', 'sources');
    sources.appendChild(doc.createTextNode(`${TEXT.sources} `));
    para.sources.forEach((s, i) => {
      if (i > 0) sources.appendChild(doc.createTextNode('; '));
      sources.appendChild(renderSource(s));
    });
    // Each claim's sources are real and dated; the paragraph itself was written by an agent.
    box.append(text, labelled(sources, 'real'));
    section.appendChild(labelled(box, para.label, text));
  }
  return section;
}

/** renderGovernance(root, ctx): F3-S3, F3-S3a or F3-E2. Resolves when the screen has rendered. */
export async function renderGovernance(root, ctx) {
  const doc = root.ownerDocument;
  root.appendChild(el(doc, 'h1', '', TEXT.heading));
  const loaded = await ctx.loader.loadGovernance();
  if (!loaded || loaded.ok !== true) {
    root.appendChild(el(doc, 'p', 'notice', TEXT.missing));
    return;
  }
  const g = loaded.value;
  root.appendChild(el(doc, 'p', '', TEXT.intro));
  root.appendChild(listRegion(doc, 'governance-implemented', TEXT.implemented, g.implemented, g.label));
  root.appendChild(listRegion(doc, 'governance-not-implemented', TEXT.notImplemented, g.notImplemented, g.label));

  if (Array.isArray(g.argument) && g.argument.length > 0) {
    root.appendChild(argumentRegion(doc, g.argument));
  } else {
    const withheld = el(doc, 'p', 'note', TEXT.argumentWithheld);
    withheld.setAttribute('data-area', 'governance-argument-withheld');
    root.appendChild(withheld);
  }
}
