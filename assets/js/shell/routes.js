// M10 UI shell: the route strings (C-7; docs/03-architecture.md, section 7.2). The leaf file of
// M10 and the only M10 file the screen modules may import; it imports nothing (M10-U4).
//
// Screens link to each other by these strings, never by calling another screen. A route carries
// only the screen address, never anything the viewer typed (M6-U14). Trend identifiers are checked
// against the trend list by the screen that receives them, not here.

function idSegment(id, what) {
  if (typeof id !== 'string' || id === '') throw new TypeError(`routes.${what}: ${JSON.stringify(id)} is not an identifier`);
  return encodeURIComponent(id);
}

export function brief() {
  return '#/brief';
}

export function trends() {
  return '#/trends';
}

export function trend(trendId) {
  return `#/trend/${idSegment(trendId, 'trend')}`;
}

export function scenario(trendId) {
  return `#/scenario/${idSegment(trendId, 'scenario')}`;
}

export function readiness() {
  return '#/readiness';
}

export function governance() {
  return '#/governance';
}

export function log() {
  return '#/log';
}

/** The same functions as one object: the `routes` key of the screen context. */
export const routes = Object.freeze({ brief, trends, trend, scenario, readiness, governance, log });
