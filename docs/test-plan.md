# Test plan — the right arm of the V

**Status: planned for G2 by the Test Engineer on 5 October 2026, applying Miguel's G2 decisions of
4 October 2026 (Q-2, Q-6, Q-7, DM-1, DM-9) and the Level 4 module design of 5 October 2026. Owner:
Test Engineer. Gate: G2. The shared test harness and all twenty M1 unit tests are written; the unit
tests for M2 to M10 follow, on the same harness, before each module's Implementer starts. None of
the JavaScript tests has yet been run under Node, because no Node runtime is installed on the build
machine (F-9); they have been run in the browser runner, in headless Chrome, from a local static
server (see "What has been run so far").**

Each level of testing verifies its mirror on the left arm of the V, and every test is written from
the specification before the artefact it tests is built. This document says what is tested at each
level, how the tests are run, which tests are expected to fail at G2 and why, and what has actually
been run.

| Level | Verifies | Method | Pass criterion |
|---|---|---|---|
| Unit | Level 4 module design (M1 to M10) | One test file per module in `tests/unit/`, written from the unit-test tables of `04-module-design.md`, each test named by its identifier | Every test passes, or is skipped for a reason the plan names |
| Integration | Level 3 architecture | The content (synthetic fixtures before G3, `data/` after) is loaded into every screen and validated against the contracts; the NF1 matrix of browsers and origins | Every module validates; every screen renders without an error state; the NF1 matrix holds |
| System | Level 2 requirements | A scripted walk of F1 to F5 at the four Q-7 viewports, and the six-point invariant audit | The walk completes at every viewport; all six audit points hold |
| Rehearsal (before acceptance) | Level 1 requirements | An agent reviews the demo as a hiring manager would | Findings fixed or consciously accepted before G5 |
| Acceptance (G5) | Level 1 requirements | Two to three people unfamiliar with the project walk the demo unaided; NF4 timed as in Q-6 | Within the time budget, each can say in one sentence what makes the demo different from a signal digest, and each reaches a committed judgement within eight minutes of opening a trend card |

## How the tests are run

### One test file, two runners

Every test file runs unchanged in two places: under `node --test`, from the repository root, and in
the browser runner `tests/run.html`. This is the "write once, run in both" contract of
`04-module-design.md`, implemented as follows.

- **Registration.** A test file registers its tests through `test(name, options, fn)` from
  `tests/lib/harness.mjs`, and asserts with `tests/lib/assert.mjs` (`ok`, `equal`, `notEqual`,
  `deepEqual`, `match`, `includes`, `notIncludes`, `throws`, `rejects`, `fail`, and `none`, which
  fails once with a list of every problem found, so that an audit reports all its findings rather
  than the first). Under Node the harness hands each test to `node:test`; in the browser it collects
  them for the runner. A test's name must begin with its identifier (`M1-U6 …`, `AUDIT-5 …`,
  `INT-…`, `SYS-…`); the harness refuses any other name, so an untraceable test cannot exist.
- **Needs and skips.** A test declares what it cannot run without: `dom` (a real DOM, browser
  only), `fs` (Node: directory listings, child processes), `data` (`CONTENT_FROZEN` is true in
  `tests/lib/stage.mjs`, from the G3 freeze commit), `verified` (the frozen readiness profile is
  verified, D-1) and `questions` (`SCENARIO_FLOW` is `'interactive'`, O-1). An unmet need turns the
  test into a skip whose reason is printed: "needs data/ (G3)", "maturity unverified (D-1)",
  "SCENARIO_FLOW is static (O-1)", "needs Node: directory listing or child process", or "needs a
  real DOM". A skip is never counted as a pass; both runners show it with its reason.
- **Code under test is imported inside the test.** A test file imports only `tests/lib/` statically.
  It imports the module under test with `importUnderTest(repoUrl('assets/js/…'))` inside the test
  body, so that a missing module fails that test with "module under test could not be imported:
  <path> … expected before implementation (test-first rule)" while the file's other tests still run.
  `tests/unit/index.mjs` lists every test file and the browser runner imports each one separately,
  so one file that cannot load is reported as a failed row instead of blanking the run.
