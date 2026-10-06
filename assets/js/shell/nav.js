// M10 UI shell: the main navigation (C-4, last row; M10-U7). Five items, Brief, Trends,
// Readiness, Governance, Decision log, in that fixed order on every screen, built from one
// template. No scenario item (the scenario route is reached from a committed trend card), no
// count, no badge, no "new" marker. The only thing that changes between screens is aria-current
// on the item for the screen being shown, which is navigation state, not emphasis of content.

import { routes } from './routes.js';

const ITEMS = Object.freeze([
  Object.freeze({ text: 'Brief', href: routes.brief(), section: 'brief' }),
  Object.freeze({ text: 'Trends', href: routes.trends(), section: 'trends' }),
  Object.freeze({ text: 'Readiness', href: routes.readiness(), section: 'readiness' }),
  Object.freeze({ text: 'Governance', href: routes.governance(), section: 'governance' }),
  Object.freeze({ text: 'Decision log', href: routes.log(), section: 'log' }),
]);

/** The navigation element, built once by the shell and kept across screens. */
export function renderNav(doc) {
  const nav = doc.createElement('nav');
  nav.className = 'main-nav';
  nav.setAttribute('aria-label', 'Main');
  const list = doc.createElement('ul');
  for (const item of ITEMS) {
    const li = doc.createElement('li');
    const a = doc.createElement('a');
    a.setAttribute('href', item.href);
    a.textContent = item.text;
    li.appendChild(a);
    list.appendChild(li);
  }
  nav.appendChild(list);
  return nav;
}

/**
 * Marks the item of `section` ('brief', 'trends', 'readiness', 'governance', 'log', or null for a
 * screen that belongs to none) with aria-current="page" and clears it from the others.
 */
export function markCurrent(nav, section) {
  const links = nav.querySelectorAll('a');
  ITEMS.forEach((item, i) => {
    const a = links[i];
    if (!a) return;
    if (item.section === section) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}
