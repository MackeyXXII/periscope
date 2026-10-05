# Level 4 — Module design

**Status: designed by the Architect on 19 September 2026; revised on 5 October 2026 to apply
Miguel's G2 decisions of 4 October 2026, the Q-5 outcome of 5 October 2026 and the revised Level 2
(F5 added). Awaiting G2. Owner: Architect (design) and Test Engineer (paired unit tests).**

Ten modules implement the five flows. F5 is part of M6 (`03-architecture.md`, section 12, A-11),
so there is no M11. Each unit test below is written by the Test Engineer **before** the Implementer
opens that module. The design decisions behind these modules are in `03-architecture.md`; this
document states, for each module, what it takes in, what it produces, which entities it touches,
what it may import, where it lives, and the one invariant it is most likely to break. It then lists
every unit test precisely enough to be written from this text alone: its identifier, what it
asserts and when it fails, its inputs and fixtures, the runner it needs, and its expected status
before G3.

## Summary

| Module | Purpose | Runs | Seeded unit test (kept) |
|---|---|---|---|
| M1 Data contracts | Schemas, vocabulary and constants, runtime validator, data loader, freeze step | Offline and in the page | All fixtures validate against the schemas |
| M2 Persona and scanning brief | Scenario ground truth | Offline (Cowork) | Every named competitor and regulation is real and dated |
| M3 Scan pipeline | Scout output into signals | Offline | Every signal has a URL, a date and a summary |
| M4 Interpretation pipeline | Trends, rival readings, interrogation and conversation questions | Offline | Exactly three readings per trend; each has a disconfirming condition; no `score` or `rank` field exists |
| M5 Brief composer | R1 attention budget, F2 screen | Offline and in the page | No more than five signals; estimated reading time 10 minutes or less |
| M6 Judgement and scenario capture | F1 (intuition first, random peer order, commit with rationale) and F5 (own scenario first, then questions) | In the page | AI readings stay out of the page until intuition is recorded; commit disabled without a rationale |
| M7 Readiness and maturity | F3 and the governance screen | In the page | All five readiness categories present; `LEVEL_NAME_UNVERIFIED` until the level names are verified |
| M8 Decision log and replay | F4 | In the page | Every replay entry carries a dated, real outcome source |
| M9 Honesty and provenance layer | NF2 and NF3 in the page | In the page | Every content element carries its label from the six-value vocabulary |
| M10 UI shell and navigation | Click path across F1 to F5 | In the page | No external network requests at runtime |

## Conventions for every test below

- **Identifiers.** `M<n>-U<k>`. The seeded tests keep their meaning and are marked *(seeded)*. A
  test's name in the runner output begins with its identifier, for example
  `M6-U7 readings appear in the seeded random order`.
- **Runner.** *both* means a plain ES module test that runs under `node --test` and from the
  browser runner `tests/run.html`. *browser* means it needs a real DOM and runs only from
  `tests/run.html`. *node* means it needs a file-system listing or a child process and runs only
  under Node; in the browser runner it is reported as skipped with that reason. The contract that
  lets one file run in both is at the end of this document. A *both* test that reads a file as raw
  text (the static audits, the Markdown briefs, byte-for-byte comparisons, this document) is
  reported in the browser as skipped with the reason "needs Node or DM-11" until Miguel decides
  DM-11; JSON and modules load in both runners without that restriction.
- **Fixtures.** Synthetic content lives in `tests/fixtures/`, each file headed
  `// Fictional test data for Periscope unit tests. Never imported by the page.` It contains
  distinctive marker strings (for example `zebra-alpha-opportunity-text`) so that leak tests can
  search for them. The layout is:
  - `tests/fixtures/content/`: modules in the shape of `data/` (`freeze.js`, `signals.js`,
    `trends.js`, `brief.js`, `reveal/<trendId>.js`, `conversation/<trendId>.js`,
    `readiness-unverified.js`, `readiness-verified.js`, `governance.js`, `log.js`). At least two
    trends (`trend-fixture-alpha`, `trend-fixture-beta`) sharing one signal; six signals including
    two with the same publication date and one German-language source; three log entries, one of
    them with two original signals.
  - `tests/fixtures/invalid/`: one module per named invalid case, used by the tests that name it.
  - `tests/fixtures/session/`: a valid `judgement.js` and `scenario-record.js`.
  - `tests/fixtures/pipeline/` and `tests/fixtures/expected-data/`: input and expected output of the
    freeze core.
  - `tests/fixtures/briefs/`: a small synthetic scanning brief, so that M3-U3 can run before the
    Cowork briefs exist.
- **Content source.** `tests/lib/content.mjs` returns the synthetic fixtures while
  `CONTENT_FROZEN` in `tests/lib/stage.mjs` is `false`, and `data/` once the Orchestrator sets it to
  `true` in the G3 freeze commit. A content test that finds `data/` missing after that fails.
- **Constants.** `assets/js/contracts/constants.js` holds the values Miguel fixed on 4 October
  2026 (DM-9): `BRIEF_SIGNAL_CAP = 5` (a maximum), `READING_WPM = 200`, `QUOTE_MAX_WORDS = 15`,
  `REPLAY_WINDOW_START = '2026-01-01'`, `REPLAY_WINDOW_END = '2026-03-31'`,
  `QUESTIONS_PER_GROUP_MAX = 3`; and the build switch `SCENARIO_FLOW`, `'static'` until O-1 is
  closed. Tests import them; none hard-codes a value except M1-U15, which checks them.
- **Level names.** `MATURITY_LEVEL_NAMES` in `assets/js/contracts/vocabulary.js` is an empty frozen
  array until the Verifier has re-opened p. 9 and Miguel has set the status to verified (D-1). Tests
  of the verified case inject synthetic names (`Fixture level one`, `Fixture level two`,
  `Fixture level three`) through the `levelNames` option. The three candidate names from the thesis
  live only in `tests/lib/candidate-level-names.mjs`, for M1-U18.
- **Status before G3.** At G2 no page or pipeline code exists, so every test that imports it fails
  with a missing-module error: that is the test-first rule working. The status column says what
  remains true *after* the module is implemented:
  - **T**: depends only on test tooling, fixtures and `schemas/`; can pass at G2.
  - **I**: passes once the module under test is implemented, against the synthetic fixtures.
  - **G3**: also asserts on `data/`; that part is skipped with the reason "needs data/ (G3)" until
    `CONTENT_FROZEN`, and fails afterwards if `data/` is absent or wrong.
  - **B**: needs the Cowork outputs in `pipeline/briefs/` (D-2); fails, naming the missing file,
    until they exist.
  - **V**: has a verified-maturity part against `data/`, skipped with the reason "maturity
    unverified (D-1)" while the frozen profile is unverified.
  - **Q**: has a conversation-questions part against `data/`, skipped with the reason
    "SCENARIO_FLOW is static (O-1)" while the switch is `'static'`.

## DOM hooks: the one vocabulary every screen uses

Tests find elements by these attributes and by the exact visible texts Level 2 fixes, never by
class names or position. The Implementer adds them; no other `data-` attribute is needed by any
test. Hooks are behaviour-free: no CSS selects on them except `data-badge`, and they carry no
content beyond the identifiers shown.

| Attribute | Placed on | Values |
|---|---|---|
| `data-content` | Every rendered content element (C-5): an entity, or a part with its own label | present, no value |
| `data-label` | The same element as `data-content`, and only there: the honesty label of that element | one of the six vocabulary values |
| `data-badge` | The visible badge returned by `renderLabel`, inside its content element (for a form control, beside it within the same wrapper) | the same vocabulary value; never `data-label` |
| `data-area` | A screen region | `readings`, `interrogation`, `judgement`, `what-you-wrote`, `conversation-questions`, `signals`, `entries`, `maturity`, `next-level`, `governance-implemented`, `governance-not-implemented`, `governance-argument` |
| `data-control` | A lens control: a group of `<input type="radio" value="<lens>">` | `gut-call`, `judgement` |
| `data-reading` | One reading element | its lens |
| `data-question` | One interrogation question (F1) or conversation question (F5) | its question `id` |
| `data-field` | A text field the viewer types into; answer and note fields also carry `data-question-id="<questionId>"` | `reason`, `answer`, `rationale`, `heard`, `playout`, `note` |
| `data-echo` | A read-only echo of the viewer's entry (`F1-S4`, F5) | `gut-call`, `reason`, `answer`, `committed-lens`, `rationale`, `heard`, `playout` |
| `data-hint` | The line saying what is still missing | `commit`, `scenario` |
| `data-signal` | One signal element in the brief | its signal `id` |
| `data-entry` | One log entry element | its entry `id` |
| `data-practice` | One practice in the maturity view | its practice key |
| `data-category` | One readiness category | its category key |

These ratify the hooks the M6, M8 and M9 tests assumed (`tests/lib/screens.mjs`), add the ones the
other screens need, and replace the `data-region` attribute named earlier for M7 with `data-area`,
so that there is one region attribute. Buttons and links are found by their exact visible text.

**Labels and badges.** `data-label` marks the labelled element, `data-badge` the badge that shows
it. Because the badge never carries `data-label`, a count of `data-label` values is a count of
labelled elements, which makes M9-U9 unambiguous.

**Withheld notices, singular and plural.** Level 2 writes these notices as "N signal(s) …" and
"N entr(y/ies) …", a notation for both numbers. The page renders proper English:

| Notice | N = 1 | N > 1 |
|---|---|---|
| `F2-W1` | "1 signal was withheld because it failed the provenance check." | "N signals were withheld because they failed the provenance check." |
| `F4-W1` | "1 entry was withheld because it lacked a dated outcome source or failed validation." | "N entries were withheld because they lacked a dated outcome source or failed validation." |

Checked against C-6: neither contains a forbidden or advisory term, and neither ranks anything; the
count is of withheld items, computed at runtime, as `03-architecture.md` section 5.1 allows. The
Requirements Engineer is asked to confirm this reading (C-R8).

---

## M1 Data contracts

| | |
|---|---|
| **Purpose** | Define what every piece of content must look like, prove every fixture conforms before it ships, and guard the invariants again at the moment the page loads content. The only module that touches `data/`. |
| **Inputs** | The pipeline's raw JSON in `pipeline/output/` and the Verifier's record (for the freeze core); the frozen modules in `data/` (for the loader); session records from M6 (for the validator). |
| **Outputs** | `schemas/*.json`; the ES modules in `data/`, written once at G3; for the page, validated and deep-frozen content, or a typed failure the calling screen turns into its error state; verdicts on in-session records. |
| **Entities touched** | All nine entities (Signal, Trend, Reading, Interrogation, Judgement, ReadinessProfile, LogEntry, ConversationQuestions, ScenarioRecord) and all four containers. |
| **May import** | Nothing outside M1. Within M1, `load.js` and `validate.js` import `vocabulary.js` and `constants.js`. The freeze core imports only `tests/lib/mini-schema.mjs`; the Node driver also imports Node built-ins. |
| **Lives in** | `schemas/*.json`; `assets/js/contracts/vocabulary.js`, `constants.js`, `validate.js`, `load.js`; `pipeline/freeze-core.mjs`, `pipeline/freeze.mjs`, `pipeline/freeze.html`. Tooling: `tests/lib/mini-schema.mjs`. Tests: `tests/unit/m1-contracts.test.mjs`, `tests/unit/m1-freeze.test.mjs`. |
| **Invariant most at risk** | **Invariant 1, no ranking.** A contract that admits one extra field, one numeric type or one ordinal enumeration lets every agent downstream carry a ranking into the demo with the schema's blessing. The closed-object, no-number and allowlisted-enumeration rules exist to shut this off. |

