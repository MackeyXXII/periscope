# Level 4 — Module design

**Status: designed by the Architect on 19 September 2026; awaiting G2. Owner: Architect (design)
and Test Engineer (paired unit tests). Gate: G2.**

Ten modules implement the four flows. Each unit test below is written by the Test Engineer
**before** the Implementer opens that module. The design decisions behind these modules are in
`03-architecture.md`; this document states, for each module, what it takes in, what it produces,
which entities it touches, what it may import, where it lives, and the one invariant it is most
likely to break. It then lists its unit tests as statements the Test Engineer can write directly,
each with the condition under which it fails.

## Summary

| Module | Purpose | Runs | Seeded unit test (kept) |
|---|---|---|---|
| M1 Data contracts | Schemas, runtime validator, data loader, freeze step | Offline and in the page | All fixtures validate against the schemas |
| M2 Persona and scanning brief | Scenario ground truth | Offline (Cowork) | Every named competitor and regulation is real and dated |
| M3 Scan pipeline | Scout output into signals | Offline | Every signal has a URL, a date and a summary |
| M4 Interpretation pipeline | Trends into rival readings and interrogation | Offline | Exactly three readings per trend; each has a disconfirming condition; no `score` or `rank` field exists |
| M5 Brief composer | R1 attention budget, F2 screen | Offline and in the page | Signal count within the cap; estimated reading time 10 minutes or less |
| M6 Judgement capture | F1: intuition first, then commit | In the page | AI readings stay hidden until intuition is recorded; commit disabled without a rationale |
| M7 Readiness and maturity | F3 and the governance screen | In the page | All five readiness categories present; level names match the verified report |
| M8 Decision log and replay | F4 | In the page | Every replay entry carries a dated, real outcome source |
| M9 Honesty and provenance layer | NF2 and NF3 in the page | In the page | Every AI-generated, fictional or replayed element carries its label |
| M10 UI shell and navigation | Click path across F1 to F4 | In the page | No external network requests at runtime |

## Conventions for every test below

- **Identifiers.** `M<n>-U<k>`. The seeded tests keep their meaning and are marked *(seeded)*.
- **Runner.** *node* means a plain ES module test under `node --test`, with no dependencies.
  *browser* means a test that needs a real DOM, run from the test page in `tests/unit/` served by a
  local static server. Pure logic is always tested under node; only rendering needs the browser.
- **Fixtures.** Until G3, content tests run against small synthetic samples in `tests/fixtures/`,
  each file headed as fictional test data and never imported by the page. From G3 the same tests
  also run against `data/`, and a content test that finds `data/` empty after G3 fails.
- **Constants.** `BRIEF_SIGNAL_CAP`, `READING_WPM`, `QUOTE_MAX_WORDS`, `REPLAY_WINDOW_START`,
  `REPLAY_WINDOW_END` and `VERIFIED_LEVEL_NAMES` live in `assets/js/contracts/constants.js` and
  are `null` until Miguel sets them (DM-9, D-1). A test that needs a constant fails while it is
  `null`. That is intended: the test is reporting an open decision.
- **"Fails when"** states the concrete condition that makes the test fail. A test that cannot fail
  is not a test.

---

## M1 Data contracts

| | |
|---|---|
| **Purpose** | Define what every piece of content must look like, prove every fixture conforms before it ships, and guard the invariants again at the moment the page loads content. The only module that touches `data/`. |
| **Inputs** | The pipeline's raw JSON in `pipeline/output/` and the Verifier's record (for the freeze step); the frozen modules in `data/` (for the loader). |
| **Outputs** | `schemas/*.json`; the ES modules in `data/`, written once at G3; for the page, validated and deep-frozen content, or a typed failure the calling screen turns into its error state. |
| **Entities touched** | All seven entities and all four containers. |
| **May import** | Nothing. M1's runtime files are leaves. The freeze script imports only Node built-ins (`node:fs`, `node:path`, `node:crypto`). |
| **Lives in** | `schemas/*.json`; `assets/js/contracts/vocabulary.js` (labels, lenses, banned tokens, identifier patterns); `assets/js/contracts/constants.js`; `assets/js/contracts/validate.js`; `assets/js/contracts/load.js`; `pipeline/freeze.mjs`. Test tooling: `tests/lib/mini-schema.mjs`. |
| **Invariant most at risk** | **Invariant 1, no ranking.** A contract that admits one extra field, one numeric type or one ordinal enumeration lets every agent downstream carry a ranking into the demo with the schema's blessing. The closed-object, no-number and allowlisted-enumeration rules exist to shut this off. |

**Loader interface.** `loadFreeze()`, `loadSignals()`, `loadTrends()`, `loadBrief()`,
`loadReadiness()`, `loadGovernance()`, `loadLog()`, and `loadReveal(trendId)`. Each resolves to
`{ ok: true, value }` with a deep-frozen value, or `{ ok: false, reason, withheld }`, and never
throws. Each uses dynamic `import()` with a literal path, except `loadReveal`, which builds its
path only from an identifier that matches the trend identifier pattern and appears in the loaded
trend list. Per-item checks that withhold single items (signals in F2, entries in F4) return the
valid items plus a count of withheld ones.

