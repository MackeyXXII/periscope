# Test plan — the right arm of the V

**Status: planned for G2 by the Test Engineer on 5 October 2026, applying Miguel's G2 decisions of
4 October 2026 (Q-2, Q-6, Q-7, DM-1, DM-9), his decisions of 5 October 2026 (F5 ships as the static
screen `F5-ST`; DM-11 not needed; F-9 resolved) and the Level 4 module design as revised on
5 October 2026 for the Red-team Reviewer's G2 findings B1, B2, B4, B5 and N3 to N8. Owner: Test
Engineer. Gate: G2. The shared test harness and the unit tests of all ten modules, M1 to M10, are
written. On 5 October 2026 the whole suite was run under `node --test` (Node v24.21.0) against the
repository as it stands; the result, and the cause of every failure, are below ("Tests expected to
fail at G2, and why").**

Each level of testing verifies its mirror on the left arm of the V, and every test is written from
the specification before the artefact it tests is built. This document says what is tested at each
level, how the tests are run, which tests are expected to fail at G2 and why, and what has actually
been run.

| Level | Verifies | Method | Pass criterion |
|---|---|---|---|
| Unit | Level 4 module design (M1 to M10) | One test file per module in `tests/unit/`, written from the unit-test tables of `04-module-design.md`, each test named by its identifier | Every test passes, or is skipped for a reason the plan names |
| Integration | Level 3 architecture | The content (synthetic fixtures before G3, `data/` after) is loaded into every screen and validated against the contracts; the NF1 matrix of browsers and origins | Every module validates; every screen renders without an error state; the NF1 matrix holds |
| System | Level 2 requirements | A scripted walk of F1 to F4 and the static `F5-ST` at the four Q-7 viewports, and the six-point invariant audit | The walk completes at every viewport; all six audit points hold |
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
  verified, D-1) and `deferred` (never met in this release). An unmet need turns the test into a
  skip whose reason is printed: "needs data/ (G3)", "maturity unverified (D-1)", "Deferred (F5
  static, decision of 5 Oct 2026)", "needs Node: directory listing or child process", or "needs a
  real DOM". A skip is never counted as a pass; both runners show it with its reason. The earlier
  need `questions` and its reason "SCENARIO_FLOW is static (O-1)" are retired with the Q status: the
  harness now refuses `questions` as an unknown need.
- **Deferred tests.** F5 ships in this release as the static screen `F5-ST`; the interactive F5 is
  designed but not built. Its tests stay in their files, written from `04-module-design.md`, and
  are skipped with exactly "Deferred (F5 static, decision of 5 Oct 2026)", so that they neither fail
  on modules that will not exist nor pass silently. Whole tests: M1-U19, M4-U10, M4-U11, M6-U18 to
  M6-U23, M6-U25 and M6-U26 (M6-U21 includes the B4 refusal case, written although deferred).
  Deferred parts, registered as separate tests with the same identifier: the `loadConversation`
  part of M1-U12, the validator half of the conversation and scenario-record mutants of M1-U6, and
  the pure `scenarioMode` part of M6-U24. M7-U6 treats any deferred test named in a `verifiedBy`
  list as unknown, because a deferred test verifies nothing in this release.
- **Code under test is imported inside the test.** A test file imports only `tests/lib/` statically.
  It imports the module under test with `importUnderTest(repoUrl('assets/js/…'))` inside the test
  body, so that a missing module fails that test with "module under test could not be imported:
  <path> … expected before implementation (test-first rule)" while the file's other tests still run.
  `tests/unit/index.mjs` lists every test file and the browser runner imports each one separately,
  so one file that cannot load is reported as a failed row instead of blanking the run.
- **No `fetch()`, no XMLHttpRequest, anywhere.** `CLAUDE.md` forbids network calls at runtime, and
  the tests keep to the same rule: DM-11, which would have let the test tooling read files by
  same-origin requests, was recorded as not needed on 5 October 2026, so there is no `fetch()` in
  `tests/` either. The tests load JSON (the schemas, the pipeline fixtures) with ES import
  attributes, `import … with { type: 'json' }`, and JavaScript modules with `import()`. A test that
  must read a file's raw text (static audits, the Markdown briefs, byte-for-byte comparisons, the
  module design itself) reads it through `readText()` in `tests/lib/env.mjs`, which uses `node:fs`
  under Node and, in the browser, skips with the reason "needs Node". Such a test runs in full only
  under Node, which is the primary runner.