**Interface.** `vocabulary.js` exports `LABELS` (six), `LABEL_DISPLAY` (value to badge text),
`LENSES` (alphabetical), `PRODUCERS`, `MATURITY_STATUSES`, `READINESS_CATEGORY_KEYS`,
`PRACTICE_KEYS`, `BANNED_NAME_TOKENS`, `ID_PATTERNS`, `LEVEL_NAME_PLACEHOLDER`
(`'LEVEL_NAME_UNVERIFIED'`) and `MATURITY_LEVEL_NAMES`. `validate.js` exports one check per entity
and container, each returning `{ ok: true }` or `{ ok: false, errors }` (`errors` an array of
messages) and never throwing, even on `undefined` or a value of the wrong type. The signatures
adopt the provisional ones the Test Engineer used in `tests/unit/m1-contracts.test.mjs`, which are
sound: a check takes the record and, where a rule spans two records, the record it must agree with.

| Function | Checks, beyond the record's own shape, labels and banned keys |
|---|---|
| `checkSignal(signal)` | URL, publisher, both dates, summary, relevance note; quote within `QUOTE_MAX_WORDS` |
| `checkBrief(brief)` | Container shape; at most `BRIEF_SIGNAL_CAP` identifiers. Per-signal checks are `checkSignal`'s; resolution of identifiers is the screen's (`F2-S2`) |
| `checkTrend(trend, signals)` | Three references, one per lens; non-empty title, summary, intuition prompt; every `signalId` resolves in `signals` (the Signal array) |
| `checkRevealBundle(bundle, trend)` | Three Readings whose lenses and identifiers match `trend`'s references; `trendId`s equal `trend.id`; evidence, counter-evidence, disconfirming condition; one to three questions per group |
| `checkConversation(set, trend)` | `trendId` equals `trend.id`; one to three questions, each ending with "?" |
| `checkReadiness(profile, { levelNames = MATURITY_LEVEL_NAMES } = {})` | Five categories, three practices, the placeholder rule; once verified, names in `levelNames`, the lower-level and next-level rules |
| `checkGovernance(container)` | Required items, `verifiedBy` present, argument labels `ai-generated`, container label `real` |
| `checkLogEntry(entry)` and `checkLog(log)` | Per entry: replay window, outcome after signals, K-7 date order; for the log, an array |
| `checkJudgement(judgement)` | Intuition present, timestamp order, rationale, label `yours`, session provenance |
| `checkScenarioRecord(record, judgement)` | Both fields, `recordedAt` after `judgement.committedAt`, same `trendId`, label `yours` |
| `checkFreezeManifest(manifest)` | `frozenOn` and `pipelineRunOn` are ISO dates; `modules` is a non-empty, duplicate-free list of paths matching the manifest pattern and includes `data/freeze.js`. A failure is treated by `loadFreeze` like a failed import: `G-E1` |
| `findBannedKeys(value)` | Returns the paths of every key, at any depth, containing a banned token |
`load.js` exports `createLoader({ importer, levelNames = MATURITY_LEVEL_NAMES } = {})` (`levelNames`
is passed to `checkReadiness`; see M7), returning `loadFreeze()`, `loadSignals()`,
`loadTrends()`, `loadBrief()`, `loadReadiness()`, `loadGovernance()`, `loadLog()`,
`loadReveal(trendId)` and `loadConversation(trendId)`. Each resolves to `{ ok: true, value }` with a
deep-frozen value, or `{ ok: false, reason, withheld }`, and never throws. Per-item checks that
withhold single items (signals in F2, entries in F4) return the valid items plus a count of
withheld ones. `loadReveal` and `loadConversation` build a path only from an identifier that matches
the trend identifier pattern and appears in the loaded trend list. `freeze-core.mjs` exports
`freeze({ inputs, verification, schemas, frozenOn, pipelineRunOn })`, resolving to
`{ ok: true, files }` (a `Map` from repository path to file text) or `{ ok: false, errors }`. The
shape of each argument, the order of arrays in the output, the manifest's order and the driver's
command line (`node pipeline/freeze.mjs [--frozen-on YYYY-MM-DD] [--pipeline-run-on YYYY-MM-DD]`,
run from the repository root) are fixed in `03-architecture.md`, section 4, adopting the
provisional interface of `tests/unit/m1-freeze.test.mjs`.

| ID | What is asserted, and when it fails | Inputs and fixtures | Runner | Status |
|---|---|---|---|---|
| M1-U1 *(seeded)* | Every content module validates against its schema using `mini-schema.mjs`: each element of `signals`, `trends` and `log`; `brief`, `readiness`, `governance`, `freeze`; every reveal and conversation module listed in the manifest; and the session samples against `judgement.schema.json` and `scenario-record.schema.json`. Fails on any validation error, reported with file and path. | Content source; `tests/fixtures/session/`; `schemas/` | both | T, G3 |
| M1-U2 | No property name in `schemas/` (under `properties` at any depth, including `$defs`, and in every `required` array) and no key anywhere in any content module contains a banned token. Names are split into tokens at camelCase boundaries and hyphens. Tokens: score, scores, scoring, rank, ranks, ranked, ranking, confidence, priority, priorities, prioritise, prioritised, prioritize, prioritized, weight, weighting, likelihood, probability, importance, rating, featured, highlight, recommended, recommendation, top, best, winner. Fails on any match, naming file and path. | `schemas/`; content source | both | T, G3 |
| M1-U3 | No schema declares `type` `number`, `integer` or `boolean`, alone or in a type array, at any depth. Fails on any such declaration. | `schemas/` | both | T |
| M1-U4 | Every subschema in `schemas/` that declares `type: "object"` also declares `additionalProperties: false`. Fails otherwise. | `schemas/` | both | T |
| M1-U5 | Every `enum` in `schemas/` equals, or is a subset of, one of the six allowlists in `vocabulary.js` (`LABELS`, `LENSES`, `PRODUCERS`, `MATURITY_STATUSES`, `READINESS_CATEGORY_KEYS`, `PRACTICE_KEYS`); the `label`, `lens`, `producer` and `practiceKey` enumerations in `common.schema.json` equal their constants exactly, `label` having the six values including `yours`; each identifier pattern in `common.schema.json` equals its `ID_PATTERNS` counterpart; `LABEL_DISPLAY` has exactly the six keys; `brief.schema.json` `signalIds.maxItems` equals `BRIEF_SIGNAL_CAP`; the `maxItems` of `provenanceChecks`, `assumptionProbes`, `preMortem` and `questions` equal `QUESTIONS_PER_GROUP_MAX`. Fails on any other enumeration or any mismatch. | `schemas/`; `vocabulary.js`; `constants.js` | both | I |
| M1-U6 | Mutation agreement. For a valid sample of each entity and container, the test generates mutants: each required property removed in turn; `score: "x"` added to every object at every depth; a reading reference's lens duplicated; a fourth reading reference added; one removed; rationale set to `""`, `" "` and `"\n\t"`; intuition removed; an evidence item's `publishedOn` removed; a Signal's `provenance.sourceUrl` set to null; any `label` set to `"verified"`; a Signal's label set to `"yours"`; a Judgement's label set to `"ai-generated"`; a governance argument item's `label` removed and set to `"real"`; a conversation question's text without `?`; four conversation questions; four pre-mortem questions; an unverified practice with `levelName` other than the placeholder; a ScenarioRecord with `whatWasHeard` `" "`; a freeze manifest with a module path `"data/../x.js"`, with a duplicated path, and with `frozenOn` `"5 Oct 2026"`. Every mutant is rejected by both `mini-schema.mjs` and the matching `validate.js` check, called with the signatures above. Fails if either accepts any mutant. | `tests/fixtures/content/` (including `freeze.js`); `tests/fixtures/session/` | both | I |
| M1-U7 | `mini-schema.mjs` supports every keyword used in `schemas/`, and throws on a schema that uses a keyword outside its list. Fails if a keyword in `schemas/` is unsupported, or if the bad schema validates without throwing. | `schemas/`; `tests/fixtures/invalid/bad-schema.json` (uses `exclusiveMinimum`) | both | T |
| M1-U8 | A Trend whose reading references have lenses `[opportunity, opportunity, noise]`, or `[opportunity, threat]`, or four references, is rejected by the schema and by `checkTrend`; all six orderings of a valid set of three are accepted by both. Fails if any invalid set is accepted or any valid ordering rejected. | A valid fixture Trend, mutated in memory | both | I |
| M1-U9 | Referential integrity across modules. Every `Trend.signalIds` entry resolves to a Signal; every Trend has exactly one reveal bundle with its `trendId`; in each bundle each Reading's `trendId` equals the bundle's, its `id` equals the `readingId` the Trend holds for its lens and equals `reading-<trend slug>-<lens>`; the Interrogation's `trendId` equals the bundle's; either every Trend has exactly one conversation module whose `trendId` equals it and whose `id` is `conversation-<trend slug>`, or no conversation module exists; every `Brief.signalIds` entry resolves; no two Signals share `provenance.sourceUrl`. Fails on any dangling reference or disagreeing identifier, or on a partial set of conversation modules. | Content source | both | T, G3, Q |
| M1-U10 | `checkJudgement` accepts the valid session Judgement and rejects one with no `intuition`; rationale `""`, `"   "` or `"\n"`; `readingsRevealedAt` earlier than `intuition.recordedAt`; `committedAt` earlier than `readingsRevealedAt`; `label` other than `"yours"`. Fails if any invalid Judgement is accepted or the valid one rejected. | `tests/fixtures/session/judgement.js`, mutated in memory | both | I |
| M1-U11 | The freeze core returns `{ ok: false }`, with an error naming the entity and no files, when an entity has no `pass` verdict, when its canonical-JSON SHA-256 differs from the recorded hash, or when it fails its schema. Under Node, the driver run against a temporary copy exits non-zero and leaves the output directory byte-identical. Fails if any file is produced or written, or the driver exits zero, in any case. | `tests/fixtures/pipeline/`, mutated in memory | both (driver part: node) | I |
| M1-U12 | `loadReveal` and `loadConversation` each refuse `"../x"`, `"trend-unknown"` (well-formed but not in the trend list) and `"Trend-A"` without calling the injected importer, and resolve to `{ ok: false }`. Fails if the importer is called for any of the six cases or the loader throws. | Injected importer spy; fixture trend list | both | I |
| M1-U13 | Freeze determinism. The core on `tests/fixtures/pipeline/` produces exactly the files in `tests/fixtures/expected-data/`, byte for byte, including the header line and trailing newline; running it twice gives identical output; from G3, the core on `pipeline/output/` reproduces the committed `data/` byte for byte. Fails on any byte difference or any extra or missing file. | Fixture pipeline and expected data; from G3, `pipeline/output/`, `data/` | both | I, G3 |
| M1-U14 | Inert data modules and a truthful manifest. Every module listed in the manifest consists of the fixed header line, then `export default `, a JSON literal, `;` and one newline. With every JSON string literal blanked out, the text contains exactly one `export` and no `import`, `function`, `=>`, `new ` or backtick; words inside string literals are prose, cannot execute, and are not checked (a summary may say "a new standard"). The manifest's `modules` list equals the set of files in the directory, ignoring any path with a segment that begins with a dot (`data/.gitkeep` is housekeeping, not a module). Fails on any code outside string literals, a literal that does not parse as JSON, or any disagreement. | `tests/fixtures/expected-data/`; from G3, `data/` | both (listing: node) | T, G3 |
| M1-U15 | `constants.js` exports exactly `BRIEF_SIGNAL_CAP` 5, `READING_WPM` 200, `QUOTE_MAX_WORDS` 15, `REPLAY_WINDOW_START` `'2026-01-01'`, `REPLAY_WINDOW_END` `'2026-03-31'`, `QUESTIONS_PER_GROUP_MAX` 3, and `SCENARIO_FLOW` equal to `'static'` or `'interactive'`. Fails if any is missing, null or different. | `constants.js` | both | I |
| M1-U16 | Nothing unverified ships. Every entity in `data/` (each signal, trend, reading, interrogation, conversation set, log entry, the readiness profile, the governance container and the brief) has a `pass` verdict in `pipeline/output/verification.json` whose hash equals the SHA-256 of the entity's canonical JSON. Fails on any entity without a matching `pass`. | `data/`; `pipeline/output/verification.json` | both | G3 |
| M1-U17 | Q-5: governance argument labels. Every `argument` item in the governance content has `label` `"ai-generated"`; the container's `label` is `"real"`; the schema and `checkGovernance` both reject an argument item with no `label`, with `"real"` and with `"yours"`. Fails on any other label or any accepted mutant. | Content source governance; mutants in memory | both | T, G3 (checker part: I) |
| M1-U18 | D-1: the level names have one home. Using the candidate names in `tests/lib/candidate-level-names.mjs`, matched case-insensitively: no file in `schemas/` contains any candidate; in `index.html` and `assets/`, candidates may appear only in `assets/js/contracts/vocabulary.js`; while the readiness content is unverified, `MATURITY_LEVEL_NAMES` is empty and no candidate appears in `index.html`, `assets/` or `data/`; the literal `LEVEL_NAME_UNVERIFIED` appears in `assets/` only in `vocabulary.js`. Fails on any match outside those places. | `schemas/`; `index.html`; `assets/` (via the file inventory); content source readiness | both | I, G3 |
| M1-U19 | `checkScenarioRecord(record, judgement)` accepts the valid session pair and rejects: `whatWasHeard` or `howItCouldPlayOut` equal to `""`, `" "` or `"\n\t"`; `recordedAt` equal to or earlier than the Judgement's `committedAt`; `trendId` different from the Judgement's; `label` other than `"yours"`; `producedBy` other than `["viewer"]`; a note equal to `""`. Fails if any invalid record is accepted or the valid one rejected. | `tests/fixtures/session/` | both | I |
| M1-U20 | `checkReadiness` accepts `readiness-unverified.js` and, with the three fixture level names injected, `readiness-verified.js`. It rejects, with names injected: a verified `levelName` not in the list; a `nextLevel.levelName` that is not the successor of `levelName` in the list; a practice at the last listed level with a described next level instead of `noLevelAboveCitation`; a practice below the last level with `noLevelAboveCitation`; `betweenLevels.lowerLevelName` different from `levelName`; `betweenLevels.upperLevelName` not the successor; a verified profile checked with an empty list; an unverified profile with a non-null explanation; a profile with two practices. Fails if any is accepted or a valid fixture rejected. | `tests/fixtures/content/readiness-*.js`, mutated in memory | both | I |