| ID | Statement | Fails when | Runner |
|---|---|---|---|
| M1-U1 *(seeded)* | Every fixture validates against its schema using the test-side interpreter: each element of `data/signals.js`, `data/trends.js` and `data/log.js`; `data/brief.js`, `data/readiness.js`, `data/governance.js`, `data/freeze.js`; and every `data/reveal/*.js`. | Any fixture produces a validation error. | node |
| M1-U2 | No property name declared anywhere in `schemas/` (under `properties` at any depth, including inside `$defs`) and no key present anywhere in any fixture has a camelCase or hyphen-separated token in the banned list: score, rank, ranking, ranked, confidence, priority, prioritised, prioritized, weight, weighting, likelihood, probability, importance, rating, featured, highlight, recommended, recommendation, top, best, winner. | Any property name or fixture key contains a banned token. | node |
| M1-U3 | No schema declares `type` `number`, `integer` or `boolean`, alone or in a type array, at any depth. | Any such declaration exists. | node |
| M1-U4 | Every subschema in `schemas/` that declares `type: "object"` also declares `additionalProperties: false`. | An object subschema lacks it or sets it to anything else. | node |
| M1-U5 | Every `enum` in `schemas/` equals, or is a subset of, one of the five allowlisted enumerations in `vocabulary.js` (label, lens, producer, maturity status, readiness category key); the label and lens enumerations in `common.schema.json` equal the constants in `vocabulary.js` exactly; each identifier pattern in `common.schema.json` equals its counterpart in `vocabulary.js`. | Any other enumeration exists, or a schema value and its `vocabulary.js` constant differ. | node |
| M1-U6 | Mutation agreement. For a valid sample of each entity and container, generate mutants: each required property removed in turn; `score: "x"` added to every object at every depth; a reading reference's lens duplicated; a fourth reading reference added; one removed; rationale set to `""`, `" "` and `"\n\t"`; intuition removed; an evidence item's `publishedOn` removed; a Signal's `provenance.sourceUrl` set to null; a label outside the vocabulary. Every mutant is rejected by both the schema interpreter and `validate.js`. | Either validator accepts any mutant. | node |
| M1-U7 | The test-side interpreter supports every keyword used in `schemas/`, and throws on a schema that uses a keyword outside its supported list (checked with a deliberately bad schema). | A keyword in `schemas/` is unsupported, or the bad schema does not throw. | node |
| M1-U8 | A Trend whose reading references have lenses `[opportunity, opportunity, noise]`, or `[opportunity, threat]`, or four references, is rejected by the schema and by `checkTrend`; all six orderings of a valid set of three are accepted by both. | Any invalid set is accepted, or any valid ordering is rejected. | node |
| M1-U9 | Referential integrity across files. Every `Trend.signalIds` entry resolves to a Signal; every Trend has exactly one reveal bundle whose `trendId` equals its `id`; in each bundle, each Reading's `trendId` equals the bundle's, each Reading's `id` equals the `readingId` the Trend holds for that Reading's lens, and equals `reading-<trend slug>-<lens>`; the Interrogation's `trendId` equals the bundle's; every `Brief.signalIds` entry resolves to a Signal; no two Signals share a `provenance.sourceUrl`. | Any reference dangles or any pair of identifiers disagrees. | node |
| M1-U10 | `checkJudgement` accepts a well-formed Judgement and rejects one with no `intuition`; one whose rationale is `""`, `"   "` or `"\n"`; one whose `readingsRevealedAt` is earlier than `intuition.recordedAt`; and one whose `committedAt` is earlier than `readingsRevealedAt`. | Any of the four invalid Judgements is accepted, or the valid one is rejected. | node |
| M1-U11 | The freeze script refuses to write anything when an entity in its input has no `pass` verdict in the verification record, when the entity's canonical-JSON SHA-256 differs from the recorded hash, or when an entity fails its schema; it exits non-zero and leaves the output directory unchanged. Run against copies in a temporary directory. | The script writes any file, or exits zero, in any of the three cases. | node |
| M1-U12 | `loadReveal` refuses `"../x"`, `"trend-unknown"` (well-formed but not in the trend list) and `"Trend-A"` without calling the injected importer, and returns `{ ok: false }`. | The importer is called for any of the three, or the loader throws. | node |
| M1-U13 | Freeze determinism and inert modules. Running the freeze script on `tests/fixtures/pipeline/` produces output byte-identical to `tests/fixtures/expected-data/`; from G3, running it on `pipeline/output/` reproduces the committed `data/` byte for byte. Every file in `data/` contains exactly one `export default` and no `import`, `function`, `=>` or `new`. `data/freeze.js` lists exactly the files present in `data/`. | Any byte differs, any data module contains code, or the manifest and the directory disagree. | node |

---

## M2 Persona and scanning brief