- **No `fetch()`, no XMLHttpRequest, anywhere.** `CLAUDE.md` forbids network calls at runtime and
  DM-11, which would let test tooling read files by same-origin requests, is still open. Until
  Miguel decides it, the tests load JSON (the schemas, the pipeline fixtures) with ES import
  attributes, `import … with { type: 'json' }`, and JavaScript modules with `import()`; neither is a
  request of the tests' own making and both work in current Node and Chromium. A test that must read
  a file's raw text (static audits, byte-for-byte comparisons) reads it through `readText()` in
  `tests/lib/env.mjs`, which uses `node:fs` under Node and, in the browser, skips with "needs Node or
  DM-11". Such a test therefore runs in full only under Node until DM-11 is decided.
- **Versions.** Node 22.7 or later is needed: the repository has no `package.json` (there is no
  package manager), so Node must recognise the `.js` fixtures and data modules as ES modules by
  their syntax, which it does by default from 22.7; JSON import attributes are also needed. In the
  browser, a current Chromium or Firefox. `tests/run.html` is a module page: it needs a static origin
  (a local static server, or the published site, which serves `tests/`), and from `file://` in
  Chromium it shows a notice that it has not started. No demo page links to it.
- **Running.** `node --test` from the repository root finds `tests/unit/*.test.mjs` by Node's
  default pattern and never loads a `*.browser.mjs` DOM test. In the browser, open
  `tests/run.html`; `?filter=M1-U6` runs only the tests whose names begin with that text. The
  runner prints a row per test (identifier, result, name, reason) and a summary line.

### Shared tooling in `tests/lib/`

| File | What it provides |
|---|---|
| `harness.mjs` | `test`, `skip`, `Skip`, `REASONS`, `unmetNeed`; the browser registry and `runRegistered` |
| `assert.mjs` | The project's own assertions (above) |
| `env.mjs` | `IS_NODE`, `IS_BROWSER`, `REPO_ROOT`, `repoUrl`, `repoPath`, `importUnderTest`, `importJson`, `readText`, `listFiles`, `exists`, `nodeBuiltin` |
| `skip.mjs` | The `Skip` signal and the standard skip reasons |
| `stage.mjs` | `CONTENT_FROZEN`, false until the G3 freeze commit |
| `mini-schema.mjs` | The dependency-free JSON Schema interpreter for the keywords `schemas/` uses; throws on any other keyword (M1-U7) |
| `schemas.mjs` | Every contract in `schemas/`, loaded by import attributes; `contractValidator()`; which schema validates which `data/` module |
| `content.mjs` | The content source: `loadContent({ from: 'fixtures' \| 'data' })`, `loadSession()`, `clone()` |
| `contract-rules.mjs` | The banned name tokens of M1-U2, name tokenising, walkers over schemas and values |
| `canonical.mjs` | Canonical JSON and its SHA-256, as the freeze step and the Verifier define them |
| `seeded-random.mjs` | `seededRandom(seed)` (Mulberry32), `permute`, `permutations` |
| `candidate-level-names.mjs` | The three unverified candidate level names, their only home outside the docs (M1-U18) |
| `files.mjs` | The file inventory of `assets/`, `schemas/` and `index.html`, for audits the browser runs (M10-U9 keeps it complete) |

Still to be written, by whoever writes the first test that needs them: `dom.mjs` (`mount()`,
`appFrame()`, storage stubs) and `tests/app-host.html` for the screen and whole-app tests of M5 to
M10, and `tests/fixtures/briefs/scanning-brief.md` for M3-U3.

### Fixtures