---

## M2 Persona and scanning brief

| | |
|---|---|
| **Purpose** | The scenario's ground truth: who Tracewell is, what it faces in early 2026, which real incumbents, technologies and regulations surround it, what the Scout scans, and which early-2026 signals have documented outcomes for the replay. |
| **Inputs** | Public sources, researched in Claude Cowork by the Persona and Brief Researcher. |
| **Outputs** | `pipeline/briefs/persona-dossier.md`, `scanning-brief.md`, `replay-candidates.md`, written to the Markdown conventions below so that they can be checked (follow-up F-5 in the architecture). |
| **Entities touched** | None directly. Feeds Signal (through M3), ReadinessProfile (M7) and LogEntry (M8). |
| **May import** | Not code. No page file may reference `pipeline/briefs/`. |
| **Lives in** | `pipeline/briefs/`. Test: `tests/unit/m2-briefs.test.mjs`. |
| **Invariant most at risk** | **Invariant 4, every factual claim is sourced.** The dossier is where real-world facts about Dynatrace, OpenTelemetry and EU regulation enter the project, and an unsourced fact here propagates into every downstream agent's output as if it were ground truth. |

**Markdown conventions the tests parse.** Each file has a section headed `## Named entities` with a
table of columns Name, Kind, Source URL, Date. The scanning brief has a line
`Window: YYYY-MM-DD to YYYY-MM-DD`. Each replay candidate is a `###` heading followed by a line
`Original: <url> (YYYY-MM-DD)` for each original signal and one line `Outcome: <url> (YYYY-MM-DD)`.

| ID | What is asserted, and when it fails | Inputs and fixtures | Runner | Status |
|---|---|---|---|---|
| M2-U1 *(seeded, made testable)* | Every row of every "Named entities" table has a non-empty Name, a Kind from {competitor, incumbent, technology, regulation, standard, publication}, an `https://` Source URL and an ISO date. Whether the entity is real is the Verifier's check at G3; this test guarantees the claim is checkable. Fails if a file lacks the section or any row lacks a field or has a malformed URL or date. | The three briefs files | both | B |
| M2-U2 | Every `publisher` in any content module, and the words "Dynatrace" and "OpenTelemetry" wherever they appear in content text, appear as a Name in some "Named entities" table. Fails, naming the item, on any absence. The synthetic fixtures' publishers are invented and are not expected in the real briefs, so this test runs only against `data/`: before `CONTENT_FROZEN` it is skipped with "needs data/ (G3)", and it can show a result only from G3, once both the briefs and `data/` exist. | Briefs; `data/` | both | B, G3 (skipped before G3) |
| M2-U3 | The persona dossier states that Tracewell is fictional (contains "fictional" within the paragraph that first names Tracewell), names the five readiness categories (strategic alignment, resources, knowledge, culture, data), and cites Jöhnk et al. (2021) with an `https://` URL and a date. Fails if any is missing. | `persona-dossier.md` | both | B |
| M2-U4 | The scanning brief has a `Window:` line with two ISO dates, start before end. Fails if missing, malformed or reversed. | `scanning-brief.md` | both | B |
| M2-U5 | Every replay candidate has at least one `Original:` line and one `Outcome:` line with URL and date; every original date lies within `REPLAY_WINDOW_START` to `REPLAY_WINDOW_END`; the outcome date is later than every original date and no later than 2026-09-30. Fails on any missing source or date out of range. | `replay-candidates.md`; `constants.js` | both | B |

---

## M3 Scan pipeline

| | |
|---|---|
| **Purpose** | Turn the Scout's run against the scanning brief into verified, dated, linked Signals; and, under the Q-5 outcome, gather the regulatory source list the governance argument is drafted from. |
| **Inputs** | `pipeline/briefs/scanning-brief.md`; the open web, through the Scout, once, offline. |
| **Outputs** | `pipeline/output/signals.json` and the regulatory source list; after the freeze, `data/signals.js`. |
| **Entities touched** | Signal. |
| **May import** | Not page code. Writes against `schemas/signal.schema.json`. |
| **Lives in** | `pipeline/output/`, `data/signals.js`. Test: `tests/unit/m3-signals.test.mjs`. |
| **Invariant most at risk** | **Invariant 4, every factual claim is sourced**, in its most serious form: a fabricated or mis-dated signal is a project-ending defect. The contract forces a URL and dates to be present; only the Verifier can confirm they are true, which is why nothing ships without a `pass` (M1-U16). |

| ID | What is asserted, and when it fails | Inputs and fixtures | Runner | Status |
|---|---|---|---|---|
| M3-U1 *(seeded)* | Every Signal has an `https://` `provenance.sourceUrl`, a publisher, a `publishedOn`, a `retrievedOn` and a non-empty `summary.text`. Fails if any Signal lacks any of them. | Content source signals | both | T, G3 |
| M3-U2 | For every Signal, `publishedOn` ≤ `retrievedOn` ≤ `frozenOn`. Fails on any date out of that order. | Content source signals | both | T, G3 |
| M3-U3 | Every Signal published outside the scanning brief's window carries a `windowNote`, and no Signal inside it does. Fails on a missing or superfluous note. | Fixture signals with `tests/fixtures/briefs/scanning-brief.md`; from G3, `data/` with `pipeline/briefs/scanning-brief.md` | both | T, B, G3 |
| M3-U4 | Every `quote` has at most `QUOTE_MAX_WORDS` (15) words, split on whitespace. Fails on any longer quote. The fixture includes one quote of exactly 15 words. | Content source signals; `constants.js` | both | I, G3 |
| M3-U5 | The date inside every Signal `id` equals its `publishedOn`. Fails on any disagreement. | Content source signals | both | T, G3 |
| M3-U6 | No `summary.text`, `relevanceNote.text` or `windowNote` contains, as a whole word and case-insensitively, a C-6 term (best, better option, recommended, recommendation, top, priority, prioritise, rank, ranking, score, confidence, most important, most likely, key signal, must-read, winner) or a relevance level (high, medium, low, critical, minor). Quotes are excluded and listed in the output for Red-team review (C-6). Fails on any match. | Content source signals | both | T, G3 |

---

## M4 Interpretation pipeline

| | |
|---|---|
| **Purpose** | Turn signals into lens-neutral trends, three rival readings per trend, the questioning layer, and the conversation questions F5 shows after the founder's own scenario. |
| **Inputs** | `pipeline/output/signals.json`; the Trend Analyst, three Rival Readers and the Interrogator, once, offline. |
| **Outputs** | `pipeline/output/trends.json`, `readings.json`, `interrogations.json`, `conversations.json`; after the freeze, `data/trends.js`, one `data/reveal/<trendId>.js` and, once O-1 is closed, one `data/conversation/<trendId>.js` per trend. |
| **Entities touched** | Trend, Reading, Interrogation, ConversationQuestions; RevealBundle. |
| **May import** | Not page code. Writes against the Trend, Reading, Interrogation and ConversationQuestions schemas. |
| **Lives in** | The files above. Test: `tests/unit/m4-interpretation.test.mjs`. |
| **Invariant most at risk** | **Invariant 1, no ranking**, through its subtle form: one reading written with more force, more evidence or more questioning than its peers, or a trend summary that already leans one way. The contract equalises the structure; the lexical tests below catch the crudest leaks, and the Verifier and Red-team catch the rest. |