| | |
|---|---|
| **Purpose** | The scenario's ground truth: who Tracewell is, what it faces in early 2026, which real incumbents, technologies and regulations surround it, what the Scout scans, and which early-2026 signals have documented outcomes for the replay. |
| **Inputs** | Public sources, researched in Claude Cowork by the Persona and Brief Researcher. |
| **Outputs** | `pipeline/briefs/persona-dossier.md`, `scanning-brief.md`, `replay-candidates.md`. Each carries a section headed "Named entities" with a table of columns Name, Kind, Source URL, Date (follow-up F-5 in the architecture). |
| **Entities touched** | None directly. Feeds Signal (through M3), ReadinessProfile (M7) and LogEntry (M8). |
| **May import** | Not code. No page file may reference `pipeline/briefs/`. |
| **Lives in** | `pipeline/briefs/`. Test: `tests/unit/m2-briefs.test.mjs`. |
| **Invariant most at risk** | **Invariant 4, every factual claim is sourced.** The dossier is where real-world facts about Dynatrace, OpenTelemetry and EU regulation enter the project, and an unsourced fact here propagates into every downstream agent's output as if it were ground truth. |

| ID | Statement | Fails when | Runner |
|---|---|---|---|
| M2-U1 *(seeded, made testable)* | Every row of every "Named entities" table has a non-empty name, a Kind from {competitor, incumbent, technology, regulation, standard, publication}, an `https://` Source URL and an ISO date. Whether the entity is real is the Verifier's check at G3; this test guarantees the claim is checkable. | A briefs file lacks the section, or any row lacks a field or has a malformed URL or date. | node |
| M2-U2 | Every organisation named in any fixture's `publisher` field, and the words "Dynatrace" and "OpenTelemetry" wherever they appear in fixture text, appear as a Name in some "Named entities" table. | A fixture names a publisher or incumbent not in the tables. | node |
| M2-U3 | The persona dossier states that Tracewell is fictional, lists exactly five readiness categories, and cites Jöhnk et al. (2021) with an `https://` URL and a date. | Any of the three is missing. | node |
| M2-U4 | The scanning brief states a time window as two ISO dates, start before end. | The window is missing, malformed or reversed. | node |
| M2-U5 | Every entry in `replay-candidates.md` has both an original-signal URL and date and an outcome URL and date, with the outcome date later. | Any candidate lacks either source or has the dates reversed. | node |

---

## M3 Scan pipeline

| | |
|---|---|
| **Purpose** | Turn the Scout's run against the scanning brief into verified, dated, linked Signals. |
| **Inputs** | `pipeline/briefs/scanning-brief.md`; the open web, through the Scout, once, offline. |
| **Outputs** | `pipeline/output/signals.json`; after the freeze, `data/signals.js`. |
| **Entities touched** | Signal. |
| **May import** | Not page code. Writes to `schemas/signal.schema.json`. |
| **Lives in** | `pipeline/output/signals.json`, `data/signals.js`. Test: `tests/unit/m3-signals.test.mjs`. |
| **Invariant most at risk** | **Invariant 4, every factual claim is sourced**, in its most serious form: a fabricated or mis-dated signal is a project-ending defect. The contract forces a URL and dates to be present; only the Verifier can confirm they are true, which is why the freeze step refuses anything the Verifier did not pass. |

| ID | Statement | Fails when | Runner |
|---|---|---|---|
| M3-U1 *(seeded)* | Every Signal has an `https://` `provenance.sourceUrl`, a publisher, a `publishedOn`, a `retrievedOn` and a non-empty `summary.text`. | Any Signal lacks any of them. | node |
| M3-U2 | For every Signal, `publishedOn` ≤ `retrievedOn` ≤ `frozenOn`. | Any Signal has a date out of that order, for example a retrieval before publication. | node |
| M3-U3 | Every Signal whose `publishedOn` falls outside the scanning brief's window carries a `windowNote`, and no Signal inside the window carries one. | A signal outside the window has no note, or one inside has a note. | node |
| M3-U4 | Every `quote` has at most `QUOTE_MAX_WORDS` words (split on whitespace). | Any quote is longer, or `QUOTE_MAX_WORDS` is `null`. | node |
| M3-U5 | The date inside every Signal `id` equals its `publishedOn`, so identifiers cannot encode an order of importance. | Any identifier's date differs from its publication date. | node |
| M3-U6 | No `summary.text`, `relevanceNote.text` or `windowNote` contains a C-6 forbidden term (best, better option, recommended, recommendation, top, priority, prioritise, rank, ranking, score, confidence, most important, most likely, key signal, must-read, winner) or a relevance level (high, medium, low, critical, minor) as a whole word, case-insensitive. Quotes are excluded here and listed for Red-team review instead (C-6). | Any match. | node |

---

## M4 Interpretation pipeline

| | |
|---|---|
| **Purpose** | Turn signals into lens-neutral trends, three rival readings per trend, and the questioning layer. |
| **Inputs** | `pipeline/output/signals.json`; the Trend Analyst, three Rival Readers and the Interrogator, once, offline. |
| **Outputs** | `pipeline/output/trends.json`, `readings.json`, `interrogations.json`; after the freeze, `data/trends.js` and one `data/reveal/<trendId>.js` per trend. |
| **Entities touched** | Trend, Reading, Interrogation; RevealBundle. |
| **May import** | Not page code. Writes to the Trend, Reading and Interrogation schemas. |
| **Lives in** | The files above. Test: `tests/unit/m4-interpretation.test.mjs`. |
| **Invariant most at risk** | **Invariant 1, no ranking**, through its subtle form: one reading written with more force, more evidence or more questioning than its peers, or a trend summary that already leans one way. The contract equalises the structure; the lexical tests below catch the crudest leaks, and the Verifier and Red-team catch the rest. |