Synthetic test data lives in `tests/fixtures/`. Every text in it is visibly fake: sources are
`https://example.org/fixture/…`, publishers are "Example Gazette" and the like, and every string
carries a `zebra-…` marker so that leak tests can search for it. The one real address is the
WEF/OECD report's DOI in the verified readiness fixture, because M7-U9 requires it. Every
JavaScript fixture begins with `// Fictional test data for Periscope unit tests. Never imported by
the page.`

- `content/` mirrors `data/`: a manifest, six signals (two on the same date, one German-language
  source, one outside the scanning window, one quote of exactly fifteen words), two trends
  (`trend-fixture-alpha`, `trend-fixture-beta`) sharing one signal, their reveal bundles and
  conversation modules, the brief, an unverified and a verified readiness profile (with the
  synthetic level names "Fixture level one" to "Fixture level three"), the governance container,
  and three log entries (one with two original signals; original signals on both replay-window
  boundary dates).
- `session/`: a valid Judgement and ScenarioRecord.
- `pipeline/`: the same entities as raw pipeline output, with a verification record whose hashes
  are the entities' canonical SHA-256; `expected-data/`: the exact files the freeze core must
  produce from it. These two are JSON and frozen-module text, so they cannot carry the fixture
  header line; their content is the same synthetic data.
- `invalid/bad-schema.json`: a schema using `exclusiveMinimum`, for M1-U7. Each later test that
  needs a named invalid case adds its own module here.

## Unit level

The unit tests are those of `04-module-design.md`, by identifier, in `tests/unit/<module>.test.mjs`
(pure, both runners) and `tests/unit/<module>.browser.mjs` (DOM, browser runner only).

| Module | Tests | Files | Written |
|---|---|---|---|
| M1 Data contracts | M1-U1 to M1-U20 | `m1-contracts.test.mjs` (U1 to U10, U12, U15, U17 to U20), `m1-freeze.test.mjs` (U11, U13, U14, U16) | 5 Oct 2026 |
| M2 to M10 | As in `04-module-design.md` | As named there | Not yet: each before its module's Implementer starts |

Where a test has a part that runs on the synthetic fixtures and a part that asserts on `data/`, the
two are registered as separate tests with the same identifier, the second with `needs: ['data']`.
The fixture part keeps running after G3, so the fixtures stay valid; the data part is reported as
skipped before G3 and fails after G3 if `data/` is missing or wrong. In the same way, M1-U6, M1-U8
and M1-U17 register their schema side and their `validate.js` side separately, so that the schema
side, which depends only on `schemas/`, is proved at G2.

## Integration level

Integration tests verify the Level 3 architecture: that the pieces the modules produce fit
together through the contracts and the loader, and that the static-site design holds in real
browsers. They will live in `tests/integration/`, named `INT-…`.

- **Content into every screen.** Every content module (the synthetic fixtures before G3, `data/`
  after) is loaded through the real M1 loader into the app host, every screen is rendered, and
  every module is validated against its schema. Pass: no validation error, no error state on any
  screen, no console error.
- **The NF1 matrix** (`03-architecture.md`, section 9). The demo makes no network request of its
  own; this matrix establishes where it runs.

| Origin | Browser | Expected result |
|---|---|---|
| Local static server, offline | Current Chromium (Chrome or Edge) | F1 to F5 complete; every entry in `performance.getEntriesByType('resource')` is a file of the site itself |
| Local static server, offline | Current Firefox | The same |
| `file://` | Current Firefox | F1 to F5 complete; no network request |
| `file://` | Current Chromium | `G-E1` shown with its `file://` sentence; nothing else renders; no network request |
| `file://` | Safari | Not covered: no macOS machine in the toolchain |

The result of each row is recorded in `03-architecture.md`, section 9, once it has run.

## System level

System tests verify the Level 2 requirements end to end on the built page. They will live in
`tests/system/`, named `SYS-…` and `AUDIT-<n>`.

