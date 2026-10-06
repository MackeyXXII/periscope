// M7 Readiness and maturity: the readiness screen, F3 (docs/02-system-requirements.md, F3;
// docs/04-module-design.md, M7).
//
// F3-S1: the five readiness categories in the order Jöhnk et al. (2021) present them (DM-8), each
// with the fictional team's answers and a prose finding, and the framework citation. Then the
// maturity view, one entry per foresight practice in the order R2 names them:
//   - unverified (F3-S2): each practice shows the placeholder (LEVEL_NAME_PLACEHOLDER), the pending sentence
//     follows once, and the next-level area holds only its pending sentence. The placeholder is not
//     content, so the practices carry no label in this state, and no report citation, explanation
//     or level name of any kind is rendered (D-1);
//   - verified (F3-S2v): only when the profile says so *and* every level name is one of the
//     verified names (`levelNames`, MATURITY_LEVEL_NAMES in the page). Each practice shows its level
//     (fictional), its explanation (ai-generated, its own label) and the report citation (real);
//     the next-level block shows the report's description of the next level, never advice (K-2).
// A verified profile whose names are not in `levelNames` is withheld (F3-E1), as the loader would
// already have done; the check is repeated here so that no unverified name can render.
//
// No ranking (invariant 1): no numbers, bars, gauges, meters or colour scales; the categories are
// never sorted by finding, and the level order is never drawn as a scale.

import { MATURITY_LEVEL_NAMES, LEVEL_NAME_PLACEHOLDER, READINESS_CATEGORY_KEYS, PRACTICE_KEYS } from '../contracts/vocabulary.js';
import { renderLabel } from '../honesty/labels.js';
import { renderSource } from '../honesty/sources.js';