| ID | Statement | Fails when | Runner |
|---|---|---|---|
| M4-U1 *(seeded)* | Every Trend has exactly three reading references with lenses exactly {noise, opportunity, threat}, and its reveal bundle has exactly three Readings with the same lenses. | Any trend or bundle has a missing, extra or duplicated lens. | node |
| M4-U2 *(seeded)* | Every Reading has non-empty `text`, at least one `evidence` item and at least one `counterEvidence` item each with a full `sourceRef`, and a non-empty `disconfirmingCondition`. | Any Reading lacks any of them. | node |
| M4-U3 *(seeded)* | No key named `score`, `rank`, `confidence` or `priority`, or containing any banned token from M1-U2, exists anywhere in `data/trends.js` or any reveal bundle, at any depth. | Any such key exists. | node |
| M4-U4 | Every evidence and counter-evidence source has `publishedOn` ≤ `retrievedOn` ≤ the bundle's `frozenOn`. | Any source date is out of order. | node |
| M4-U5 | Lens neutrality before the gut reading. No Trend `title`, `summary` or `intuitionPrompt` contains, as a whole word and case-insensitively, opportunity, opportunities, threat, threats, threatening, noise, noisy, risk, risky, danger, dangerous, promising, overhyped or hype. (A lexical floor only; the Verifier judges neutrality at G3.) | Any match. | node |
| M4-U6 | No intuition prompt shares a run of six or more consecutive words (case-insensitive, punctuation stripped) with any text in its trend's readings. | Any shared run of six words exists. | node |
| M4-U7 | No Reading refers to another lens's reading: an opportunity reading's text does not contain the phrases "threat reading" or "noise reading", and likewise for each lens. | Any cross-reference phrase appears. | node |
| M4-U8 | Every Interrogation has one to three provenance checks, one to three assumption probes and one pre-mortem; every question's text ends with "?"; question identifiers are unique across all interrogations. | Any group is empty or over three, any question lacks the question mark, or an identifier repeats. | node |
| M4-U9 | No reading, evidence item, disconfirming condition or question contains a C-6 forbidden term (as listed in M3-U6) as a whole word. | Any match. | node |

---

## M5 Brief composer

