// M10 UI shell: start-up (docs/04-module-design.md, M10 "Lives in"; docs/03-architecture.md,
// sections 6.1 and 7.1).
//
// index.html calls start() with no argument, so the page always uses the M1 loader with its own
// importer, Math.random, the build's SCENARIO_FLOW and the vocabulary's level names. Only the test
// app host (tests/app-host.html) passes options. Frozen content is never imported here: start-up
// needs only the freeze manifest, through the loader, the one gate to the data modules.
//
// The static start-up failure message (G-E1) in index.html stays on screen unless start-up
// succeeds: it is removed only after the shell and the first screen have rendered. If the manifest
// cannot be loaded, start() rejects and the message stays. Nothing is attached to window and no
// handle on the session is returned: start() resolves to undefined.

import { createLoader } from './contracts/load.js';
import { SCENARIO_FLOW } from './contracts/constants.js';
import { MATURITY_LEVEL_NAMES } from './contracts/vocabulary.js';
import { createSession } from './state/session.js';
import { createRouter } from './shell/router.js';

export async function start({ loader, random = Math.random, flow = SCENARIO_FLOW, levelNames = MATURITY_LEVEL_NAMES } = {}) {
  const doc = document;
  const app = doc.getElementById('app');
  if (!app) throw new Error('Periscope could not start: the page has no #app element.');
  const contentLoader = loader || createLoader({ levelNames });
  const freeze = await contentLoader.loadFreeze();
  if (!freeze || freeze.ok !== true) {
    throw new Error(`Periscope could not start: the freeze manifest was not loaded (${freeze && freeze.reason}).`);
  }
  const session = createSession({ random });
  const router = createRouter({
    win: doc.defaultView,
    app,
    loader: contentLoader,
    manifest: freeze.value,
    session,
    flow,
    now: () => new Date().toISOString(),
    levelNames,
  });
  await router.start();
  const failure = doc.getElementById('startup-failure');
  if (failure) failure.remove();
  return undefined;
}