const TEXT = Object.freeze({
  heading: 'Readiness and maturity',
  readinessHeading: 'Readiness across five categories',
  framework: 'Framework:',
  answers: 'Answers from the team',
  finding: 'Finding',
  maturityHeading: 'Maturity of each foresight practice',
  level: 'Level:',
  pendingLevels: 'Level names pending verification against the WEF/OECD report.',
  pendingNext: 'Pending: the next complement depends on the verified level definitions.',
  nextHeading: 'What the WEF/OECD report describes for the next level',
  nextLevel: 'Next level:',
  noLevelAbove: 'The report describes no level above this one.',
  notAdvice: "These are the report's descriptions of the next level. They are not advice from this demo.",
  withheld: 'The readiness profile was withheld because its content failed validation.',
  toGovernance: 'Read the governance statement: what is and is not implemented in this demo',
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

/** A report or framework citation as its own labelled element (`real` unless the content says otherwise). */
function citation(doc, ref, lead, label = 'real') {
  const p = el(doc, 'p', 'citation');
  if (lead) p.appendChild(doc.createTextNode(`${lead} `));
  p.appendChild(renderSource(ref));
  return labelled(p, label);
}

function hasKeysInOrder(list, keys) {
  return Array.isArray(list) && list.length === keys.length && list.every((item, i) => item && item.key === keys[i]);
}

/** Whether the profile can be shown in the verified view with these level names. */
function isVerified(maturity, levelNames) {
  if (maturity.status !== 'verified') return false;
  const names = Array.isArray(levelNames) ? levelNames : [];
  return maturity.practices.every((p) => names.includes(p.levelName));
}

// ------------------------------------------------------------------------------------------ F3-S1

function profileSection(doc, profile) {
  const section = el(doc, 'section', 'readiness-profile');
  const head = el(doc, 'header', 'profile-head');
  head.append(el(doc, 'h2', '', TEXT.readinessHeading), el(doc, 'p', 'profile-subject', profile.subject));
  section.appendChild(head);

  const fw = profile.framework;
  // The framework citation carries the framework's own label (real).
  section.appendChild(citation(doc, fw.citation, `${TEXT.framework} ${fw.name}.`, fw.label));

  const list = el(doc, 'ul', 'card-list');
  for (const c of profile.categories) {
    const item = el(doc, 'li', 'card category');
    item.setAttribute('data-category', c.key);
    item.appendChild(el(doc, 'h3', '', c.name));
    item.appendChild(el(doc, 'h4', '', TEXT.answers));
    const dl = el(doc, 'dl', 'answers');
    for (const a of c.answers) dl.append(el(doc, 'dt', '', a.question), el(doc, 'dd', '', a.answer));
    item.append(dl, el(doc, 'h4', '', TEXT.finding), el(doc, 'p', 'finding', c.finding));
    list.appendChild(item);
  }
  section.appendChild(list);
  // The profile, the team's answers and the findings are fictional (C-5); the badge sits in the header.
  return labelled(section, profile.label, head);
}

// ------------------------------------------------------------------------------------------ F3-S2

function unverifiedMaturity(doc, maturity) {
  const area = el(doc, 'section', 'maturity');
  area.setAttribute('data-area', 'maturity');
  area.appendChild(el(doc, 'h2', '', TEXT.maturityHeading));
  const list = el(doc, 'ul', 'card-list');
  for (const p of maturity.practices) {
    const item = el(doc, 'li', 'card practice');
    item.setAttribute('data-practice', p.key);
    item.append(el(doc, 'h3', '', p.name));
    const level = el(doc, 'p', '');
    level.append(doc.createTextNode(`${TEXT.level} `), el(doc, 'code', 'placeholder', LEVEL_NAME_PLACEHOLDER));
    item.appendChild(level);
    list.appendChild(item);
  }
  area.append(list, el(doc, 'p', 'note', TEXT.pendingLevels));
  const next = el(doc, 'div', 'next-level note', TEXT.pendingNext);
  next.setAttribute('data-area', 'next-level');
  area.appendChild(next);
  return area;
}

// ------------------------------------------------------------------------------------------ F3-S2v

function verifiedMaturity(doc, maturity) {
  const area = el(doc, 'section', 'maturity');
  area.setAttribute('data-area', 'maturity');
  area.appendChild(el(doc, 'h2', '', TEXT.maturityHeading));
  const list = el(doc, 'ul', 'card-list');
  for (const p of maturity.practices) {
    const item = el(doc, 'li', 'card practice');
    item.setAttribute('data-practice', p.key);
    const h3 = el(doc, 'h3', '', p.name);
    const level = el(doc, 'p', '');
    level.append(doc.createTextNode(`${TEXT.level} `), el(doc, 'strong', '', p.levelName));
    const explanation = labelled(el(doc, 'p', 'explanation', p.explanation.text.text), p.explanation.text.label);
    item.append(h3, level, explanation, citation(doc, p.explanation.citation));
    // The level assignment is part of the fictional account (C-5).
    list.appendChild(labelled(item, 'fictional', h3));
  }
  area.appendChild(list);

  const next = el(doc, 'div', 'next-level');
  next.setAttribute('data-area', 'next-level');
  next.appendChild(el(doc, 'h3', '', TEXT.nextHeading));
  const nextList = el(doc, 'ul', 'card-list');
  for (const p of maturity.practices) {
    const item = el(doc, 'li', 'card next-level-item');
    const h4 = el(doc, 'h4', '', p.name);
    item.appendChild(h4);
    const n = p.nextLevel;
    if (n && n.description) {
      const name = el(doc, 'p', '');
      name.append(doc.createTextNode(`${TEXT.nextLevel} `), el(doc, 'strong', '', n.levelName));
      const description = labelled(el(doc, 'p', 'description', n.description.text), n.description.label);
      const source = el(doc, 'p', 'citation');
      source.appendChild(renderSource(n.citation));
      item.append(name, description, source);
    } else {
      item.appendChild(el(doc, 'p', '', TEXT.noLevelAbove));
      if (n && n.noLevelAboveCitation) {
        const source = el(doc, 'p', 'citation');
        source.appendChild(renderSource(n.noLevelAboveCitation));
        item.appendChild(source);
      }
    }
    // The report's level names and its citations are real; each description carries its own label.
    nextList.appendChild(labelled(item, 'real', h4));
  }
  next.append(nextList, el(doc, 'p', 'note', TEXT.notAdvice));
  area.appendChild(next);
  return area;
}

// ------------------------------------------------------------------------------------------ the screen

/**
 * renderReadiness(root, ctx, { levelNames }): F3-S1 with F3-S2 or F3-S2v, or F3-E1. Resolves when
 * the screen has rendered.
 */
export async function renderReadiness(root, ctx, { levelNames = MATURITY_LEVEL_NAMES } = {}) {
  const doc = root.ownerDocument;
  root.appendChild(el(doc, 'h1', '', TEXT.heading));
  const loaded = await ctx.loader.loadReadiness();
  const profile = loaded && loaded.ok === true ? loaded.value : null;
  const ok =
    profile &&
    hasKeysInOrder(profile.categories, READINESS_CATEGORY_KEYS) &&
    profile.maturity &&
    hasKeysInOrder(profile.maturity.practices, PRACTICE_KEYS) &&
    (profile.maturity.status === 'unverified' || isVerified(profile.maturity, levelNames));
  if (!ok) {
    root.appendChild(el(doc, 'p', 'notice', TEXT.withheld));
    return;
  }

  root.appendChild(profileSection(doc, profile));
  root.appendChild(profile.maturity.status === 'verified' ? verifiedMaturity(doc, profile.maturity) : unverifiedMaturity(doc, profile.maturity));

  const link = el(doc, 'p');
  const a = el(doc, 'a', '', TEXT.toGovernance);
  a.setAttribute('href', ctx.routes.governance());
  link.appendChild(a);
  root.appendChild(link);
}