- **Scripted walk of F1 to F5 at the four Q-7 viewports**: 360 × 640 and 390 × 844 in portrait,
  1280 × 800 and 1440 × 900 in landscape. At each viewport: the brief, a signal's trend link, a trend
  card, a gut reading recorded, the three readings, the interrogation (one question answered, the
  rest skipped), a judgement committed with a rationale, the scenario route (interactive or the
  static `F5-ST`, whichever the build has), readiness, governance and the decision log. Pass: every
  step reachable by clicking, no horizontal scrolling, every control within the viewport.
- **Q-2, the readings' order.** In the app host the order is fixed by a seed:
  `start({ random: seededRandom(seed) })` makes the gut-reading options, the three readings and the
  judgement options follow `drawLensOrder(seededRandom(seed))`; with seeds 1 to 200 all six orders
  occur. On the real page, which uses `Math.random`, the walk checks that the order is the same on
  every visit to a trend within one page load, that the note "The three readings are peers. Their
  order is random and means nothing." is present, and that the three reading elements share one
  template.
- **The invariant audit**, below, run on the built page and the shipped files.

## Invariant audit — run at every gate from G3

A gate fails if any of these is false. Each point is a test, `AUDIT-1` to `AUDIT-6`, and the
governance screen's "implemented" statements may cite them.

1. **No ranking.** No `score`, `rank`, `confidence` or `priority` field, nor any near synonym from
   M1-U2, exists in any schema, fixture or rendered element; no schema declares a number, integer
   or boolean; no screen presents a "best option" or an ordered recommendation; the three readings
   appear in a random order with identical templates.
2. **Intuition before AI.** No AI reading is reachable in the DOM or in module state before the
   intuition step is recorded. Checked on the page by reading `performance.getEntriesByType('resource')`
   in `F1-S1`, which must hold no `data/reveal/` entry; the same for F5, where `F5-S1` must hold no
   `data/conversation/` entry.
3. **A judgement requires a rationale.** "Commit judgement" is disabled until the rationale holds a
   non-whitespace character.
4. **Every factual claim is sourced.** Every claim resolves to a dated source, and no unverifiable
   claim survives (every shipped entity has a `pass` verdict whose hash matches, M1-U16).
5. **Honest labelling.** Every content element carries a label from the six-value vocabulary,
   `real` | `ai-generated` | `frozen` | `fictional` | `replay` | `yours` (`yours` added by DM-1, for
   what the viewer enters), both as a `data-label` attribute and as a visible badge; and each label
   is correct under C-5, not merely present, which the Red-team Reviewer judges at G3 and G4.
6. **No network.** No `fetch`, `XMLHttpRequest`, CDN link, remote font or remote image appears
   anywhere in the shipped files (`index.html`, `assets/`, `data/`).

## NF4, timed as decided in Q-6

NF4's eight minutes time the core loop only. The clock starts at the first display of `F1-S1` for
the trend the viewer chooses and stops when that trend reaches `F1-S4`, the committed judgement.
Time on the weekly brief, which is the entry screen (DM-7), is not counted, nor is time on F3, F4 or
F5. The agent rehearsal times one walk the same way before G5; at G5 each of the two to three
viewers is timed. Pass: every viewer reaches `F1-S4` within eight minutes of first seeing `F1-S1`.

## Tests expected to fail at G2, and why

At G2 no page or pipeline code exists, so every test that imports it fails. That is the test-first
rule working, not a defect, and no such test may be weakened to pass. Each failure names its cause;
the list below says which cause to expect, so that an open dependency is never mistaken for a
defect and a real defect is never mistaken for an open dependency. A test not listed here is
expected to pass at G2 (status T), or to be skipped with a named reason.

**M1 (written).**