- **Node.** Node is installed on the build machine (v24.21.0, checked on 5 October 2026; F-9
  resolved) and `node --test` from the repository root is the primary runner. Node 22.7 or later is
  needed: the repository has no `package.json` (there is no package manager), so Node must recognise
  the `.js` fixtures and data modules as ES modules by their syntax, which it does by default from
  22.7, and must load JSON through import attributes. The DOM tests still need a real browser.
- **Browser.** A current Chromium or Firefox. `tests/run.html` is a module page: it needs a static
  origin (a local static server, or the published site, which serves `tests/`), and from `file://`
  in Chromium it shows a notice that it has not started. No demo page links to it.
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
| `skip.mjs` | The `Skip` signal and the standard skip reasons, including "Deferred (F5 static, decision of 5 Oct 2026)" and "needs Node" |
| `stage.mjs` | `CONTENT_FROZEN`, false until the G3 freeze commit |
| `mini-schema.mjs` | The dependency-free JSON Schema interpreter for the keywords `schemas/` uses; throws on any other keyword (M1-U7) |
| `schemas.mjs` | Every contract in `schemas/`, loaded by import attributes; `contractValidator()`; which schema validates which `data/` module |
| `content.mjs` | The content source: `loadContent({ from: 'fixtures' \| 'data' })`, `loadSession()`, `clone()` |
| `contract-rules.mjs` | The core banned name tokens of M1-U2, name tokenising, walkers over schemas and values (M1-U2's extended N3 tokens live in the test file itself, as the design requires) |
| `text-rules.mjs` | The C-6 terms, relevance levels, lens words and advice words of M3 and M4; whole-word matching; the six-word shared-run check |
| `briefs-md.mjs` | Reading and parsing the Markdown briefs of M2 (Named entities tables, the Window line, replay candidates) |
| `strip-comments.mjs` | The comment scanner of the static audits (M10-U1, M10-U2, M10-U4), aware of string literals |
| `canonical.mjs` | Canonical JSON and its SHA-256, as the freeze step and the Verifier define them |
| `seeded-random.mjs` | `seededRandom(seed)` (Mulberry32), `permute`, `permutations` |
| `candidate-level-names.mjs` | The three unverified candidate level names, their only home outside the docs (M1-U18) |
| `files.mjs` | The file inventory of `assets/`, `schemas/` and `index.html`, for audits the browser runs (M10-U9 keeps it complete, ignoring paths with a segment that begins with a dot) |
| `dom.mjs` | `mount()`, `appFrame()`, storage stubs and DOM queries for the screen and whole-app tests |
| `screens.mjs` | The fixture loader with spies, the screen context, the DOM-hook vocabulary and the F1 walk helpers |

`tests/app-host.html` (the app host for whole-app tests, with the same static elements as
`index.html`), `tests/run.html` (the browser runner) and `tests/fixtures/briefs/scanning-brief.md`
(the synthetic scanning brief for M3-U3) exist.

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
  conversation modules (kept as contract samples for M1-U1 and M1-U9, although `data/` has none in
  this release), the brief, an unverified and a verified readiness profile (with the synthetic
  level names "Fixture level one" to "Fixture level three"; every maturity explanation is
  `{ text, label: 'ai-generated' }`, B1), the governance container (every item of both lists with
  a non-empty `verifiedBy` naming only tests that are not deferred, N5), and three log entries (one
  with two original signals; original signals on both replay-window boundary dates). Beside them,
  outside the manifest, sits `governance-argument-withheld.js`: a copy of `governance.js` with
  `argument: []` and both lists unchanged, added on 5 October 2026 for N6 option (b). It is a valid
  sample for M1-U6 and the content M7-U12 renders; it has no pipeline or expected-data counterpart,
  because M1-U13 compares the standard set only.
- `session/`: a valid Judgement and ScenarioRecord.
- `pipeline/`: the same entities as raw pipeline output, with a verification record whose hashes
  are the entities' canonical SHA-256; `expected-data/`: the exact files the freeze core must
  produce from it. These two are JSON and frozen-module text, so they cannot carry the fixture
  header line; their content is the same synthetic data. The pipeline and expected readiness
  profiles are unverified (`explanation: null`), so B1 left them unchanged. On 5 October 2026 the
  governance container gained its not-implemented `verifiedBy` in all three places; the
  expected-data module was regenerated (canonical key order, two-space JSON, the fixed header line,
  one trailing newline), not hand-edited, and the governance hash in `verification.json` was
  recomputed with `tests/lib/canonical.mjs`. All 24 recorded hashes were then checked against
  their entities and match.
- `invalid/`: one module per named invalid case, used by the tests that name it, and
  `bad-schema.json`, a schema using `exclusiveMinimum`, for M1-U7.
- `briefs/`: the synthetic scanning brief for M3-U3.

## Unit level

The unit tests are those of `04-module-design.md`, by identifier, in `tests/unit/<module>.test.mjs`
(pure, both runners) and `tests/unit/<module>.browser.mjs` (DOM, browser runner only).

| Module | Tests | Files | Written |
|---|---|---|---|
| M1 Data contracts | M1-U1 to M1-U20 | `m1-contracts.test.mjs` (U1 to U10, U12, U15, U17 to U20), `m1-freeze.test.mjs` (U11, U13, U14, U16) | 5 Oct 2026 |
| M2 Persona and scanning brief | M2-U1 to M2-U5 | `m2-briefs.test.mjs` | 5 Oct 2026 |
| M3 Scan pipeline | M3-U1 to M3-U6 | `m3-signals.test.mjs` | 5 Oct 2026 |
| M4 Interpretation pipeline | M4-U1 to M4-U11 | `m4-interpretation.test.mjs` | 5 Oct 2026 |
| M5 Brief composer | M5-U1 to M5-U11 | `m5-brief.test.mjs`, `m5-brief.browser.mjs` | 5 Oct 2026 |
| M6 Judgement and scenario capture | M6-U1 to M6-U26 | `m6-judgement.test.mjs`, `m6-judgement.browser.mjs`, `m6-scenario.test.mjs`, `m6-scenario.browser.mjs` | 5 Oct 2026 |
| M7 Readiness and maturity | M7-U1 to M7-U12 | `m7-readiness.test.mjs`, `m7-readiness.browser.mjs` | 5 Oct 2026 |
| M8 Decision log and replay | M8-U1 to M8-U10 | `m8-log.test.mjs`, `m8-log.browser.mjs` | 5 Oct 2026 |
| M9 Honesty and provenance layer | M9-U1 to M9-U9 | `m9-honesty.test.mjs`, `m9-honesty.browser.mjs` | 5 Oct 2026 |
| M10 UI shell and navigation | M10-U1 to M10-U9 | `m10-shell.test.mjs`, `m10-shell.browser.mjs` | 5 Oct 2026 |

All were brought in line with the Level 4 revision of 5 October 2026 on the same day: the N3
extended tokens in M1-U2; the B1 and N5 mutants in M1-U6; `SCENARIO_FLOW` exactly `'static'` in
M1-U15; the B1 cases in M1-U20; the N4 lens words in relevance notes in M3-U6; the B4 state-level
refusals in M6-U3, M6-U5 and (deferred) M6-U21; the static `F5-ST` test M6-U24, with the Level 2
sentence "In this build the scenario step is described only: there is nothing to write here, and
no conversation questions were prepared for this release."; `verifiedBy` on both lists in M7-U5
and M7-U6; the B1 explanation label in M7-U8, M7-U10 and M9-U6; the two B5 phrases and the four
forbidden phrases in M8-U4; the walk through `F5-ST` in M9-U1; M10-U4's rule that
`loadConversation` is named nowhere and `assets/js/state/scenario.js` does not exist; and, for the
Red-team finding B3, M10-U9's rule that paths with a segment beginning with a dot are ignored.

Later on 5 October 2026 the tests were brought in line with N6 option (b), decided by Miguel the
same day: an empty governance `argument` is valid and ships as `F3-S3a`. M1-U6 gained the mutant
"governance `argument` property removed" (the property stays required) and the valid sample
`governance-argument-withheld.js`, which both `mini-schema.mjs` and `checkGovernance` must accept;
the `validate.js` side also guards that this sample is present. The new browser test M7-U12
renders that sample and asserts both lists with their `verifiedBy`, exactly one
`data-area="governance-argument-withheld"` element holding, verbatim, "The argument for own-data
ingestion is not shown in this build because its claims did not pass verification." with no
`data-content` or `data-label`, no `data-area="governance-argument"`, no argument heading, nothing
labelled or badged `ai-generated`, and no `F3-E2` sentence; and, with the standard fixture, that the
withheld element is absent. M7-U11's note now says that `F3-E2` must never ship and that a fully
struck argument leads to `F3-S3a`, not to `F3-E2`.

Where a test has a part that runs on the synthetic fixtures and a part that asserts on `data/`, the
two are registered as separate tests with the same identifier, the second with `needs: ['data']`.
The fixture part keeps running after G3, so the fixtures stay valid; the data part is reported as
skipped before G3 and fails after G3 if `data/` is missing or wrong. In the same way, M1-U6, M1-U8
and M1-U17 register their schema side and their `validate.js` side separately, so that the schema
side, which depends only on `schemas/`, is proved at G2; and a test with a deferred part registers
that part separately with `needs: ['deferred']`.

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
| Local static server, offline | Current Chromium (Chrome or Edge) | F1 to F4 and `F5-ST` complete; every entry in `performance.getEntriesByType('resource')` is a file of the site itself |
| Local static server, offline | Current Firefox | The same |
| `file://` | Current Firefox | F1 to F4 and `F5-ST` complete; no network request |
| `file://` | Current Chromium | `G-E1` shown with its `file://` sentence; nothing else renders; no network request |
| `file://` | Safari | Not covered: no macOS machine in the toolchain |

The result of each row is recorded in `03-architecture.md`, section 9, once it has run.

## System level

System tests verify the Level 2 requirements end to end on the built page. They will live in
`tests/system/`, named `SYS-…` and `AUDIT-<n>`.

- **Scripted walk of F1 to F4 and `F5-ST` at the four Q-7 viewports**: 360 × 640 and 390 × 844 in
  portrait, 1280 × 800 and 1440 × 900 in landscape. At each viewport: the brief, a signal's trend
  link, a trend card, a gut reading recorded, the three readings, the interrogation (one question
  answered, the rest skipped), a judgement committed with a rationale, the scenario route (the
  static `F5-ST`, the only F5 screen in this release), readiness, governance and the decision log.
  Pass: every step reachable by clicking, no horizontal scrolling, every control within the
  viewport.
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
governance screen's "implemented" and "not implemented" statements may cite them.

1. **No ranking.** No `score`, `rank`, `confidence` or `priority` field, nor any near synonym from
   M1-U2, exists in any schema, fixture or rendered element; no schema declares a number, integer
   or boolean; no screen presents a "best option" or an ordered recommendation; the three readings
   appear in a random order with identical templates.
2. **Intuition before AI.** No AI reading is reachable in the DOM or in module state before the
   intuition step is recorded. Checked on the page by reading `performance.getEntriesByType('resource')`
   in `F1-S1`, which must hold no `data/reveal/` entry; and on `F5-ST`, which must hold no
   `data/conversation/` entry. (The earlier check in `F5-S1` is deferred with the interactive F5.)
3. **A judgement requires a rationale.** "Commit judgement" is disabled until the rationale holds a
   non-whitespace character, and `commitJudgement` itself refuses a draft without one (B4).
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
the lists below say which cause to expect, so that an open dependency is never mistaken for a
defect and a real defect is never mistaken for an open dependency. A test registration not listed
here passes at G2 or is skipped with a named reason.

### Under `node --test` after M5 to M8 (run on 6 October 2026, later)

This is the current record. Later on 6 October 2026, with the M5 weekly brief screen, the M6 state
modules (`assets/js/state/session.js`, `assets/js/state/lens-order.js`) and screens, the M7
readiness and governance screens and the M8 decision log screen committed, the suite was run under
`node --test` from the repository root with Node v24.21.0: 137 test registrations, **88 pass,
0 fail, 49 skipped** (37 "needs data/ (G3)", 12 "Deferred (F5 static, decision of 5 Oct 2026)").

Before this run M10-U9 failed, exactly as designed: the new files under `assets/js/state/` and
`assets/js/screens/` were on disk but not in `SHIPPED_FILES`. `tests/lib/files.mjs` now lists the
twenty files under `assets/` plus `index.html`, matched against the directory listing, and M10-U9
passes. No test was changed to obtain this result; only the inventory was brought up to date. The
14 failures of the earlier 6 October run below all now pass, because the modules they named exist.

The 49 skipped registrations are not passes. The 37 "needs data/ (G3)" tests run against the
frozen content once it lands at G3, and the browser-only tests (`*.browser.mjs`) are not counted
by `node --test` at all; they must be run in `tests/run.html` before G4.

### Under `node --test` after M1, M9 and M10 (run on 6 October 2026)

This is an earlier record and is kept as it was; the current state is the later run above.

On 6 October 2026, with M1 (contracts and freeze), M9 (honesty and provenance) and the M10 shell
committed and the Cowork briefs delivered, the suite was run under `node --test` from the
repository root with Node v24.21.0: 137 test registrations, **74 pass, 14 fail, 49 skipped**
(37 "needs data/ (G3)", 12 "Deferred (F5 static, decision of 5 Oct 2026)"). Every one of the 14
failures is listed here with the cause it reports; no other test fails. Each is an L5 module not
yet built, reported by Node as `ERR_MODULE_NOT_FOUND` for the named file.

| Test registration | Named cause |
|---|---|
| M5-U3 | `assets/js/screens/brief.js` not implemented (M5) |
| M6-U3 (three registrations: `canCommit`, `whatIsMissing`, the B4 refusals), M6-U5 (two: the B4 refusals, the frozen record), M6-U6, M6-U8, M6-U13 | `assets/js/state/session.js` not implemented (M6) |
| M6-U7 (four registrations) | `assets/js/state/lens-order.js` not implemented (M6) |
| M8-U3 | `assets/js/screens/log.js` not implemented (M8) |

M10-U9 passes on this run because `tests/lib/files.mjs` was brought up to date in the same change
with the twelve files then under `assets/` plus `index.html`. It is designed to fail again the
moment `assets/js/state/*.js` and `assets/js/screens/*.js` land, until whoever adds them adds them
to `SHIPPED_FILES` in the same change.

### Under `node --test` at G2 (run on 5 October 2026, re-run after the N6 option (b) changes)

This is the G2 record and is kept as it was; the current state is the 6 October run above.

137 test registrations: **50 pass, 38 fail, 49 skipped** (37 "needs data/ (G3)", 12 "Deferred (F5
static, decision of 5 Oct 2026)"). Every one of the 38 failures is listed here with the cause it
reports; no other test fails. The N6 option (b) changes leave these counts unchanged: the new M1-U6
sample and mutant sit inside the two existing M1-U6 registrations (the schema side passes with
them; the `validate.js` side fails, as before, on the missing `validate.js`), and M7-U12 is a
browser test, so Node does not register it.

| Test registration | Named cause |
|---|---|
| M1-U5 | `assets/js/contracts/vocabulary.js` not implemented |
| M1-U6, `validate.js` side | `assets/js/contracts/validate.js` not implemented |
| M1-U8, `checkTrend` side | `validate.js` not implemented |
| M1-U10 | `validate.js` not implemented |
| M1-U11, core | `pipeline/freeze-core.mjs` not implemented |
| M1-U11, Node driver | `pipeline/freeze.mjs` not implemented ("module under test is missing") |
| M1-U12, `loadReveal` part | `assets/js/contracts/load.js` not implemented |
| M1-U13, deterministic output against the expected values | `pipeline/freeze-core.mjs` not implemented |
| M1-U13, byte-for-byte against `tests/fixtures/expected-data/` | `pipeline/freeze-core.mjs` not implemented |
| M1-U15 | `assets/js/contracts/constants.js` not implemented |
| M1-U17, `checkGovernance` side | `validate.js` not implemented |
| M1-U18, `MATURITY_LEVEL_NAMES` | `vocabulary.js` not implemented |
| M1-U20 | `validate.js` not implemented |
| M2-U1, M2-U3 | `pipeline/briefs/persona-dossier.md` does not exist: the Cowork briefs are not yet delivered (D-2) |
| M2-U4 | `pipeline/briefs/scanning-brief.md` does not exist (D-2) |
| M2-U5 | `pipeline/briefs/replay-candidates.md` does not exist (D-2) |
| M3-U4, M4-U8, M5-U1, M8-U2 (each its fixture part) | `constants.js` not implemented |
| M5-U3 | `assets/js/screens/brief.js` not implemented |
| M6-U3 (three registrations: `canCommit`, `whatIsMissing`, the B4 refusals), M6-U5 (two: the B4 refusals, the frozen record), M6-U6, M6-U8, M6-U13 | `assets/js/state/session.js` not implemented |
| M6-U7 (four registrations) | `assets/js/state/lens-order.js` not implemented |
| M8-U3 | `assets/js/screens/log.js` not implemented |
| M9-U2, `formatDate` part | `assets/js/honesty/sources.js` not implemented |
| M10-U3, static part | The seeded placeholder `index.html` has no element `id="startup-failure"` |
| M10-U4 | `assets/js/shell/router.js`, `shell/routes.js` and `shell/nav.js` not implemented (the test refuses to pass on the placeholder) |

Passing at G2, as status T and the seeded audits require: among others every schema-side test of
M1 (U1, U2, U3, U4, U6 schema side, U7, U8 schema side, U9, U17 schema side, U18 schema and file
parts), M1-U14 on the expected data, the fixture parts of M3, M4, M5-U4, M7-U1, U6, U9, U10 and
M8-U1, U7 and U8, and M10-U1, M10-U2 and M10-U9. M10-U1 passes on the seeded placeholder files:
their comments mention `fetch()`, and the audit removes comments before matching, as Level 4
specifies. M10-U9 passes because `schemas/.gitkeep`, a path with a segment that begins with a dot,
is ignored (B3).

### In the browser runner (`tests/run.html`)

Not run since this revision. Expected: every `*.browser.mjs` test that is not deferred fails with
"module under test could not be imported", naming the missing screen, state, honesty, shell or M1
module (M5-U2, M5-U5 to M5-U11; M6-U1, U2, U4, U9 to U12, U14 to U17 and the page parts of U3 to
U7; the built part of M6-U24; M7-U1 screen part to M7-U5, M7-U7, M7-U8, M7-U11, M7-U12 (the
latter naming the missing `assets/js/screens/governance.js` or M1 loader); M8-U4 to M8-U6,
M8-U9, M8-U10; M9-U1 to M9-U9; M10-U3 start-up part and M10-U5 to M10-U8). The deferred browser
tests (M6-U18 to M6-U23, M6-U25, M6-U26) are skipped with the deferred reason. The pure tests behave
as under Node, except that every test reading raw file text (M1-U13 byte comparison, M1-U14, M1-U18
file part, M2, M3-U3, M7-U6 design-document part, M8-U8 page-code part, M10-U1, M10-U2, M10-U3
static part, M10-U4) is skipped with "needs Node", and the `fs` tests (M1-U7 listing, M1-U11
driver, M1-U14 listing, M10-U9) with "needs Node: directory listing or child process".

Integration and system tests cannot run before the page exists (L5, after G2), so none is expected
to run at G2.

## What has been run so far

On 5 October 2026 the browser runner was run in headless Chrome, from a local static server, against
the M1 tests as then committed, and against throwaway reference implementations of the M1 modules
served from outside the repository, which passed every test the browser could run; deliberately
broken implementations (a validator that accepts everything, a loader that imports any identifier,
wrong constants, a freeze core that always succeeds, a schema with a `rankScore` integer and an open
object) made every corresponding test fail with a specific message.

Later on 5 October 2026, after this revision, the whole suite was run under `node --test` from the
repository root with Node v24.21.0: 137 registrations, 50 passed, 38 failed and 49 were skipped.
Every failure reports exactly the cause listed in the table above, and every cause in that table
was observed. The Node-only parts ran for the first time: the directory listings (M1-U7, M1-U14,
M10-U9) pass; the freeze driver test (M1-U11) fails on the missing `pipeline/freeze.mjs`; the
raw-text audits (M10-U1, M10-U2, M1-U18) pass on the seeded files. The regenerated governance
fixtures were checked by recomputing every canonical SHA-256 in `tests/fixtures/pipeline/verification.json`
against its entity (24 of 24 match) and by a byte-for-byte round trip of the expected-data module.

After the N6 option (b) changes the suite was run again under `node --test`: 137 registrations,
50 passed, 38 failed, 49 skipped, and the 38 failures are exactly those in the table above, each
with its listed cause. The M1-U6 schema side passes with the empty-argument sample accepted and the
removed-`argument` mutant rejected. M7-U12 has not yet been run in the browser runner; it parses
(`node --check`) and is expected to fail on the missing governance screen until L5.

On 6 October 2026, after M1, M9 and the M10 shell were committed, the suite was run again under
`node --test`: 137 registrations, 74 passed, 14 failed, 49 skipped. The 14 failures are exactly
those in the 6 October table above, all caused by the M5, M6 and M8 modules not yet built
(`screens/brief.js`, `state/session.js`, `state/lens-order.js`, `screens/log.js`). M10-U9 passes
after `SHIPPED_FILES` was updated to the files then on disk.

Later on 6 October 2026, after the M5 to M8 screens and the M6 state modules were committed,
M10-U9 failed on the files under `assets/js/state/` and `assets/js/screens/` missing from
`SHIPPED_FILES`, as it was designed to. With the inventory updated, the suite was run again under
`node --test`: 137 registrations, 88 passed, 0 failed, 49 skipped (37 needing data/, 12 deferred
F5 tests).