| ID | What is asserted, and when it fails | Inputs and fixtures | Runner | Status |
|---|---|---|---|---|
| M4-U1 *(seeded)* | Every Trend has exactly three reading references with lenses exactly {noise, opportunity, threat}, and its reveal bundle has exactly three Readings with the same lenses. Fails on a missing, extra or duplicated lens. | Content source | both | T, G3 |
| M4-U2 *(seeded)* | Every Reading has non-empty `text`, at least one `evidence` and one `counterEvidence` item each with a full `sourceRef`, and a non-empty `disconfirmingCondition`. Fails if any Reading lacks any of them. | Content source reveal bundles | both | T, G3 |
| M4-U3 *(seeded)* | No key named `score`, `rank`, `confidence` or `priority`, or containing a banned token from M1-U2, exists anywhere in the trends, any reveal bundle or any conversation module, at any depth. Fails on any such key. | Content source | both | T, G3 |
| M4-U4 | Every evidence and counter-evidence source has `publishedOn` ≤ `retrievedOn` ≤ the Reading's `frozenOn`. Fails on any date out of order. | Content source reveal bundles | both | T, G3 |
| M4-U5 | Lens neutrality before the gut reading. No Trend `title`, `summary` or `intuitionPrompt` contains, as a whole word and case-insensitively, opportunity, opportunities, threat, threats, threatening, noise, noisy, risk, risky, danger, dangerous, promising, overhyped or hype. A lexical floor only; the Verifier judges neutrality at G3. Fails on any match. | Content source trends | both | T, G3 |
| M4-U6 | No intuition prompt shares a run of six or more consecutive words (case-insensitive, punctuation stripped) with any text in its trend's readings. Fails on any shared run. | Content source | both | T, G3 |
| M4-U7 | No Reading refers to another lens's reading: an opportunity reading does not contain "threat reading" or "noise reading", and likewise for each lens. Fails on any cross-reference phrase. | Content source reveal bundles | both | T, G3 |
| M4-U8 | Every Interrogation has one to `QUESTIONS_PER_GROUP_MAX` (3) provenance checks, assumption probes and pre-mortem questions; every question ends with "?"; question identifiers are unique across all interrogations and all conversation-question sets. Fails on an empty or oversized group, a missing question mark or a repeated identifier. | Content source; `constants.js` | both | I, G3 |
| M4-U9 | No reading text, evidence or counter-evidence claim, disconfirming condition or interrogation question contains a C-6 term (as in M3-U6) as a whole word. Fails on any match. | Content source reveal bundles | both | T, G3 |
| M4-U10 | Conversation questions are questions, lens-free and not advice: each set has one to three questions; each ends with "?"; none contains a C-6 term, a lens word from M4-U5, or (whole word, case-insensitive) should, must, need to, recommend, advise, advice; each set's `trendId` resolves to a Trend. Fails on any violation. | Content source conversation modules | both | T, G3, Q |
| M4-U11 | Conversation questions favour no reading: no question shares a run of six or more consecutive words with any of its trend's three reading texts or disconfirming conditions. Fails on any shared run. | Content source | both | T, G3, Q |

---

## M5 Brief composer