| | |
|---|---|
| **Purpose** | R1's attention budget made concrete: a small set of signals that reads in about ten minutes, each a door into F1 (F2). |
| **Inputs** | Offline: verified signals, through the Brief Editor. In the page: the Brief container, the Signals, and the Trends (only to draw each signal's trend links). |
| **Outputs** | Offline: `pipeline/output/brief.json` and `data/brief.js`. In the page: screen states `F2-S1`, `F2-S0`, `F2-W1`, `F2-S2`, `F2-E1`. |
| **Entities touched** | Brief (container), Signal; Trend read-only for titles and identifiers, never its readings. |
| **May import** | M1 (`load.js`, `validate.js`, `constants.js`), M9, M10's leaf `shell/routes.js`. |
| **Lives in** | `assets/js/screens/brief.js`; `data/brief.js`. Test: `tests/unit/m5-brief.test.mjs` (node) and `tests/unit/m5-brief.browser.mjs` (browser). |
| **Invariant most at risk** | **Invariant 1, no ranking.** A digest is the format most easily read as "the important things, most important first". The order rule, the ordering note and identical templates are what keep it a list of peers. |

| ID | Statement | Fails when | Runner |
|---|---|---|---|
| M5-U1 *(seeded)* | The number of signals in the brief is at most `BRIEF_SIGNAL_CAP`. | The count is greater, or the constant is `null`. | node |
| M5-U2 *(seeded)* | The total word count of all text rendered in `F2-S1` (the `textContent` of the screen, split on whitespace) divided by `READING_WPM` is at most 10. | The estimate exceeds 10 minutes, or `READING_WPM` is `null`. | browser |
| M5-U3 | The pure ordering function returns signals by `publishedOn` newest first, ties by `id` ascending, for every one of at least ten random permutations of `Brief.signalIds`, and always returns the same order. | Any permutation yields a different order. | node |
| M5-U4 | Every signal in the brief appears in at least one Trend's `signalIds`; the test reports the orphans by identifier. | Any brief signal belongs to no trend. | node |
| M5-U5 | Given a brief where two signals fail the per-signal check (one with no `publishedOn`, one with no relevance note), the rendered screen contains no text from either, and contains the notice with N = 2. | Any text of a withheld signal is rendered, or the notice is missing or has the wrong count. | browser |
| M5-U6 | Every signal element in `F2-S1` has the same tag, the same class list and the same child structure, and no element carries a class, attribute or text marking it as new, pinned, featured or relevant. The ordering note "Listed by publication date. The order says nothing about importance." is present. | Any signal element differs in template, or a marker is present, or the note is missing. | browser |
| M5-U7 | A signal belonging to two trends shows two links, in alphabetical order of trend title, each with `href` equal to the route for that trend. | Links are missing, out of order or point elsewhere. | browser |
| M5-U8 | Nothing in `F2-S1` shows a count, level or marker of relevance: the interface text the screen adds around the fixture fields (everything except the rendered signal titles, summaries, quotes and relevance notes) contains no "high", "medium", "low" or "relevance:"; no signal element contains a position number (such as "1." or "#1"); and the screen contains no `<meter>` or `<progress>` element. | Any is present. | browser |

---

## M6 Judgement capture

| | |
|---|---|
| **Purpose** | F1, the core loop: trend index, trend card, gut reading, the three readings, interrogation, and the committed judgement with a rationale. Holds session state. |
| **Inputs** | Trends and Signals through the M1 loader; the trend's reveal bundle through `loadReveal`, only after the intuition record; the viewer's actions. |
| **Outputs** | Screen states `F1-S0`, `F1-S0e`, `F1-S1`, `F1-S2`, `F1-S3`, `F1-S4`, `F1-E1`, `F1-E2`, and, if Level 2 accepts them, `F1-E0` and `F1-E3`. In memory: intuition records and Judgements. |
| **Entities touched** | Trend, Signal, Reading, Interrogation (read); Judgement (created in memory). |
| **May import** | M1, M9, M10's leaf `shell/routes.js`. |
| **Lives in** | `assets/js/screens/trend-index.js`, `assets/js/screens/trend.js`, `assets/js/state/session.js`. Tests: `tests/unit/m6-judgement.test.mjs` (node: state machine, gating, ordering) and `tests/unit/m6-judgement.browser.mjs` (browser: DOM). |
| **Invariant most at risk** | **Invariant 2, intuition before AI.** This module holds the only code path that loads readings. One early call to `loadReveal`, one pre-rendered hidden element, or one reading string in an attribute breaks the invariant while the screen still looks correct. |

**Interface.** `createSession()` returns the session object. Pure functions: `canRecord(draft)`,
`canCommit(draft)`, `whatIsMissing(draft)`, `orderReadings(readings)`, `recordIntuition(session,
trendId, draft, now)`, `commitJudgement(session, trendId, draft, now)`. The screen's render
function receives the session, the loader functions (so a test can inject a spy for `loadReveal`)
and a root element.

| ID | Statement | Fails when | Runner |
|---|---|---|---|
| M6-U1 *(seeded)* | In `F1-S1`, the serialised page (`document.documentElement.outerHTML`, which includes attributes, comments and `<template>` contents) contains none of the fixture's reading texts, evidence claims, counter-evidence claims, disconfirming conditions or interrogation questions other than the intuition prompt; and the injected `loadReveal` spy has not been called. | Any such string appears, or the spy has been called. | browser |
| M6-U2 | After "Record my gut reading" is activated and the returned promise settles, the spy has been called exactly once with the trend's identifier, and the page contains all three readings' texts and disconfirming conditions. | The spy is called zero or more than one time, or any reading is missing. | browser |
| M6-U3 *(seeded)* | `canCommit` is false for rationale `""`, `" "`, `"\n\t "` with a lens chosen, and for rationale `"x"` with no lens; true for rationale `"x"` with a lens. In the page, "Commit judgement" has the `disabled` attribute in each false case, and a line of text names what is missing. | Any false case enables commit, the true case does not, or the missing-item line is absent. | node and browser |
| M6-U4 | In `F1-S1` no lens option is selected and "Record my gut reading" is disabled until one is chosen. In `F1-S2` no lens is selected in the judgement control, including the lens of the recorded gut call. | Any lens is pre-selected, or the record button is enabled with no lens. | browser |
| M6-U5 | After the record, the stored intuition record satisfies `Object.isFrozen`, an attempt to change its `gutCall` leaves it unchanged, the gut-reading controls are disabled, and calling `recordIntuition` again for the same trend throws. | The record is mutable, a control is enabled, or a second record succeeds. | node and browser |
| M6-U6 | After commit, the Judgement satisfies `Object.isFrozen`; calling `commitJudgement` again for the same trend throws; the page shows `F1-S4` with no enabled commit control and no editable field. | A second commit succeeds, or any field remains editable. | node and browser |
| M6-U7 | For each of the six orderings of the readings array in the reveal bundle, the rendered readings appear in the order noise, opportunity, threat; the three reading elements have the same tag, class list and child structure; and the note "The three readings are peers. They appear in alphabetical order of their lens." is present. | Any ordering renders differently, any reading element differs in template, or the note is missing. | node (`orderReadings`) and browser |
| M6-U8 | Recording and committing on trend A leaves trend B at `awaiting-intuition`. Navigating from A to the brief and back to A shows A at the stage it reached. | B's state changes, or A does not resume. | node and browser |
| M6-U9 | With `localStorage`, `sessionStorage`, `indexedDB`, `caches` and the `document.cookie` setter replaced by stubs that record any access, a full walk from `F1-S1` to `F1-S4` records no access. | Any stub records an access. | browser |
| M6-U10 | `F1-S4` contains the statement that the judgement is held only in this tab, is not saved or sent, will be gone on reload and does not appear in the decision log; and, outside the viewer's own echoed text (gut reason, answers, rationale, which the test sets to neutral strings), contains none of the words match, mismatch, correct, wrong, agree, disagree, changed your mind. | The statement is missing, or any evaluative word appears. | browser |
| M6-U11 | With a reveal bundle that fails `checkRevealBundle` (one Reading without counter-evidence), recording the gut reading shows `F1-E3`: the gut reading stays visible and no text from any of the three readings, or any interrogation question, is rendered. | Any reading or question text is rendered, or the gut reading disappears. | browser |
| M6-U12 | Route `#/trend/trend-does-not-exist` shows `F1-E1`. A Trend with two reading references shows `F1-E2`, and the page contains neither its title nor any of its signals' titles. | The wrong state is shown, or any part of the withheld trend is rendered. | browser |
| M6-U13 | The Judgement produced by a full walk passes `checkJudgement`, with `intuition.recordedAt` ≤ `readingsRevealedAt` ≤ `committedAt`, `provenance.producedBy` equal to `["viewer"]` and `provenance.frozenOn` null. | Validation fails or the order is violated. | node |
| M6-U14 | Every `<input>` and `<textarea>` on the trend screen has `autocomplete="off"`; after a walk in which the viewer types the reason "zebra-test-reason" and the rationale "zebra-test-rationale", `location.href` contains neither string. | Any field lacks the attribute, or either string appears in the URL. | browser |

---

## M7 Readiness and maturity

| | |
|---|---|
| **Purpose** | F3: Tracewell's readiness across the five Jöhnk et al. categories, the maturity view held at `LEVEL_NAME_UNVERIFIED`, and the governance screen (R8). |
| **Inputs** | The ReadinessProfile and the Governance container through the M1 loader. Offline, the persona dossier (M2) and the governance content (author unassigned, Q-5). |
| **Outputs** | `data/readiness.js`, `data/governance.js`; screen states `F3-S1`, `F3-S2`, `F3-S3`, `F3-E1`, `F3-E2`. |
| **Entities touched** | ReadinessProfile; Governance (container). |
| **May import** | M1, M9, M10's leaf `shell/routes.js`. |
| **Lives in** | `assets/js/screens/readiness.js`, `assets/js/screens/governance.js`. Tests: `tests/unit/m7-readiness.test.mjs`, `tests/unit/m7-readiness.browser.mjs`. |
| **Invariant most at risk** | **Invariant 1, no ranking**, in the form of a score. A readiness diagnostic invites bars, traffic lights and "you are strongest in…". The contract has no numbers to draw them from; the screen must not invent them. The unverified level name is the other exposure, guarded by the schema's pinned placeholder. |

| ID | Statement | Fails when | Runner |
|---|---|---|---|
| M7-U1 *(seeded)* | The profile has exactly five categories, with keys in the order strategic-alignment, resources, knowledge, culture, data (or the order confirmed under DM-8), each with at least one answer and a non-empty finding; the screen renders them in the same order. | A category is missing or repeated, or the order differs in the data or on screen. | node and browser |
| M7-U2 *(seeded, restated for G2)* | While `maturity.status` is `unverified`, the maturity view renders the literal `LEVEL_NAME_UNVERIFIED` and the sentence "Level name pending verification against the OECD/WEF report.", and neither `explanation` nor any other level name is rendered. Once D-1 is resolved, `levelName` is one of `VERIFIED_LEVEL_NAMES`, the list Miguel confirms against the report. | Any other level name appears while unverified, or after verification the name is not in the confirmed list. | node and browser |
| M7-U3 | `F3-S1` contains no `<meter>`, `<progress>`, `<svg>` or `<canvas>` element, no element with `role="meter"` or `role="progressbar"`, and no inline style setting `width` in `%` inside the categories area. | Any is present. | browser |
| M7-U4 | A profile with four categories shows `F3-E1` and renders none of the four categories' names, answers or findings. | Any category content is rendered. | browser |
| M7-U5 | The governance screen shows headings "Implemented in this demo" and "Not implemented", every item of each list, and, for each implemented item, the test identifiers in its `verifiedBy`; every argument paragraph shows at least one source link with its date. | A heading, item, test identifier or dated source is missing. | browser |
| M7-U6 | The governance content contains the required items by identifier: implemented `open-web-sources-frozen`, `no-viewer-data-stored-or-sent`, `no-live-ai`, `no-accounts-cookies-analytics`; not implemented `own-data-ingestion`, `cross-session-persistence`, `role-aware-model`; and every test identifier in any `verifiedBy` exists in this document. | Any item is missing, or a `verifiedBy` names a test that does not exist. | node |
| M7-U7 | While K-2 is open, the next-complement view renders exactly "Pending: the next complement depends on the verified level definitions." and nothing else. | Any other text is rendered there. | browser |

---

## M8 Decision log and replay

| | |
|---|---|
| **Purpose** | F4: the retrospective replay of real early-2026 signals, a judgement attributed to the fictional team, the real outcome by September 2026, and a qualitative calibration note (R5). |
| **Inputs** | LogEntries through the M1 loader. Offline, the replay candidates (M2), with the authorship of past judgements still open (K-7). |
| **Outputs** | `data/log.js`; screen states `F4-S1`, `F4-S0`, `F4-W1`, `F4-E1`. |
| **Entities touched** | LogEntry. |
| **May import** | M1, M9, M10's leaf `shell/routes.js`. |
| **Lives in** | `assets/js/screens/log.js`. Tests: `tests/unit/m8-log.test.mjs`, `tests/unit/m8-log.browser.mjs`. |
| **Invariant most at risk** | **Invariant 4, every factual claim is sourced**, at its sharpest: an outcome that did not happen, or a date that makes a judgement look prescient, is a project-ending defect. The second exposure is invariant 1: any tally of readings that held becomes a scoreboard. |

| ID | Statement | Fails when | Runner |
|---|---|---|---|
| M8-U1 *(seeded)* | Every LogEntry's outcome has an `https://` source with a `publishedOn` later than every original signal's `publishedOn` and no later than the entry's `frozenOn`. | Any outcome is undated, not later than a signal, or dated after the freeze. | node |
| M8-U2 | Every original signal's `publishedOn` falls within `REPLAY_WINDOW_START` to `REPLAY_WINDOW_END` inclusive. | Any signal falls outside, or either constant is `null`. | node |
| M8-U3 | The pure ordering function returns entries by earliest original-signal `publishedOn`, oldest first, ties by `id` ascending, for at least ten random permutations; the date in each entry `id` equals its earliest original signal's date. | Any permutation yields a different order, or an identifier's date disagrees. | node |
| M8-U4 | In `F4-S1`, `F4-S0`, `F4-W1` and `F4-E1` the replay statement is the first content element in the screen, before any entry, and contains the sentences required by F4 step 1, including that the judgements were written after the fact and are not the viewer's. | The statement is missing, incomplete or not first. | browser |
| M8-U5 | `F4-S1` contains no aggregate or verdict: no text matching `\d+\s*(of|/)\s*\d+` or `%`, no `<svg>`, `<img>`, `<canvas>`, `<meter>` or `<progress>` inside any entry, and every entry element has the same class list. | Any match, graphic or differing class list. | browser |
| M8-U6 | An entry whose outcome lacks a source date is withheld: none of its text is rendered, and the notice shows N = 1. | Any of its text is rendered, or the notice is wrong. | browser |
| M8-U7 | For every entry, `pastJudgement.asOfDate` is on or after the latest original signal's `publishedOn` and before the outcome's `publishedOn`, and `pastJudgement.authoredOn` is on or after the outcome's `publishedOn`. | Any date is out of that order. | node |
| M8-U8 | R7 is designed for, not built: no fixture LogEntry has a `role`, and no file in `assets/js/` other than `validate.js` contains the property access `.role` or `["role"]`. (Setting the ARIA `role` attribute with `setAttribute` is unaffected.) | Any fixture carries a role, or any page code other than the validator reads it. | node |

---

## M9 Honesty and provenance layer

| | |
|---|---|
| **Purpose** | Render every honesty label, every source citation and the demo-wide statement, identically everywhere, so that NF2 and NF3 hold by construction rather than screen by screen. |
| **Inputs** | Label values, `sourceRef` objects, the freeze manifest. |
| **Outputs** | DOM fragments: `renderLabel(value)`, `renderSource(sourceRef)`, `renderQuote(text, sourceLanguage)`, `renderDemoStatement(manifest)`. |
| **Entities touched** | The label and provenance parts of every entity; FreezeManifest. |
| **May import** | M1 only. |
| **Lives in** | `assets/js/honesty/labels.js`, `assets/js/honesty/sources.js`, `assets/js/honesty/statement.js`. Tests: `tests/unit/m9-honesty.test.mjs`, `tests/unit/m9-honesty.browser.mjs`. |
| **Invariant most at risk** | **Invariant 5, honest labelling.** A label that is present but wrong is worse than a missing one, because it passes a presence check. The mechanism guarantees presence and vocabulary; correctness of each label is reviewed by the Red-team at G3 and G4. |

| ID | Statement | Fails when | Runner |
|---|---|---|---|
| M9-U1 *(seeded)* | On every screen of a full walk, every element with `data-content` has a `data-label` whose value is in the vocabulary, and a visible label element whose text is the display form of that value. (Expected to fail on the viewer's own entries until DM-1 is decided.) | Any content element lacks either form, or carries a value outside the vocabulary. | browser |
| M9-U2 | `renderLabel` throws for `"verified"`, `""`, `undefined` and `"AI"`, and returns an element for each of the five vocabulary values. | Any invalid value is accepted, or a valid one throws. | browser |
| M9-U3 | `renderSource` returns an `<a>` whose `href` equals the source URL and starts with `https://`, with `target="_blank"` and `rel` containing `noopener` and `noreferrer`, followed by visible text containing the publisher and the publication date; it throws for a `sourceRef` without `publishedOn`. | Any attribute or text is missing, or an undated source renders. | browser |
| M9-U4 | Every route (`#/brief`, `#/trends`, one `#/trend/<id>`, `#/readiness`, `#/governance`, `#/log`) renders the demo-wide statement with the freeze date from `data/freeze.js`. | Any screen lacks the statement or shows a different date. | browser |
| M9-U5 | The three reading elements on a trend card carry byte-identical label markup. | The label markup of any reading differs from another's. | browser |
| M9-U6 | For a Signal whose `summary.label` differs from the entity's `label`, the summary shows its own label; for a LogEntry, the original signal, past judgement, outcome and calibration note each show their own label. | Any part with its own label shows the entity's label instead, or none. | browser |
| M9-U7 | `renderQuote` wraps the quote in `<q>` with a `lang` attribute equal to `sourceLanguage` and follows it with the publisher; it throws for a quote longer than `QUOTE_MAX_WORDS`. | The markup is wrong, the attribution is missing, or a long quote renders. | browser |

---

## M10 UI shell and navigation

| | |
|---|---|
| **Purpose** | The page itself: `index.html`, start-up, the static failure message, routing between screens, the navigation, layout and styles for laptop and phone. |
| **Inputs** | The URL fragment; `data/freeze.js` through the M1 loader; the screen modules. |
| **Outputs** | The running page; `G-E1`; the not-found state (if C-R3 is accepted). |
| **Entities touched** | FreezeManifest only. |
| **May import** | M1, M5, M6, M7, M8, M9. Its leaf file `shell/routes.js` imports nothing and is the only M10 file others may import. |
| **Lives in** | `index.html`; `assets/js/main.js`; `assets/js/shell/router.js`, `assets/js/shell/routes.js`, `assets/js/shell/nav.js`; `assets/css/main.css`. Tests: `tests/unit/m10-shell.test.mjs` (static audits, import graph, router) and `tests/unit/m10-shell.browser.mjs`. |
| **Invariant most at risk** | **Invariant 5's clause "viewers trigger no live AI calls", and NF1.** The shell is where a convenient web font, a CDN copy of a library, an analytics snippet or a prefetch hint would be added, and any of them turns a self-contained demo into one that talks to the network. |

| ID | Statement | Fails when | Runner |
|---|---|---|---|
| M10-U1 *(seeded)* | Static network audit of `index.html`, every file in `assets/` and every file in `data/`: no `fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon` or `<iframe>` at all; and no `import` specifier, `<script src>`, `<link href>`, `<img src>`, `srcset`, CSS `@import`, CSS `url()` or `@font-face` source that points to an `http:`, `https:` or protocol-relative (`//`) address. Local, relative references (such as the stylesheet link to `assets/css/main.css`) are allowed, and so is `<a href>` to any address. | Any match. | node |
| M10-U2 | Static storage audit of the same files: no `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`, `caches`, `serviceWorker` or `navigator.storage`. | Any match. | node |
| M10-U3 | `index.html` has `<html lang="en">`, a viewport meta element, and an element with `id="startup-failure"` that is visible without script and contains the `G-E1` message; `main.js` removes it only after `loadFreeze()` succeeds and the first screen renders. | Any of these is missing, or the element is removed before a successful start (checked with a failing `loadFreeze` stub). | node and browser |
| M10-U4 | Import graph. Parsing every `import` statement and `import(` call in `assets/js/` gives only the edges permitted in `03-architecture.md` section 10; there are no cycles; no file outside `assets/js/contracts/load.js` contains the string `data/`; no file imports from `pipeline/`, `schemas/` or `tests/`; `index.html` has no `modulepreload`, `prefetch` or `preload` link. | Any forbidden edge, cycle, data path, cross-layer import or preload hint. | node |
| M10-U5 | Router. An empty fragment and `#/brief` show the brief; `#/trend/trend-does-not-exist` shows `F1-E1`; an unknown route such as `#/nothing` shows the not-found state; after navigating across all routes, the session object passed to M6 is the same object (`===`) as at start-up. | Any route shows the wrong screen, or the session object is replaced. | browser |
| M10-U6 | Per-screen failure. With the log loader stubbed to fail, `#/log` shows `F4-E1` while `#/brief`, `#/trends` and `#/readiness` render normally, and `G-E1` is not shown. | Another screen fails, or the whole application shows `G-E1`. | browser |
| M10-U7 | The navigation lists Brief, Trends, Readiness, Governance and Decision log in that fixed order on every screen, all with the same template, and no item carries a count, badge or "new" marker. | The order differs between screens, a template differs, or a marker is present. | browser |
| M10-U8 | At viewport widths 360 and 1280 CSS pixels, on every route, `document.documentElement.scrollWidth` does not exceed the viewport width, and computed `font-size` of body text is at least 16px. (Widths pending Q-7.) | Horizontal overflow at either width, or body text below 16px. | browser |

---

## What the Test Engineer should know before starting

- **Order of work.** M1 first: the test-side schema interpreter (`tests/lib/mini-schema.mjs`) and
  the fixture samples in `tests/fixtures/` are what every content test depends on.
- **Tests that are meant to fail at G2.** Tests that read an unset constant (M3-U4, M5-U1, M5-U2,
  M8-U2, M9-U7), M9-U1 on viewer entries (DM-1), and every test that needs `data/` before G3. Each
  failure must name its cause, so that a failure caused by an open decision is never mistaken for a
  defect, and never "fixed" by weakening the test.
- **Integration and system level.** The NF1 integration matrix (local server in Chromium and
  Firefox; `file://` in Firefox, and in Chromium expecting `G-E1`) is in `03-architecture.md`
  section 9. The system-level check for invariant audit 2 reads
  `performance.getEntriesByType('resource')` in `F1-S1` and requires that no `data/reveal/` entry
  exists.