| Test | Expected at G2 | Named cause |
|---|---|---|
| M1-U5 | Fail | `assets/js/contracts/vocabulary.js` and `constants.js` not implemented |
| M1-U6, `validate.js` side | Fail | `assets/js/contracts/validate.js` not implemented |
| M1-U8, `checkTrend` side | Fail | `validate.js` not implemented |
| M1-U10 | Fail | `validate.js` not implemented |
| M1-U11, core | Fail | `pipeline/freeze-core.mjs` not implemented |
| M1-U11, Node driver | Fail under Node; skipped in the browser ("needs Node") | `pipeline/freeze.mjs` not implemented |
| M1-U12 | Fail | `assets/js/contracts/load.js` not implemented |
| M1-U13, both fixture parts | Fail | `pipeline/freeze-core.mjs` not implemented |
| M1-U15 | Fail | `constants.js` not implemented |
| M1-U17, `checkGovernance` side | Fail | `validate.js` not implemented |
| M1-U18, `MATURITY_LEVEL_NAMES` | Fail | `vocabulary.js` not implemented |
| M1-U19 | Fail | `validate.js` not implemented |
| M1-U20 | Fail | `validate.js` not implemented |
| Every M1 part with `needs: ['data']`, and M1-U16 | Skipped | "needs data/ (G3)" |
| M1-U7 listing, M1-U13 byte comparison, M1-U14 | Pass under Node; skipped in the browser | "needs Node" or "needs Node or DM-11" |

**M2 to M10 (to be written; expected status once written, from `04-module-design.md`).**

| Tests | Expected at G2 | Named cause |
|---|---|---|
| M2-U1 to M2-U5 | Fail | The Cowork briefs (`persona-dossier.md`, `scanning-brief.md`, `replay-candidates.md`) are not yet in `pipeline/briefs/` (D-2) |
| M3-U4, M4-U8, M8-U2 | Fail | `constants.js` not implemented |
| M5-U1 to M5-U3, M5-U5 to M5-U11 | Fail | `assets/js/screens/brief.js` and M1, M9, M10 not implemented |
| M6-U1 to M6-U26 | Fail | `assets/js/screens/trend*.js`, `scenario.js` and `assets/js/state/*` not implemented |
| M7-U1 (screen part), M7-U2 to M7-U5, M7-U7, M7-U8, M7-U11 | Fail | `assets/js/screens/readiness.js` and `governance.js` not implemented |
| M8-U3 to M8-U6, M8-U9, M8-U10 | Fail | `assets/js/screens/log.js` not implemented |
| M9-U1 to M9-U9 | Fail | `assets/js/honesty/*` not implemented |
| M10-U1 | Fail | The seeded placeholder `index.html` contains `fetch()` in its explanatory comment ("no fetch() or XHR at runtime"), which the literal audit matches. The comment goes when M10 replaces the placeholder; the audit is not to be relaxed |
| M10-U3, M10-U5 to M10-U8 | Fail | `assets/js/main.js` is a placeholder and `tests/app-host.html` does not exist |
| M10-U4 | Fail | `assets/js/shell/*` not implemented; also, the placeholder `assets/js/main.js` mentions `data/` in a comment, which only `contracts/load.js` may do |
| Every G3, V and Q part | Skipped | "needs data/ (G3)", "maturity unverified (D-1)", "SCENARIO_FLOW is static (O-1)" |

Integration and system tests cannot run before the page exists (L5, after G2), so none is expected
to run at G2.

## What has been run so far

No Node runtime is installed on the build machine, so nothing has run under `node --test`. On
5 October 2026 the browser runner was run in headless Chrome, from a local static server, against
the repository as committed: of the 42 M1 test registrations, 14 passed, 13 failed, each naming the
missing M1 or pipeline module, and 15 were skipped, each with its reason. The same run against
throwaway reference implementations of the M1 modules, served from outside the repository, passed
every test that the browser can run; and against deliberately broken implementations (a validator
that accepts everything, a loader that imports any identifier, wrong constants, a freeze core that
always succeeds, a schema with a `rankScore` integer and an open object) every corresponding test
failed with a specific message. The expected-data fixtures were checked byte for byte against the
reference freeze core's output, and the fixtures' SHA-256 hashes against the browser's Web Crypto.
The Node-only parts (directory listings, the freeze driver, raw-text reads) are unexecuted until
Node is installed (F-9) or DM-11 is decided.
