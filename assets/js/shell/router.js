// M10 UI shell: the shell frame and the hash router (C-3, C-7; docs/03-architecture.md, section
// 7.2).
//
// The shell is built once: a header with the main navigation, the screen area, and a footer with
// the demo-wide statement (M9), so that the navigation and the statement stay visible on every
// screen, the not-found screen G-E2 included. Each navigation renders one screen module into a
// fresh element; the session object lives in the screen context for the whole page load, so
// moving between screens (including back and forward) never loses it.
//
// Routes: an empty fragment and #/brief show the brief (DM-7); #/trends, #/trend/<id>,
// #/scenario/<id>, #/readiness, #/governance and #/log their screens; anything else G-E2. A trend
// identifier taken from the fragment is handed to the screen, which checks it against the trend
// list and the identifier pattern before it is used for anything (F1-E1); the loader checks it
// again before building a module path (M1-U12).
//
// Context (docs/04-module-design.md, M5 "Interface"): every screen receives { loader, routes,
// manifest }; the M6 screens (trend index, trend card, scenario) also receive session, flow and
// now. The readiness screen receives the levelNames option.

import { routes } from './routes.js';
import { renderNav, markCurrent } from './nav.js';
import { renderDemoStatement } from '../honesty/statement.js';
import { renderBrief } from '../screens/brief.js';
import { renderTrendIndex } from '../screens/trend-index.js';
import { renderTrend } from '../screens/trend.js';
import { renderScenario } from '../screens/scenario.js';
import { renderReadiness } from '../screens/readiness.js';
import { renderGovernance } from '../screens/governance.js';
import { renderLog } from '../screens/log.js';

const NOT_FOUND_TEXT = 'This page does not exist in this build.';
const NOT_FOUND_LINK = 'Open the weekly brief';
const SCREEN_FAILED_TEXT = 'This screen could not be shown in this build.';

const SIMPLE = Object.freeze({
  '#/brief': 'brief',
  '#/trends': 'trends',
  '#/readiness': 'readiness',
  '#/governance': 'governance',
  '#/log': 'log',
});

function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * The screen a fragment addresses: { name, section, trendId? }. `name` is one of brief, trends,
 * trend, scenario, readiness, governance, log, not-found; `section` is the navigation item to mark
 * as current, or null. Pure.
 */
export function parseRoute(hash) {
  const h = typeof hash === 'string' ? hash : '';
  if (h === '' || h === '#' || h === '#/') return Object.freeze({ name: 'brief', section: 'brief' });
  if (Object.prototype.hasOwnProperty.call(SIMPLE, h)) return Object.freeze({ name: SIMPLE[h], section: SIMPLE[h] });
  const m = /^#\/(trend|scenario)\/([^/]+)$/.exec(h);
  if (m) return Object.freeze({ name: m[1], section: 'trends', trendId: decodeSegment(m[2]) });
  return Object.freeze({ name: 'not-found', section: null });
}

function renderNotFound(root) {
  const doc = root.ownerDocument;
  const p = doc.createElement('p');
  p.className = 'notice';
  p.textContent = NOT_FOUND_TEXT;
  const back = doc.createElement('p');
  const a = doc.createElement('a');
  a.setAttribute('href', routes.brief());
  a.textContent = NOT_FOUND_LINK;
  back.appendChild(a);
  root.append(p, back);
}

/** Builds the shell inside `app` and returns its parts. */
function buildShell(app, manifest) {
  const doc = app.ownerDocument;
  const header = doc.createElement('header');
  header.className = 'site-header';
  const brand = doc.createElement('div');
  brand.className = 'brand';
  brand.textContent = 'Periscope';
  const nav = renderNav(doc);
  header.append(brand, nav);

  const main = doc.createElement('main');
  main.className = 'screen-host';

  const footer = doc.createElement('footer');
  footer.className = 'site-footer';
  footer.appendChild(renderDemoStatement(manifest));

  app.replaceChildren(header, main, footer);
  return { nav, main };
}

/**
 * createRouter({ win, app, loader, manifest, session, flow, now, levelNames }) builds the shell in
 * `app` and returns { start }. start() renders the screen of the current fragment, listens for
 * fragment changes, and resolves once that first screen has rendered.
 */
export function createRouter({ win, app, loader, manifest, session, flow, now, levelNames }) {
  const ctx = Object.freeze({ loader, routes, manifest });
  const m6ctx = Object.freeze({ loader, routes, manifest, session, flow, now });
  const { nav, main } = buildShell(app, manifest);
  const doc = app.ownerDocument;
  let current = 0;

  function renderScreen(route, root) {
    switch (route.name) {
      case 'brief': return renderBrief(root, ctx);
      case 'trends': return renderTrendIndex(root, m6ctx);
      case 'trend': return renderTrend(root, m6ctx, route.trendId);
      case 'scenario': return renderScenario(root, m6ctx, route.trendId);
      case 'readiness': return renderReadiness(root, ctx, { levelNames });
      case 'governance': return renderGovernance(root, ctx);
      case 'log': return renderLog(root, ctx);
      default: return renderNotFound(root);
    }
  }

  async function show(hash) {
    current += 1;
    const token = current;
    const route = parseRoute(hash);
    const root = doc.createElement('div');
    root.className = 'screen';
    main.replaceChildren(root);
    markCurrent(nav, route.section);
    if (typeof win.scrollTo === 'function') win.scrollTo(0, 0);
    try {
      await renderScreen(route, root);
    } catch (error) {
      // A screen handles its own error states; an exception here is a defect. Say so plainly
      // rather than leave a blank screen, and keep the details for the console.
      console.error(error);
      if (token === current) {
        const p = doc.createElement('p');
        p.className = 'notice';
        p.textContent = SCREEN_FAILED_TEXT;
        root.replaceChildren(p);
      }
    }
  }

  async function start() {
    win.addEventListener('hashchange', () => {
      show(win.location.hash);
    });
    await show(win.location.hash);
  }

  return Object.freeze({ start });
}