| | |
|---|---|
| **Purpose** | R1's attention budget made concrete: no more than five signals that read in about ten minutes, each a door into F1 (F2). The entry screen (DM-7). |
| **Inputs** | Offline: verified signals, through the Brief Editor. In the page: the Brief container, the Signals, and the Trends (only to draw each signal's trend links). |
| **Outputs** | Offline: `pipeline/output/brief.json` and `data/brief.js`. In the page: `F2-S1`, `F2-S0`, `F2-W1`, `F2-S2`, `F2-E1`. |
| **Entities touched** | Brief (container), Signal; Trend read-only for titles and identifiers, never its readings. |
| **May import** | M1 (`load.js`, `validate.js`, `constants.js`, `vocabulary.js`), M9, M10's leaf `shell/routes.js`. |
| **Lives in** | `assets/js/screens/brief.js`; `data/brief.js`. Tests: `tests/unit/m5-brief.test.mjs` and `tests/unit/m5-brief.browser.mjs`. |
| **Invariant most at risk** | **Invariant 1, no ranking.** A digest is the format most easily read as "the important things, most important first". The order rule, the ordering note and identical templates are what keep it a list of peers. |

**Interface.** Pure: `orderSignals(signals)`, `trendLinksFor(signalId, trends)`. Render:
`renderBrief(root, ctx)`. **The screen context** passed by M10 to every screen module (M5 to M8)
is one object with these keys: `loader` (from `createLoader`), `routes` (the `shell/routes.js`
functions), `manifest` (the loaded freeze manifest; the key is `manifest`, not `freeze`), and, for
M6 only, `session`, `flow` and `now`. A screen ignores keys it does not use.

| ID | What is asserted, and when it fails | Inputs and fixtures | Runner | Status |
|---|---|---|---|---|
| M5-U1 *(seeded)* | The brief holds no more than `BRIEF_SIGNAL_CAP` (5) signals; `checkBrief` rejects a brief of six. Fails if the count exceeds five or the six-signal brief is accepted. | Content source brief; `tests/fixtures/invalid/brief-six-signals.js` | both | I, G3 |
| M5-U2 *(seeded)* | In `F2-S1`, the words of the screen's `textContent` (split on whitespace) divided by `READING_WPM` (200) is at most 10. Fails if the estimate exceeds ten minutes. | Content source | browser | I, G3 |
| M5-U3 | `orderSignals` returns signals by `publishedOn` newest first, ties by `id` ascending, for ten permutations of the brief's signals produced with `seededRandom` seeds 1 to 10, and always the same order. Fails if any permutation yields a different order. | Fixture signals (two share a date) | both | I |
| M5-U4 | Every signal in the brief appears in at least one Trend's `signalIds`; the test reports orphans by identifier. Fails on any orphan. | Content source | both | T, G3 |
| M5-U5 | With two signals failing the per-signal check (one without `publishedOn`, one without a relevance note), the screen contains no text from either and contains "2 signals were withheld because they failed the provenance check." (with one failing signal, "1 signal was withheld because it failed the provenance check.") Fails if any withheld text renders or the notice is missing or miscounted. | `tests/fixtures/invalid/brief-two-bad-signals.js` | browser | I |
| M5-U6 | Every signal element in `F2-S1` has the same tag and class list, and the same sequence of direct children by tag and class list. Deeper structure is not compared, because a signal in two trends legitimately holds two links where others hold one (M5-U7); the links share one template. No element carries a class, attribute or text marking it new, pinned, featured or relevant; "Listed by publication date. The order says nothing about importance." is present. Fails on any template difference, marker or missing note. | Content source | browser | I |
| M5-U7 | A signal that belongs to two trends shows two links, in alphabetical order of trend title, each `href` equal to `routes.trend(id)`. Fails if links are missing, out of order or point elsewhere. | Fixture shared signal | browser | I |
| M5-U8 | No count, level or marker of relevance: the interface text the screen adds around the fixture fields contains no "high", "medium", "low" or "relevance:"; no signal element contains a position number ("1.", "#1"); there is no `<meter>` or `<progress>`. Fails on any. | Content source | browser | I |
| M5-U9 | `F2-E1`: a brief container with an extra field `featured` shows "The weekly brief could not be shown because its content failed validation." and no signal title. Fails otherwise. | `tests/fixtures/invalid/brief-featured-field.js` | browser | I |
| M5-U10 | `F2-S0` and `F1-E0` in F2: an empty brief shows "This brief contains no signals."; with `loadTrends` stubbed to fail, every signal shows "No trend card for this signal in this build." and has no trend link. Fails otherwise. | `tests/fixtures/invalid/brief-empty.js`; loader stub | browser | I |
| M5-U11 | F2 labels (C-5): the brief header carries `data-label="frozen"` and shows the freeze date; each signal element carries `real`; its summary and relevance note each carry their own `ai-generated` label with a visible badge. Fails on any missing or different label. | Content source | browser | I |

---

## M6 Judgement and scenario capture

| | |
|---|---|
| **Purpose** | F1, the core loop: trend index, trend card, gut reading, the three readings in a random order, interrogation, and the committed judgement with a rationale. F5: the founder's own scenario, recorded before any conversation question loads. Holds session state. |
| **Inputs** | Trends and Signals through the M1 loader; the trend's reveal bundle through `loadReveal`, only after the intuition record; the trend's conversation questions through `loadConversation`, only after the scenario record; the freeze manifest and `SCENARIO_FLOW`; the viewer's actions; a random source and a clock, both injectable. |
| **Outputs** | `F1-S0`, `F1-S0e`, `F1-S1` to `F1-S4`, `F1-E0` to `F1-E3`; `F5-S0`, `F5-S1`, `F5-S2`, `F5-E2`, `F5-ST`. In memory: lens orders, intuition records, Judgements, ScenarioRecords. |
| **Entities touched** | Trend, Signal, Reading, Interrogation, ConversationQuestions (read); Judgement and ScenarioRecord (created in memory). |
| **May import** | M1, M9, M10's leaf `shell/routes.js`. |
| **Lives in** | `assets/js/screens/trend-index.js`, `trend.js`, `scenario.js`; `assets/js/state/session.js`, `lens-order.js`, `scenario.js`. Tests: `tests/unit/m6-judgement.test.mjs`, `m6-judgement.browser.mjs`, `m6-scenario.test.mjs`, `m6-scenario.browser.mjs`. |
| **Invariant most at risk** | **Invariant 2, intuition before AI.** This module holds the only code paths that load readings and conversation questions. One early call to `loadReveal`, one pre-rendered hidden element, or one reading string in an attribute breaks the invariant while the screen still looks correct. |

**Interface.** This adopts the drafts and return shapes the M6 tests assumed, and adds the one
missing function, `markReadingsRevealed`. `now` is always an ISO timestamp string, as returned by
`ctx.now()`. Every function that records something throws if called out of stage order or a second
time; the screen never calls one out of order, so a throw is a defect.

| File | Function | Takes | Returns |
|---|---|---|---|
| `state/session.js` | `createSession({ random = Math.random } = {})` | a random source | the session object |
| | `lensOrderFor(session, trendId)` | | the trend's frozen lens order, drawn on first call |
| | `canRecord(draft)` | `{ gutCall, reason }`; no lens is `gutCall: null` | boolean |
| | `recordIntuition(session, trendId, draft, now)` | draft as above | the frozen intuition record `{ gutCall, reason, recordedAt }`; an empty or whitespace reason becomes `null` |
| | `markReadingsRevealed(session, trendId, now)` | | the stamped `readingsRevealedAt`. Called by `renderTrend` after `loadReveal` has succeeded and before the reading elements are created; throws if no intuition record exists or it was already stamped |
| | `canCommit(draft)` | `{ committedLens, rationale }`; no lens is `committedLens: null` | boolean |
| | `whatIsMissing(draft)` | as `canCommit` | the hint text: "Choose a reading and write a rationale to commit your judgement.", "Choose a reading to commit your judgement.", "Write a rationale to commit your judgement.", or `""` when nothing is missing |
| | `commitJudgement(session, trendId, draft, now)` | `{ committedLens, rationale, promptAnswers }`; `promptAnswers` an array of `{ questionId, answer }`, blank answers omitted, possibly empty or absent | the frozen Judgement; throws if `markReadingsRevealed` has not been called for the trend |
| | `stageOf(session, trendId)` | | `'awaiting-intuition'`, `'intuition-recorded'`, `'committed'` or `'scenario-recorded'` |
| `state/lens-order.js` | `drawLensOrder(random)`, `orderReadings(readings, lensOrder)` | see `03-architecture.md`, section 7.3 | frozen arrays |
| `state/scenario.js` | `canRecordScenario(draft)` | `{ whatWasHeard, howItCouldPlayOut }` | boolean |
| | `whatIsMissingScenario(draft)` | as above | "Write what you have heard and how the trend could play out to record your scenario.", "Write what you have heard to record your scenario.", "Write how the trend could play out to record your scenario.", or `""` |
| | `recordScenario(session, trendId, draft, now)` | as above | the frozen `{ trendId, whatWasHeard, howItCouldPlayOut, recordedAt }`; throws without a committed Judgement or if `now` is not later than its `committedAt` |
| | `setQuestionNote(session, trendId, questionId, text)` | an empty or whitespace text removes the note | `undefined` |
| | `snapshotScenario(session, trendId)` | | a ScenarioRecord as in `scenario-record.schema.json` |
| | `scenarioMode(manifest, trends, flow)` | | `'interactive'` or `'static'`; throws on partial coverage |

Render: `renderTrendIndex(root, ctx)`, `renderTrend(root, ctx, trendId)`, `renderScenario(root,
ctx, trendId)`, each returning a promise that settles when the screen has rendered, where `ctx`
holds `session`, `loader` (so a test can inject spies for `loadReveal` and `loadConversation`),
`routes`, `manifest`, `flow` and `now`. The seeded shuffle is specified in `03-architecture.md`,
section 7.3.

**F1 tests.**

| ID | What is asserted, and when it fails | Inputs and fixtures | Runner | Status |
|---|---|---|---|---|
| M6-U1 *(seeded)* | In `F1-S1`, the serialised page (`document.documentElement.outerHTML`, including attributes, comments and `<template>` contents) contains none of the fixture's reading texts, evidence or counter-evidence claims, disconfirming conditions or interrogation questions; the `loadReveal` spy has not been called. Fails if any such string appears or the spy was called. | `trend-fixture-alpha`; marker strings; `loadReveal` spy | browser | I |
| M6-U2 | After "Record my gut reading" is activated and the returned promise settles, the spy has been called exactly once, with `trend-fixture-alpha`, and the page contains all three readings' texts and disconfirming conditions. Fails on zero or several calls or a missing reading. | As M6-U1 | browser | I |
| M6-U3 *(seeded)* | `canCommit` is false for rationale `""`, `" "` and `"\n\t "` with a lens chosen, and for `"x"` with no lens; true for `"x"` with a lens. In the page, "Commit judgement" has `disabled` in each false case and a line names what is missing ("Choose a reading and write a rationale to commit your judgement." or only the missing part). Fails if a false case enables commit, the true case does not, or the line is absent. | Drafts in memory; `trend-fixture-alpha` | both | I |
| M6-U4 | In `F1-S1` no lens option is selected and "Record my gut reading" is disabled until one is chosen; in `F1-S2` no lens is selected in the judgement control, including the recorded gut call. Fails on any pre-selection or an enabled button with no lens. | `trend-fixture-alpha` | browser | I |
| M6-U5 | After the record, the intuition record satisfies `Object.isFrozen`; assigning to `gutCall` leaves it unchanged; the gut-reading controls are disabled; a second `recordIntuition` for the trend throws. Fails if the record is mutable, a control is enabled or a second record succeeds. | Session with injected `now` | both | I |
| M6-U6 | After commit, the Judgement satisfies `Object.isFrozen`; a second `commitJudgement` throws; `F1-S4` has no enabled commit control and no editable field. Fails if a second commit succeeds or a field stays editable. | Session with injected `now` | both | I |
| M6-U7 | Q-2, random order. Pure part: `drawLensOrder` with stubs returning `[0, 0]`, `[0, 0.5]`, `[0.34, 0]`, `[0.34, 0.5]`, `[0.67, 0]`, `[0.67, 0.5]` returns respectively `[opportunity, threat, noise]`, `[threat, opportunity, noise]`, `[threat, noise, opportunity]`, `[noise, threat, opportunity]`, `[opportunity, noise, threat]`, `[noise, opportunity, threat]`; calls `random` exactly twice; returns a frozen array; throws `RangeError` for `1`, `-0.1` and `NaN`. With `seededRandom` seeds 1 to 200, all six orders occur. `orderReadings` returns `lensOrder`'s order for all six permutations of the input, and throws for two readings. Page part: with `createSession({ random: seededRandom(42) })`, the gut-reading options, the three readings and the judgement options all follow `drawLensOrder(seededRandom(42))`; the six permutations of the bundle's `readings` array give byte-identical reading areas; the three reading elements share tag, class list and child structure; the note "The three readings are peers. Their order is random and means nothing." is present. Fails on any difference. | Stubs; `tests/lib/seeded-random.mjs`; `trend-fixture-alpha` and its six permuted bundles | both | I |
| M6-U8 | Recording and committing on trend A leaves trend B at `awaiting-intuition`. Navigating A, brief, A shows A at the stage it reached and in the same lens order; `lensOrderFor` returns the same array (`===`) on a second call; a new session with a different stub draws a different order. Fails if B changes, A does not resume, or the order changes within a session. | Two fixture trends | both | I |
| M6-U9 | With `localStorage`, `sessionStorage`, `indexedDB`, `caches` and the `document.cookie` setter replaced by stubs that record access, a walk from `F1-S1` to `F1-S4` records none. Fails on any access. | `tests/lib/dom.mjs` storage stubs | browser | I |
| M6-U10 | `F1-S4` contains the statement that the judgement is held only in this tab, is not saved or sent, will be gone on reload and does not appear in the decision log, which is a replay; a link "Take this trend into your conversations" with `href` equal to `routes.scenario(trendId)`; and, outside the viewer's echoed text (set to neutral strings), none of: match, mismatch, correct, wrong, agree, disagree, changed your mind. Fails if the statement or link is missing or an evaluative word appears. | `trend-fixture-alpha` | browser | I |
| M6-U11 | `F1-E3`: with a reveal bundle that fails `checkRevealBundle` (one Reading without counter-evidence), recording the gut reading shows the locked gut reading and "The readings for this trend were withheld because their content failed validation. Your gut reading is kept for this session."; no text from any reading and no interrogation question is rendered; no judgement control exists. Fails otherwise. | `tests/fixtures/invalid/reveal-no-counter-evidence.js` | browser | I |
| M6-U12 | `#/trend/trend-does-not-exist` shows "This trend card does not exist in this build." and a link to the trend index. A Trend with two reading references shows "This trend card was withheld because its content failed validation." and the page contains neither its title nor any of its signals' titles. Fails on the wrong state or any partial rendering. | `tests/fixtures/invalid/trend-two-readings.js` | browser | I |
| M6-U13 | The Judgement produced by a full walk passes `checkJudgement`, with `intuition.recordedAt` ≤ `readingsRevealedAt` ≤ `committedAt`, `label` `"yours"`, `provenance.producedBy` `["viewer"]` and `provenance.frozenOn` null. Fails on any. | Session with an injected clock advancing one second per call | both | I |
| M6-U14 | Every `<input>` and `<textarea>` on the trend screen has `autocomplete="off"`; after typing the reason "zebra-test-reason", an answer "zebra-test-answer" and the rationale "zebra-test-rationale", `location.href` contains none of them. Fails on a missing attribute or any string in the URL. | `trend-fixture-alpha` | browser | I |
| M6-U15 | `F1-E0`: with `loadTrends` stubbed to fail, `#/trends`, `#/trend/trend-fixture-alpha` and `#/scenario/trend-fixture-alpha` each show "Trend cards could not be loaded in this build."; `loadReveal` and `loadConversation` are never called. Fails otherwise. | Loader stub | browser | I |
| M6-U16 | Q-1, answering is primary. In `F1-S2`: every question has an answer field directly beneath it, not inside a closed `<details>` or hidden element, captioned "Your answer (optional)"; one skip control "Skip the questions" follows the last question in document order and in rendered position; the first focusable element in the interrogation area is the first answer field; the skip control's computed `background-color` is transparent, its border width is zero or its style `none`, and its computed `font-size` and `font-weight` are no greater than the question text's; each answer field has a non-zero border; activating skip leaves the draft answers unchanged, leaves every answer field enabled, and moves focus to the first judgement option; the commit hint contains neither "answer" nor "question". Fails on any. | `trend-fixture-alpha` | browser | I |
| M6-U17 | Viewer entries carry `yours` in F1: in `F1-S1` the gut-reading control and reason field; in `F1-S2` every answer field, the judgement control and the rationale field; in `F1-S4` every read-only echo (gut call, reason, answers, committed lens, rationale). Each carries `data-label="yours"` and a visible "Yours" badge; each reading and question carries `ai-generated`. Fails on any other label. | `trend-fixture-alpha` | browser | I |

**F5 tests.**

| ID | What is asserted, and when it fails | Inputs and fixtures | Runner | Status |
|---|---|---|---|---|
| M6-U18 | `F5-S0`: with `SCENARIO_FLOW` `'interactive'` and no committed Judgement for the trend (including in a fresh session, as after a reload), `#/scenario/trend-fixture-alpha` shows "Scenario work on this trend starts from a judgement you have committed in this session. Open the trend card and commit a judgement first." and a link to the trend card; no `<input>` or `<textarea>`; the `loadConversation` spy is not called. Fails otherwise. | Fixture with conversation modules; `flow: 'interactive'` | browser | I |
| M6-U19 | `canRecordScenario` is false when either field is `""`, `" "` or `"\n\t"`, and true when both hold text. In the page, "Record my scenario" is disabled in each false case and a line names which field is still empty. Fails if a false case enables recording, the true case does not, or the line is absent or names the wrong field. | Drafts in memory; committed fixture session | both | I |
| M6-U20 | The founder's step comes first in F5. In `F5-S1`, the serialised page contains none of the trend's conversation-question texts and the `loadConversation` spy has not been called. After "Record my scenario", the spy has been called exactly once, with the trend's identifier, and the page contains every question. Fails on any early question text or call, or on a missing question. | Committed fixture session; `loadConversation` spy; marker strings | browser | I |
| M6-U21 | `recordScenario` freezes the two fields and `recordedAt`; a second call throws; a call whose `now` equals the Judgement's `committedAt` throws; `setQuestionNote` changes a note after recording; `snapshotScenario` returns a record that passes `checkScenarioRecord` with the session's Judgement. In `F5-S2` both recorded fields are read-only and each note field stays editable. Fails on any. | Session with an injected clock | both | I |
| M6-U22 | `F5-S2` layout and labels: a region headed "What you wrote" precedes, in document order, a region headed "Questions to take into your next conversations"; the first holds the read-only echo of the committed judgement and of both fields, each `data-label="yours"`; each question carries byte-identical `ai-generated` label markup and has a field captioned "Who you would ask (optional)" with `autocomplete="off"` and `data-label="yours"`; the page contains "These questions were written offline, before you arrived, and are the same for every visitor. They do not respond to what you wrote." and the not-saved statement; none of the evaluative words of M6-U10 appears outside the viewer's echoed text. Fails on any. | Committed and recorded fixture session | browser | I |
| M6-U23 | `F5-E2`: with a conversation module that fails `checkConversation` (a question without "?"), recording shows both fields read-only and "The conversation questions for this trend were withheld because their content failed validation. What you wrote is kept for this session."; no question text is rendered. Fails otherwise. | `tests/fixtures/invalid/conversation-no-question-mark.js` | browser | I |
| M6-U24 | `F5-ST` and the switch. Pure part: `scenarioMode` returns `'interactive'` for flow `'interactive'` with a conversation module listed for every trend; `'static'` for flow `'interactive'` with none listed; `'static'` for flow `'static'` with all listed; and throws when some trends have a module and others not. Page part: in static mode, `#/scenario/trend-fixture-alpha`, with or without a committed Judgement, shows the heading "Scenario work from your own conversations", three sentences of description, and "In this build the scenario step is described only. No questions are shown, because this screen cannot first record your own scenario."; contains no `<input>` or `<textarea>` and no element with `data-label="ai-generated"`; and `loadConversation` is never called. From G3, if `SCENARIO_FLOW` is `'interactive'`, every trend in `data/` has a conversation module. Fails on any. | Fixture manifests with all, none and some conversation modules; `constants.js` | both | I, G3, Q |
| M6-U25 | No storage and nothing in the URL in F5: with the storage stubs of M6-U9, a walk from `F5-S1` to `F5-S2` with a note records no access; after typing "zebra-test-heard", "zebra-test-playout" and "zebra-test-note", `location.href` contains none; every F5 text field has `autocomplete="off"`. Fails on any. | Committed fixture session | browser | I |
| M6-U26 | Resume. After recording, navigating to the brief and back to `#/scenario/trend-fixture-alpha`, or following the link on `F1-S4` again, shows `F5-S2` with the same recorded text and notes. Fails if the screen returns to `F5-S1` or the text differs. | Recorded fixture session | browser | I |

---

## M7 Readiness and maturity

| | |
|---|---|
| **Purpose** | F3: Tracewell's readiness across the five Jöhnk et al. categories, the maturity level of each foresight practice (held at `LEVEL_NAME_UNVERIFIED` until verified), what the WEF/OECD report describes for the next level once verified, and the governance screen (R8). |
| **Inputs** | The ReadinessProfile and the Governance container through the M1 loader; `MATURITY_LEVEL_NAMES`, injectable for tests. Offline: the persona dossier (M2); the governance argument, drafted by the Architect from the Scout's frozen source list during G3 (Q-5); the maturity explanations and next-level descriptions (author: open item O-2). |
| **Outputs** | `data/readiness.js`, `data/governance.js`; `F3-S1`, `F3-S2`, `F3-S2v`, `F3-S3`, `F3-E1`, `F3-E2`. |
| **Entities touched** | ReadinessProfile; Governance (container). |
| **May import** | M1, M9, M10's leaf `shell/routes.js`. |
| **Lives in** | `assets/js/screens/readiness.js`, `assets/js/screens/governance.js`. Tests: `tests/unit/m7-readiness.test.mjs`, `tests/unit/m7-readiness.browser.mjs`. |
| **Invariant most at risk** | **Invariant 1, no ranking**, in two forms. A readiness diagnostic invites bars, traffic lights and "you are strongest in…", and the contract has no numbers to draw them from; the screen must not invent them. And a next-level description can slide from what the report describes into what Tracewell should do, which is a recommendation; the K-2 wording tests exist for that. |

**Interface.** `renderReadiness(root, ctx, { levelNames = MATURITY_LEVEL_NAMES } = {})`,
`renderGovernance(root, ctx)`, with `ctx` = `{ loader, routes, manifest }` as defined under M5.
Because `loadReadiness` validates with `checkReadiness`, verified level names reach both places
through one injection point: `createLoader({ importer, levelNames = MATURITY_LEVEL_NAMES })` passes
`levelNames` to `checkReadiness`, and the test passes the same list to `renderReadiness`. A test
may instead stub `loadReadiness` to return the verified fixture; both are acceptable, and the page
uses neither option. **DOM hooks:** the maturity view is the element with
`data-area="maturity"`, and the next-level area within it is the element with
`data-area="next-level"`; M7-U2, M7-U7 and M7-U8 locate them by these attributes (see "DOM
hooks" above).

| ID | What is asserted, and when it fails | Inputs and fixtures | Runner | Status |
|---|---|---|---|---|
| M7-U1 *(seeded)* | The profile has exactly five categories with keys in the order strategic-alignment, resources, knowledge, culture, data (DM-8), each with at least one answer and a non-empty finding, and exactly three practices in the order scanning, trend-analysis, scenario-work; the screen renders both lists in those orders. Fails on a missing or repeated item or a different order in data or on screen. | Content source readiness | both | T (data), I (screen), G3 |
| M7-U2 *(seeded, restated)* | Unverified maturity view (`F3-S2`): each of the three practices shows its name and the literal `LEVEL_NAME_UNVERIFIED`; the sentence "Level names pending verification against the WEF/OECD report." appears exactly once; no explanation, no report citation, and none of the candidate level names is in the page. Fails on any. | `readiness-unverified.js`; `tests/lib/candidate-level-names.mjs` | browser | I |
| M7-U3 | `F3-S1` and the maturity view contain no `<meter>`, `<progress>`, `<svg>` or `<canvas>`, no element with `role="meter"` or `role="progressbar"`, and no inline style setting `width` in `%`. Fails if any is present. | Both readiness fixtures | browser | I |
| M7-U4 | `F3-E1`: a profile with four categories, and separately a profile with two practices, shows "The readiness profile was withheld because its content failed validation." and renders no category name, answer, finding or practice. Fails on any partial rendering. | `tests/fixtures/invalid/readiness-four-categories.js`, `readiness-two-practices.js` | browser | I |
| M7-U5 | Governance screen (`F3-S3`): headings "Implemented in this demo" and "Not implemented"; every item of each list; for each implemented item, the test identifiers in its `verifiedBy`; every argument paragraph with at least one source link showing its date and its own `ai-generated` label; the lists covered by the container's `real` label. Fails on any missing heading, item, identifier, source or label. | Content source governance | browser | I |
| M7-U6 | The governance content holds the required items by identifier (implemented: `open-web-sources-frozen`, `no-viewer-data-stored-or-sent`, `no-live-ai`, `no-accounts-cookies-analytics`; not implemented: `own-data-ingestion`, `cross-session-persistence`, `role-aware-model`), and every identifier in any `verifiedBy` is either a row identifier `M<n>-U<k>` in this document or an invariant audit `AUDIT-1` to `AUDIT-6` from `test-plan.md`. The `testId` pattern in `common.schema.json` admits both on purpose: a claim such as `no-live-ai` is verified by a unit test and by an audit, and the screen may name either. Fails on a missing item, an unknown unit test or an audit number outside 1 to 6. | Content source governance; this document (raw text: in the browser, skipped with "needs Node or DM-11") | both | T, G3 |
| M7-U7 | While unverified, the next-level area renders exactly "Pending: the next complement depends on the verified level definitions." and nothing else. Fails on any other text there. | `readiness-unverified.js` | browser | I |
| M7-U8 | Verified view (`F3-S2v`), with the fixture level names injected: each practice shows its level name, its explanation and a citation with page; a block headed "What the WEF/OECD report describes for the next level" holds, per practice, the next level's name, its description with its own `ai-generated` label, and a citation showing the DOI link, the year and the page; the practice at the last level shows exactly "The report describes no level above this one."; after all practices, "These are the report's descriptions of the next level. They are not advice from this demo."; neither pending sentence appears. Fails on any. | `readiness-verified.js` with `levelNames` injected | browser | I, V |
| M7-U9 | The K-2 wording constraints that a test can check, on every next-level description: it begins with "The report describes"; it contains none of the whole words, case-insensitive, you, your, we, our, should, must, need, needs, recommend, recommended, recommendation, advise, advice, Tracewell, team, nor the phrase "next step", nor any C-6 term; its citation's `url` is `https://doi.org/10.1787/aa573076-en`, its `publishedOn` year is 2025, and `title` and `page` are present. Fails on any violation. | `readiness-verified.js`; from verification, `data/` | both | T, V |
| M7-U10 | The lower-level rule is stated: for every verified practice with `betweenLevels` set, the explanation text contains "lower level" (case-insensitive); every verified explanation cites the report's DOI with a page. The structural rule is M1-U20. Fails on any omission. | `readiness-verified.js` (one practice between two levels); from verification, `data/` | both | T, V |
| M7-U11 | `F3-E2`: with `loadGovernance` stubbed to fail, `#/governance` shows "The governance statement could not be shown." while `#/readiness` still renders `F3-S1`. Fails otherwise. | Loader stub | browser | I |

---

## M8 Decision log and replay

| | |
|---|---|
| **Purpose** | F4: the retrospective replay of real signals from 1 January to 31 March 2026, a judgement written for the fictional team from those signals alone with the outcome withheld, the real outcome by September 2026, and a qualitative calibration note labelled `ai-generated` (R5, K-7, DM-10). |
| **Inputs** | LogEntries through the M1 loader. Offline: the replay candidates (M2); past judgements by the Rival Readers and the Interrogator; outcomes attached by the Verifier; calibration notes (author: open item O-2). |
| **Outputs** | `data/log.js`; `F4-S1`, `F4-S0`, `F4-W1`, `F4-E1`. |
| **Entities touched** | LogEntry. |
| **May import** | M1, M9, M10's leaf `shell/routes.js`. |
| **Lives in** | `assets/js/screens/log.js`. Tests: `tests/unit/m8-log.test.mjs`, `tests/unit/m8-log.browser.mjs`. |
| **Invariant most at risk** | **Invariant 4, every factual claim is sourced**, at its sharpest: an outcome that did not happen, or a date that makes a judgement look prescient, is a project-ending defect. The second exposure is invariant 1: any tally of readings that held becomes a scoreboard. |

**Interface.** Pure: `orderEntries(entries)`, `writingDates(entries)` (one date, or first and
last). Render: `renderLog(root, ctx)`.

| ID | What is asserted, and when it fails | Inputs and fixtures | Runner | Status |
|---|---|---|---|---|
| M8-U1 *(seeded)* | Every LogEntry's outcome has an `https://` source whose `publishedOn` is later than every original signal's and no later than the entry's `frozenOn`. Fails on an undated outcome, one not later than a signal, or one after the freeze. | Content source log | both | T, G3 |
| M8-U2 | Every original signal's `publishedOn` lies within `REPLAY_WINDOW_START` to `REPLAY_WINDOW_END` inclusive. Fails on any outside. The fixture includes signals on both boundary dates. | Content source log; `constants.js` | both | I, G3 |
| M8-U3 | `orderEntries` returns entries by earliest original-signal `publishedOn`, oldest first, ties by `id` ascending, for ten `seededRandom` permutations; the date in each entry `id` equals its earliest signal's date. Fails on any different order or disagreeing identifier. | Fixture log | both | I |
| M8-U4 | The replay statement is the first content in `F4-S1`, `F4-S0`, `F4-W1` and `F4-E1`, before any entry, and contains: "retrospective replay"; "1 January" and "31 March 2026"; "fictional"; "Rival Reader" and "Interrogator"; "withheld"; "Verifier"; "some" (with no number of entries anywhere in it); "AI-generated"; that the judgements are not the viewer's and that judgements from this session do not appear; and the writing date as formatted by M9's `formatDate`, or the first and last when they differ. Fails on any missing element, a count, or a statement not first. | Fixture logs with one and with two writing dates | browser | I |
| M8-U5 | `F4-S1` contains no aggregate or verdict: no text matching `\d+\s*(of|/)\s*\d+` or `%`; no `<svg>`, `<img>`, `<canvas>`, `<meter>` or `<progress>` inside any entry; every entry element has the same class list. Fails on any. | Content source log | browser | I |
| M8-U6 | An entry whose outcome lacks a source date is withheld: none of its text is rendered, and "1 entry was withheld because it lacked a dated outcome source or failed validation." is shown. Fails otherwise. | `tests/fixtures/invalid/log-undated-outcome.js` | browser | I |
| M8-U7 | K-7 dates. For every entry: `pastJudgement.asOfDate` is on or after the latest original signal's `publishedOn` and before the outcome's `publishedOn`; and `asOfDate` ≤ `pastJudgement.authoredOn` ≤ `outcome.attachedOn` ≤ `provenance.frozenOn`. Fails on any date out of order. | Content source log | both | T, G3 |
| M8-U8 | R7 is designed for, not built: no LogEntry in the content has a `role`; no file in `assets/js/` other than `contracts/validate.js` contains the property access `.role` or `["role"]` (the ARIA attribute set with `setAttribute` is unaffected). Fails on any fixture role or page-code read. | Content source; `assets/js/` via the file inventory | both | T, I, G3 |
| M8-U9 | Entry structure and labels: each entry renders, in document order, its original signal(s), the past judgement, the outcome and the calibration note; the past judgement line shows the as-of date, states that the Tracewell team is fictional, and names its authors and writing date; labels are `replay` on the entry and the past judgement, `real` on each signal and the outcome, `ai-generated` on each signal summary, the outcome summary and the calibration note. Fails on any order or label difference. | Content source log | browser | I |
| M8-U10 | `F4-S0` and `F4-E1`: an empty log shows the replay statement and "This build contains no replay entries."; a log module that is not an array of valid entries as a whole shows the replay statement and "The decision log could not be shown because its content failed validation." and no entry. Fails otherwise. | `tests/fixtures/invalid/log-empty.js`, `log-not-array.js` | browser | I |

---

## M9 Honesty and provenance layer

| | |
|---|---|
| **Purpose** | Render every honesty label, every source citation, every date and the demo-wide statement, identically everywhere, so that NF2 and NF3 hold by construction rather than screen by screen. |
| **Inputs** | Label values, `sourceRef` and `reportCitation` objects, dates, the freeze manifest. |
| **Outputs** | `labels.js`: `renderLabel(value)`, returning `<span class="label-badge" data-badge="<value>">` with the text `LABEL_DISPLAY[value]` and no `data-label`; the screen places it inside the element that carries `data-content` and `data-label`. `sources.js`: `renderSource(ref)`, returning a `<span class="source">` holding the `<a>` and then the publisher, the formatted date and, for a `reportCitation`, "p. <page>"; `renderQuote(text, sourceLanguage, publisher)`, returning a `<span class="quote">` holding the `<q lang>` and then the publisher; `formatDate(isoDate)`, returning text such as "5 October 2026". `statement.js`: `renderDemoStatement(manifest)`, returning a `<p class="demo-statement">` with no `data-content` or `data-label`. Each throws on invalid input, as the tests state. |
| **Entities touched** | The label and provenance parts of every entity; FreezeManifest. |
| **May import** | M1 only. |
| **Lives in** | `assets/js/honesty/labels.js`, `sources.js`, `statement.js`. Tests: `tests/unit/m9-honesty.test.mjs`, `tests/unit/m9-honesty.browser.mjs`. |
| **Invariant most at risk** | **Invariant 5, honest labelling.** A label that is present but wrong is worse than a missing one, because it passes a presence check. The mechanism guarantees presence and vocabulary; correctness of each label is reviewed by the Red-team at G3 and G4. |

| ID | What is asserted, and when it fails | Inputs and fixtures | Runner | Status |
|---|---|---|---|---|
| M9-U1 *(seeded)* | On every screen of a full walk (brief; trend card to `F1-S4`; `F5-S2` in interactive mode; readiness, both fixtures; governance; log), run either through the app host with `start({ loader, flow: 'interactive', levelNames })` or by calling each screen's render function with the same context (both are acceptable; M9-U4 covers the shell), every element with `data-content` has a `data-label` in the six-value vocabulary and a visible badge whose text is `LABEL_DISPLAY[value]`. Viewer entries pass with `yours`. Fails on any content element lacking either form or carrying another value. | `tests/app-host.html` with fixture loader; `flow: 'interactive'` | browser | I |
| M9-U2 | `formatDate('2026-10-05')` is "5 October 2026". `renderLabel` throws for `"verified"`, `""`, `undefined`, `"AI"` and `"Yours"`, and for each of the six values returns an element with `data-badge` equal to the value, no `data-label`, and the badge text from `LABEL_DISPLAY`. Fails if an invalid value is accepted, a valid one throws, or a text differs. | None | both (`formatDate`), browser (`renderLabel`) | I |
| M9-U3 | `renderSource` returns an `<a>` whose `href` equals the URL and starts with `https://`, with `target="_blank"` and `rel` containing `noopener` and `noreferrer`, followed by visible text with the publisher and the formatted publication date, and, for a `reportCitation`, the page; it throws for a reference without `publishedOn`. Fails on any missing attribute or text, or an undated source rendering. | Fixture references | browser | I |
| M9-U4 | Every route (`#/brief`, `#/trends`, `#/trend/trend-fixture-alpha`, `#/scenario/trend-fixture-alpha`, `#/readiness`, `#/governance`, `#/log`, and `#/nothing`) renders the demo-wide statement with the freeze date from the manifest. Fails if any screen lacks it or shows another date. | `tests/app-host.html` | browser | I |
| M9-U5 | Peers carry byte-identical label markup: the three reading elements on a trend card; the conversation questions in `F5-S2`; the signal elements in `F2-S1`. Fails on any difference. | Fixture content | browser | I |
| M9-U6 | Per-part labels: a Signal's summary and relevance note show their own `ai-generated` label; in a LogEntry, each original signal, its summary, the past judgement, the outcome, its summary and the calibration note show their own; each governance argument paragraph shows `ai-generated`; each next-level description shows `ai-generated` (verified fixture). Fails if a part with its own label shows the entity's label instead, or none. | Fixture content | browser | I |
| M9-U7 | `renderQuote` wraps the quote in `<q>` with `lang` equal to `sourceLanguage`, follows it with the publisher, and throws for a quote longer than `QUOTE_MAX_WORDS` (a 16-word quote throws; a 15-word quote renders). Fails on wrong markup, missing attribution or a long quote rendering. | None | browser | I |
| M9-U8 | Interface copy is not content (C-5 rule 6): across the full walk of M9-U1, no `h1` to `h6`, `button` or `label` element carries `data-label`; and no element whose text is an ordering note, error or withheld notice, the demo-wide statement or the replay statement carries `data-content` or `data-label`. Fails on any. | As M9-U1 | browser | I |
| M9-U9 | `frozen` is an element label only on the brief (DM-2): across the full walk of M9-U1, exactly one element carries `data-label="frozen"`, the brief header in `F2-S1` (its badge carries `data-badge="frozen"`, not `data-label`, and is not counted). Fails on any other element with that label, or none. | As M9-U1 | browser | I |

---

## M10 UI shell and navigation

| | |
|---|---|
| **Purpose** | The page itself: `index.html`, start-up, the static failure message, routing between screens, the navigation, layout and styles for phone in portrait and desktop in landscape. |
| **Inputs** | The URL fragment; `data/freeze.js` through the M1 loader; the screen modules; `start()` options (loader, random source) for tests. |
| **Outputs** | The running page; `G-E1`; `G-E2`. |
| **Entities touched** | FreezeManifest only. |
| **May import** | M1, M5, M6, M7, M8, M9. Its leaf file `shell/routes.js` imports nothing and is the only M10 file others may import. |
| **Lives in** | `index.html` (only: `lang`, viewport meta, stylesheet link, the static `#startup-failure` message, an `#app` root, one module script calling `start()`); `assets/js/main.js` (exports `start({ loader, random, flow = SCENARIO_FLOW, levelNames = MATURITY_LEVEL_NAMES } = {})`; `index.html` calls `start()` with no argument, so the page always uses `Math.random`, the build's `SCENARIO_FLOW` and the vocabulary's level names, and only the app host passes options; `flow` goes into the M6 context and `levelNames` to `createLoader` and `renderReadiness`); `assets/js/shell/router.js`, `routes.js`, `nav.js`; `assets/css/main.css`. Tests: `tests/unit/m10-shell.test.mjs`, `tests/unit/m10-shell.browser.mjs`; whole-app tests load `tests/app-host.html`, which has the same static elements as `index.html` and calls `start()` with the options the test page provides. |
| **Invariant most at risk** | **Invariant 5's clause "viewers trigger no live AI calls", and NF1.** The shell is where a convenient web font, a CDN copy of a library, an analytics snippet or a prefetch hint would be added, and any of them turns a self-contained demo into one that talks to the network. |

**Permitted import edges** (checked by M10-U4). Paths are relative to `assets/js/`; an edge is
from the importing file to the imported file.

| From | May import |
|---|---|
| `main.js` | `shell/*`, `screens/*`, `state/*`, `honesty/*`, `contracts/*` |
| `shell/*` | other `shell/*` files, `screens/*`, `state/*`, `honesty/*`, `contracts/*`; `shell/routes.js` imports nothing |
| `screens/*` | `honesty/*`, `contracts/*`, `shell/routes.js`; and the M6 screens (`trend-index.js`, `trend.js`, `scenario.js`) also `state/*` |
| `state/*` | other `state/*` files, `contracts/*` |
| `honesty/*` | other `honesty/*` files, `contracts/*` |
| `contracts/load.js` | `contracts/validate.js`, `contracts/vocabulary.js`, `contracts/constants.js` |
| `contracts/validate.js` | `contracts/vocabulary.js`, `contracts/constants.js` |
| `contracts/vocabulary.js`, `contracts/constants.js` | nothing |

No other edge: in particular no screen imports another screen, no screen outside M6 imports
`state/*`, nothing under `contracts/` imports outside `contracts/`, and nothing imports `main.js`.

**How the static audits treat comments** (M10-U1, M10-U2, M10-U4). A comment executes nothing, so it
can neither make a network call nor hide one. Before matching, each file is reduced to its code by
removing comments with a scanner that understands string literals: in JavaScript, `//` line
comments and `/* */` block comments, skipping over `'…'`, `"…"` and `` `…` `` literals so that
`"https://…"` inside a string is not mistaken for a comment; in CSS, `/* */` comments; in HTML,
`<!-- -->` comments. Everything else is audited, string literals included, because an import
specifier, a `src` or a `url()` is a string. So the placeholder comments in today's `index.html`
and `main.js`, which mention `fetch()` and `data/`, do not fail the audits, and a real call is
still caught wherever it is written. A comment that is not terminated is treated as code to the
end of the file, so a stray `/*` cannot blind the audit. M1-U18's search for level names is a plain
text search over whole files, comments included, because a name must not appear anywhere in
shipped files.

| ID | What is asserted, and when it fails | Inputs and fixtures | Runner | Status |
|---|---|---|---|---|
| M10-U1 *(seeded)* | Static network audit of `index.html`, every file in `assets/` and every file in `data/`: no `fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon` or `<iframe>`; no `import` specifier, `<script src>`, `<link href>`, `<img src>`, `srcset`, CSS `@import`, `url()` or `@font-face` source pointing to an `http:`, `https:` or protocol-relative (`//`) address. Relative references and `<a href>` to any address are allowed. `tests/` and `pipeline/` are not shipped files and are out of scope (DM-11). Fails on any match. | File inventory | both | T at G2 on the seeded files; re-run on every change |
| M10-U2 | Static storage audit of the same files, matching code only, not content prose. In JavaScript (including inline scripts in `index.html`), with comments removed as above and the contents of every string literal blanked, there is no identifier use of `localStorage`, `sessionStorage`, `indexedDB`, `caches`, `serviceWorker`, `document.cookie`, `navigator.storage` or `cookieStore` (as a whole word, bare or after `.`); and, before blanking, no bracket access with a string literal naming any of them (such as `window['caches']`), so access by string cannot slip through. Prose inside strings, such as "caches" in an observability summary in `data/`, does not count. Fails on any match. | File inventory | both | T, as M10-U1 |
| M10-U3 | `index.html` has `<html lang="en">`, a viewport meta element, and an element `id="startup-failure"`, without `hidden` and not hidden by `main.css`, containing exactly "The demo could not load. It makes no network requests. If you opened this file directly from your disk, some browsers block it; please use the hosted version."; it has exactly one module script. In the app host, with `loadFreeze` stubbed to fail, the element stays; with fixtures, it is removed only after the first screen has rendered. Fails on any. | `index.html`; `tests/app-host.html` | both (static), browser (start-up) | I |
| M10-U4 | Import graph. Parsing every `import` statement and `import(` call in `assets/js/` yields only the permitted edges above, with no cycles; no file outside `contracts/load.js` contains the string `data/` or calls `import(`; `loadReveal` is named only in `contracts/load.js` and `screens/trend.js`, and `loadConversation` only in `contracts/load.js` and `screens/scenario.js`; nothing imports from `pipeline/`, `schemas/` or `tests/`; `index.html` has no `modulepreload`, `prefetch` or `preload` link. Fails on any. | File inventory | both | I |
| M10-U5 | Router (C-7). An empty fragment and `#/brief` show the brief; `#/trends`, `#/trend/<id>`, `#/scenario/<id>`, `#/readiness`, `#/governance` and `#/log` show their screens; `#/trend/trend-does-not-exist` shows `F1-E1`; `#/nothing` shows "This page does not exist in this build." with a link to `#/brief` while the navigation and demo-wide statement stay visible; the session survives navigation, checked behaviourally: after recording a gut reading on `trend-fixture-alpha` and visiting every route, returning to that trend shows `F1-S2` with the same gut reading and lens order (the page exposes no handle on the session, and the test needs none; `start()` resolves to `undefined`); with `start({ random: seededRandom(7) })`, the first trend opened shows its readings in `drawLensOrder(seededRandom(7))` order. Fails on any. | `tests/app-host.html` with fixtures | browser | I |
| M10-U6 | Per-screen failure: with `loadLog` stubbed to fail, `#/log` shows `F4-E1` while `#/brief`, `#/trends` and `#/readiness` render normally and `#startup-failure` is not shown. Fails if another screen fails or the application shows `G-E1`. | Loader stub | browser | I |
| M10-U7 | The navigation lists Brief, Trends, Readiness, Governance and Decision log in that order on every screen, with the same template, no scenario item, and no count, badge or "new" marker. Fails on any difference between screens, any template difference or any marker. | `tests/app-host.html` | browser | I |
| M10-U8 | Responsive at the four Q-7 viewports, 360 × 640 and 390 × 844 (portrait) and 1280 × 800 and 1440 × 900 (landscape), each an `<iframe>` of that size loading the app host: on every route, `scrollWidth` does not exceed `clientWidth`; body text's computed `font-size` is at least 16px; every control's bounding box lies within the viewport width; in `F1-S2` the three reading elements have equal computed `font-size` and `font-weight`, and equal widths within 1px when side by side; on arrival at `#/log` the replay statement lies entirely within the viewport. Fails on any. | `tests/app-host.html` with fixtures | browser | I |
| M10-U9 | Test inventory. `tests/lib/files.mjs` lists exactly the files under `assets/` and `schemas/` plus `index.html`, and `tests/unit/index.mjs` imports every `*.test.mjs` and `*.browser.mjs` in `tests/unit/`. This keeps the browser audits from silently missing a file. Fails on any difference. | File system | node | T |

---

## What the Test Engineer should know before starting

**Order of work.** First the shared tooling in `tests/lib/` (harness, assertions, environment,
schema interpreter, seeded random, DOM helpers, file inventory, content source, stage flag) and the
fixtures; then M1, whose tests every content test leans on; then M10's static audits; then the
screen modules in build order (M5, M6, then M7, M8, M9). Tests marked **T** should pass as soon as
they are written: if one fails, either the test or a schema is wrong, and the failure is reported
to the Architect rather than worked around.

**What fails at G2, and why.** At G2 there is no page or pipeline code, so every test that imports
it fails with a missing-module error. That is the test-first rule working, not a defect. Beyond
that, failures must name their cause, so that an open dependency is never mistaken for a defect and
never "fixed" by weakening a test:

- **B** tests fail until the Cowork briefs exist in `pipeline/briefs/` (D-2).
- **G3** parts are skipped with "needs data/ (G3)" until `CONTENT_FROZEN`; then they run, and
  missing data fails.
- **V** parts are skipped with "maturity unverified (D-1)" until the frozen profile is verified;
  the synthetic verified fixture keeps the verified code path tested meanwhile.
- **Q** parts are skipped with "SCENARIO_FLOW is static (O-1)" until the switch is
  `'interactive'`.
- No test now depends on an unset constant: DM-9 fixed them all, and M1-U15 checks each value. The
  M9-U1 failure on viewer entries expected before 4 October is gone: they carry `yours`.

**No Node runtime is installed on the build machine.** Every test file must therefore run in two
places: under `node --test` and from `tests/run.html`, a dependency-free browser page. Node must be
**22.7 or later**: that is the minimum at which `node --test` loads JSON through import attributes
in a repository with no `package.json` (F-9 in the architecture recommends installing it). `tests/run.html` is a module page, so it needs a
static origin: a local static server, or the published GitHub Pages site, which serves the whole
repository root, including `tests/`. It does not start from `file://` in Chromium. No demo page
links to it.

**How a test file is written so that it runs in both.**

1. *Naming.* Pure tests go in `tests/unit/<module>.test.mjs`; DOM tests in
   `tests/unit/<module>.browser.mjs`. `node --test`, run from the repository root, discovers only
   `*.test.mjs` files by its default pattern, so it never loads a DOM test. `tests/unit/index.mjs`
   imports every file of both kinds for the browser runner, and M10-U9 checks that it is complete.
   No fixture or helper file may end in `.test.mjs`.
2. *Imports.* A test file imports only relative ES modules: the code under test, fixtures, and
   `tests/lib/`. It never imports a Node built-in (`node:*`) and never touches `document`, `window`
   or `process` at top level.
3. *Registration.* Tests register through `tests/lib/harness.mjs`:
   ```js
   import { test } from '../lib/harness.mjs';
   import { assert } from '../lib/assert.mjs';
   import { drawLensOrder } from '../../assets/js/state/lens-order.js';

   test('M6-U7 drawLensOrder maps six stub sequences to the six orders', () => {
     const stub = (values) => { let i = 0; return () => values[i++]; };
     assert.deepEqual(drawLensOrder(stub([0, 0])), ['opportunity', 'threat', 'noise']);
   });

   test('M1-U16 every data entity has a pass verdict', { needs: ['data'] }, async () => { /* … */ });
   ```
   The harness detects its environment once (`typeof process !== 'undefined' &&
   process.versions?.node`). Under Node it loads `node:test` with a top-level `await import()` and
   passes each test through, turning unmet `needs` into `skip` with a reason. In the browser it
   collects the tests in a registry that `tests/run.html` executes in sequence, each with a fresh
   scratch root and a five-second timeout, and prints a table of identifier, result and reason, then
   a summary line. The `needs` values are `dom` (browser only), `fs` (Node only: directory listings,
   child processes), `data` (`CONTENT_FROZEN`), `verified` and `questions`.
4. *Assertions.* `tests/lib/assert.mjs`, the project's own: `ok`, `equal` (`Object.is`),
   `deepEqual` (structural), `match`, `includes`, `throws`, `rejects`. Not `node:assert`, so that
   both runners use the same code.
5. *Files.* There is no `fetch()` or XHR anywhere in the repository, tests included, unless Miguel
   approves DM-11 (`03-architecture.md`, section 15). Paths are built with
   `repoUrl('schemas/trend.schema.json')` (a `URL` relative to the repository root, from
   `import.meta.url`), which works in both runners. `tests/lib/env.mjs` provides:
   - `importJson(url)`: JSON through an import attribute,
     `import(url, { with: { type: 'json' } })`, in both runners; `tests/lib/schemas.mjs` loads every
     schema this way;
   - `importUnderTest(url)`: a module under test, failing with a message that names the missing
     file and the test-first rule;
   - `readText(url)`: raw text, through `node:fs/promises` imported dynamically under Node; in the
     browser it throws a skip with the reason "needs Node or DM-11", so such a test is reported as
     skipped and never passes silently;
   - `listFiles(url)` and `nodeBuiltin(name)`: Node only, skipping in the browser.

   In the browser, file sets come from `tests/lib/files.mjs` and, for `data/`, from the freeze
   manifest; M10-U9 keeps `files.mjs` complete. Listings include dotfiles, and every comparison of a
   directory with a manifest ignores paths with a segment that begins with a dot. If DM-11 is
   approved, `readText` gains a same-origin `fetch()` branch in `env.mjs` and nowhere else.
6. *Randomness and time.* Never `Math.random` or `Date.now` in a test: use `seededRandom(seed)` from
   `tests/lib/seeded-random.mjs` (Mulberry32) and an injected clock. Seeds used by a test are
   written in the test.
7. *Whole-app tests.* `tests/lib/dom.mjs` provides `mount()` for screen tests and
   `appFrame({ width, height, hash, options })`, which loads `tests/app-host.html` into a
   same-origin `<iframe>` of the given size, with the options (fixture loader, random source,
   storage stubs) handed to `start()`. Viewport tests (M10-U8) rely on the iframe's size being the
   viewport its media queries see.

**Integration and system level.** The NF1 integration matrix (local server in Chromium and Firefox;
`file://` in Firefox, and in Chromium expecting `G-E1`) is in `03-architecture.md`, section 9, now
covering F1 to F5. The system-level check for invariant audit 2 reads
`performance.getEntriesByType('resource')` in `F1-S1` and requires that no `data/reveal/` entry
exists, and in `F5-S1` that no `data/conversation/` entry exists. Invariant audit 5 in
`test-plan.md` still lists five labels; it should list the six (F-10 in the architecture).
