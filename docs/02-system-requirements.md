# Level 2 — System requirements

**Status: expanded by the Requirements Engineer on 19 September 2026; revised on 5 October 2026 to
apply Miguel's G2 decisions of 4 October 2026, recorded in `gates.md`. Awaiting G2. Owner:
Requirements Engineer. Every conflict and question raised on 19 September has been decided; the
record of how each was resolved is at the end of this document, together with the few items that
remain open. Those open items do not block G2: each names the agent who closes it and the state the
demo shows until then.**

Five demo flows, in build order, plus six non-functional requirements. If budget runs short, F3,
F4 and F5 become static screens rather than being cut; F1 and F2 are never reduced.

## Functional requirements

| ID | Flow | What the viewer does | Satisfies |
|---|---|---|---|
| F1 | Core loop | Opens a trend card, records a gut reading, then sees three rival readings (opportunity, threat, noise), each with evidence, counter-evidence and a disconfirming condition; answers interrogation prompts; commits a judgement with a rationale | R3, R4, R2 |
| F2 | Weekly brief | Scans a small set of signals with source, date and relevance note; each signal links into F1 | R1, R2 |
| F3 | Readiness and maturity | Reads the persona's answers across the five readiness categories, the resulting profile, the maturity level of each foresight practice and what the WEF/OECD report describes for the next level | R6, R8 |
| F4 | Decision log with replay | Reviews past judgements against real outcomes, with a calibration note such as "threat reading held; timing was early" | R5 |
| F5 | Scenario work from the founder's own conversations | After committing a judgement on a trend, writes what they have heard in their own external conversations and how the trend could play out, then sees questions to take into their next conversations | R2 |

F5 was added on 4 October 2026 by Miguel's decision K-6. The rows for F1 to F4 are unchanged from
the seeded scope except F3, whose wording now follows decisions K-2 and D-1.

## Non-functional requirements

| ID | Requirement |
|---|---|
| NF1 | Static and self-contained: no network calls at runtime |
| NF2 | Provenance: every factual claim links to a dated source; quotes short, paraphrase preferred |
| NF3 | Honest labelling of AI-generated, frozen, fictional and replayed content, and of the viewer's own text |
| NF4 | Core loop completable in under 8 minutes without a guide |
| NF5 | Responsive and legible on laptop and phone |
| NF6 | English interface; German-language source coverage recorded as a future requirement |

NF3's wording names the viewer's own text because of DM-1, which added the label `yours`.

## How the rest of this document is organised

The two tables above are the agreed scope. Everything below expands them so that an Implementer and
a Test Engineer can work from this text without asking a question. First come the conventions that
hold across every flow; then each flow in turn, with its preconditions, numbered steps, the data
each step reads and writes, its screen states and its exit criterion; then the verification of each
non-functional requirement; then the record of how the conflicts and questions raised at Level 2
were resolved; and finally the decisions handed to the Architect.

Screen states carry identifiers (for example `F1-S2`, `F2-E1`) so that tests can name them. `S`
marks a normal state, `W` a state in which some content has been withheld, `E` an error state, and
`ST` a static fallback. States prefixed `G` apply to the whole application.

---

## Conventions that hold across all flows

### C-1. The demo stores nothing

All state created by the viewer — gut readings, prompt answers, judgements and rationales, and the
scenario notes of F5 — lives in memory for the lifetime of the loaded page and nowhere else. It is
never written to `localStorage`, `sessionStorage`, IndexedDB, cookies, the Cache API or a service
worker, and it is never transmitted. Moving between screens inside the demo keeps it; reloading or
closing the page discards it. There is no "save", no account and no export.

The consequence for F4 is stated plainly: **the judgements in the decision log are frozen replay
content, written for this demo on behalf of the fictional Tracewell team (see F4). They are not the
viewer's own judgements, and a judgement the viewer commits in F1 does not appear in F4.** This was
decided by Miguel on 4 October 2026 (K-5). The decision is revisited only if acceptance viewers at
G5 look for their own judgement in the decision log and miss it; the G5 observer notes whether any
viewer does.

### C-2. Entities named in this document

The Architect has formalised these as JSON Schema in `schemas/` (`03-architecture.md`, section 5).
The fields below are stated at the level of intent, so that each step can say what it reads and
writes; names, types and nesting are the Architect's. No entity may carry a `score`, `rank`,
`confidence` or `priority` field, or any field that orders one item above another by importance.

| Entity | Origin | Intent of its fields |
|---|---|---|
| Signal | Frozen, from the Scout via the Verifier | Title; English paraphrase summary; optional short quote; source (URL, publisher, publication date, retrieval date); relevance note for Tracewell; honesty labels. The link to its trends is held on the Trend |
| Trend | Frozen, from the Trend Analyst, with the intuition prompt from the Interrogator | Title; summary written without any opportunity, threat or noise direction; the signals it rests on; the intuition prompt; references to exactly three Readings, one per lens, carrying no reading text; honesty label; provenance |
| Reading | Frozen, from the Rival Readers | Lens (`opportunity` \| `threat` \| `noise`); the reading in plain language; evidence items, each with a dated source; counter-evidence items, each with a dated source; a disconfirming condition; honesty label |
| Interrogation | Frozen, from the Interrogator | For one trend: provenance checks, assumption probes and a pre-mortem, each group holding one to three questions; honesty label. (The intuition prompt sits on the Trend.) |
| Judgement | **In-session only**, created by the viewer | The trend it concerns; the intuition record (gut call as one lens, optional one-line reason); optional answers to interrogation prompts; the lens the viewer commits to; the rationale; label `yours`; optional `role` (R7, designed for, not used in the demo) |
| ReadinessProfile | Frozen; answers from the persona dossier | Tracewell's answers in each of the five readiness categories; a prose finding per category; for each foresight practice, the maturity level (placeholder until verified), the explanation and the report's description of the next level; honesty labels; provenance for both frameworks |
| LogEntry | Frozen replay | The original signal or signals (real, dated); the past judgement (lens, rationale, the date it is presented as of, and the date and authors of its writing); the outcome (paraphrase with a dated, real source); a calibration note; honesty labels |
| ScenarioRecord | **In-session only**, created by the viewer (F5) | The trend it concerns; what the viewer has heard; how they think it could play out; when it was recorded; optional per-question notes; label `yours` |
| ConversationQuestions | Frozen, from the Interrogator (F5) | For one trend: one to three questions to take into external conversations; honesty label. Shipped one module per trend, in `data/conversation/<trendId>.js` (`03-architecture.md`, section 6.4) |

The containers for the weekly brief and the governance content are schemas (`Brief`,
`Governance`), decided by the Architect in `03-architecture.md`, section 5.5.

### C-3. Fail closed on invalid content, and the application-wide states

Every fixture is validated against its schema at test time (M1). The UI additionally performs the
structural checks listed in each flow's preconditions before it renders an item, because those
checks guard the invariants. When a check fails, the item is **not rendered at all** — never
partially — and a plain notice says that content was withheld because it failed validation, and how
many items were affected. The demo never shows a trend with two readings, a signal without a date,
or a replay entry without an outcome source.

Two states apply to every screen:

- **`G-E1`, application failed to start.** If the application cannot start at all (the start-up
  data module fails to load, a script error occurs during start-up, or the browser refuses to run
  module scripts), `index.html` shows a static message, present in the HTML and removed by script
  only on successful start. It reads: "The demo could not load. It makes no network requests. If
  you opened this file directly from your disk, some browsers block it; please use the hosted
  version." The last sentence follows DM-6: the demo runs from GitHub Pages or a local static
  server, and from `file://` only where the browser allows module scripts; elsewhere this message
  is what the viewer sees.
- **`G-E2`, page not found.** A route that names no screen of the demo (for example `#/nothing`)
  shows "This page does not exist in this build." and a link to the weekly brief. The rest of the
  shell, including the navigation and the demo-wide statement, stays visible.

### C-4. No list order carries meaning

Every list on every screen has an ordering rule that is independent of importance, and the rule is
stated in a short line of text next to the list wherever the list could be mistaken for a ranking.
No item in any list is visually distinguished from its peers: same template, same size, same
weight, no badge, no highlight, no "new" marker, no pinned item.

| List | Order | On-screen note required |
|---|---|---|
| Signals in the weekly brief (F2) | Publication date, newest first; ties by signal identifier, ascending | Yes: "Listed by publication date. The order says nothing about importance." |
| Signals on a trend card (F1) | Same rule as F2 | No |
| Trend index (F1) | Trend title, alphabetical | Yes: "Listed alphabetically." |
| The three readings (F1) | **Random**, drawn once per trend per page load (see below) | Yes: "The three readings are peers. Their order is random and means nothing." |
| Lens options in the gut-reading and judgement controls (F1) | The same random order as that trend's readings | No |
| Evidence and counter-evidence items within a reading (F1) | Source publication date, oldest first | No |
| Interrogation prompts (F1) | Grouped by kind in the fixed sequence provenance checks, assumption probes, pre-mortem; within a group, fixture order. The Interrogator's rule that questions are not ordered by importance is the guarantee, checked at G3 | No |
| Readiness categories (F3) | The order in which Jöhnk et al. (2021) present them; never sorted by finding | No |
| Foresight practices in the maturity view (F3) | The order in which R2 names the methods: scanning, trend analysis, scenario work | No |
| Replay entries (F4) | Publication date of the original signal, oldest first; ties by entry identifier, ascending | Yes: "Listed by the date of the original signal." |
| Conversation questions (F5) | Fixture order, under the same Interrogator rule as the interrogation prompts, checked at G3 | No |
| Main navigation | Brief, Trends, Readiness, Governance, Decision log, on every screen | No |

**How the random order of the readings works (Q-2).** The first time a trend card is opened in a
page load, the application draws one of the six possible orders of the three lenses, each equally
likely, and keeps it in session state for that trend. That order is used for the gut-reading
options in `F1-S1`, for the three readings and for the judgement options, every time the trend card
is shown until the page is reloaded. A reload draws again. The random source is passed into the
session when it is created, so that tests inject a seeded source and get a repeatable order; the
shipped page uses the browser's ordinary random source. The order in which readings appear in the
data files never affects what the viewer sees.

On a phone, side-by-side items stack in the same order; the order rule is unchanged.

### C-5. Honesty labels

The vocabulary has six values: `real`, `ai-generated`, `frozen`, `fictional`, `replay` and `yours`.
Every content element shows a visible label from it and carries the same label in machine-readable
form, so that tests can check it (the mechanism is the Architect's, `03-architecture.md`, section
8). A demo-wide statement, visible from every screen, says that all content was produced offline
and frozen on the G3 date, and that nothing in the demo calls an AI service or the network.

The rules below were decided by Miguel on 4 October 2026 (DM-1 and DM-2, closing K-3).

1. **The element label states origin.** `real` marks a published, verifiable item, or a statement
   about the demo that a named test verifies. `ai-generated` marks text written offline by a
   pipeline agent. `fictional` marks content about the invented Tracewell team. `replay` marks the
   decision log's entries and the past judgements in them. `yours` marks text and choices the viewer
   enters in this tab.
2. **`frozen` is demo-wide.** Every piece of fixture content is frozen; the demo-wide statement says
   so once, for all of it. `frozen` is used as an element label only for an assembled container
   whose parts carry their own labels. In this build that is the weekly brief and nothing else.
3. **Composite items carry per-part labels.** A part whose origin differs from its entity shows its
   own label; any other part is covered by the entity's label. A signal is `real`, but its English
   summary is `ai-generated` and says so.
4. **Peers carry identical labels.** The three readings carry byte-identical label markup, so a
   label never distinguishes one peer from another.
5. **The viewer's text is `yours` wherever it appears**: on each input field, and on each read-only
   echo of what the viewer entered (gut call and reason, prompt answers, committed lens and
   rationale, and the F5 fields and notes). This is what makes R2's "who did what" test directly
   visible on screen.
6. **Interface copy is not content.** Headings, buttons, ordering notes, error and withheld notices,
   the demo-wide statement and the replay statement carry no label.

Each flow below states its expected labels under these rules.

### C-6. Language rule for all interface copy and fixture text

No interface text, button, heading, tooltip, alternative text or fixture text may use ranking or
advisory language about options, trends, signals or readings. The forbidden set includes at least:
best, better option, recommended, recommendation, top, priority, prioritise, rank, ranking, score,
confidence, most important, most likely, key signal, must-read, winner. Quoted source text that
happens to contain one of these words is listed for Red-team review rather than silently passed.
The only evaluative text in the demo is the founder's own (their gut reading, rationale and
scenario notes) and the qualitative calibration notes in the replay (F4).

### C-7. Screens and their addresses

Screens are addressed by URL fragment, so that moving between them never reloads the page and
session state survives, including the browser's back and forward buttons. The entry screen is the
weekly brief (DM-7): an empty fragment shows it. The routes are `#/brief`, `#/trends`,
`#/trend/<trendId>`, `#/scenario/<trendId>`, `#/readiness`, `#/governance` and `#/log`. Any other
fragment gives `G-E2`. The fragment carries only the screen address, never anything the viewer
typed. The scenario route is not in the main navigation; it is reached from a committed trend card
(F5).

### C-8. Named constants

These values were set by Miguel on 4 October 2026 (Q-3, Q-4, DM-9). Tests read them from one place
and fail if any is unset.

| Constant | Value | Meaning |
|---|---|---|
| `BRIEF_SIGNAL_CAP` | 5 | The weekly brief holds **no more than** five signals |
| `READING_WPM` | 200 | Words per minute used for the brief's reading-time estimate |
| `QUOTE_MAX_WORDS` | 15 | The longest permitted quote from any source |
| `REPLAY_WINDOW_START` | 2026-01-01 | First publication date of a replay entry's original signal |
| `REPLAY_WINDOW_END` | 2026-03-31 | Last publication date of a replay entry's original signal |
| Questions per group | 1 to 3 | Each interrogation group (F1) and the conversation questions (F5) |

---

## F1 — Core loop

**Purpose.** The founder meets a trend, commits their own gut reading, and only then sees three
rival AI readings as peers. They are questioned, and they commit a judgement that cannot be
committed without a rationale. This flow carries R3 and R4 and shows R2's division of labour: the
machine did the scanning and the readings; the founder does the intuition and the judgement.

### Preconditions

1. The application has started (`G-E1` is not showing), and the trend data has loaded; otherwise
   the trend index and every trend route show `F1-E0`.
2. **Checks on the trend record, run before `F1-S1`.** Otherwise the trend is withheld (`F1-E2`):
   - it holds exactly three reading references, whose lenses are exactly `opportunity`, `threat`
     and `noise`, one each;
   - its title, summary and intuition prompt are non-empty;
   - every signal it names resolves to a signal in the build;
   - every element carries a label from the vocabulary;
   - no `score`, `rank`, `confidence` or `priority` field is present, at any depth.
3. **Checks on the readings and interrogation, run after they load at step 3.** The readings and
   interrogation are not loaded before the intuition record exists (DM-4), so they cannot be
   checked before it. Otherwise the readings are withheld (`F1-E3`):
   - there are exactly three Readings, whose lenses and identifiers match the trend's references;
   - every Reading has non-empty reading text, at least one evidence item with a dated source, at
     least one counter-evidence item with a dated source, and a non-empty disconfirming condition;
   - the Interrogation holds one to three provenance checks, one to three assumption probes and one
     to three pre-mortem questions, each ending with a question mark;
   - every element carries a label from the vocabulary, and no forbidden field is present.
4. Content constraints enforced before the freeze (Verifier at G3, not by the UI): the trend
   summary, the signal relevance notes and the intuition prompt express no opportunity, threat or
   noise direction and do not paraphrase any reading. Everything the viewer can see before the gut
   reading is recorded must be lens-neutral.

### Steps

| # | Viewer action | System response | Reads | Writes |
|---|---|---|---|---|
| 1 | Opens a trend card, either from a signal's trend link in F2 or from the trend index | Runs the checks in precondition 2. If this is the first time the trend is opened in this page load, draws the random lens order (C-4). If no Judgement exists for this trend in session state, shows `F1-S1`. If one exists, resumes at the state it had reached (`F1-S2`, `F1-S3` or `F1-S4`) | Trend (title, summary, signal list, intuition prompt, reading references, label); Signal (title, publisher, publication date, URL, label) for each signal on the trend | The trend's lens order, the first time only |
| 2 | Chooses a gut call: one of the three lens options, none pre-selected. Optionally types a one-line reason | "Record my gut reading" becomes enabled once a lens is chosen. The readings area still contains only the placeholder sentence | Nothing further | Draft gut call and reason, held in memory, not yet recorded |
| 3 | Activates "Record my gut reading" | Writes the intuition record and locks it read-only for the rest of the session; **only then** loads this trend's readings and interrogation, and runs the checks in precondition 3. While they load (a matter of milliseconds from the same site) the placeholder stays. If the checks pass, records the time the readings were revealed, creates the reading elements and shows `F1-S2`; if not, shows `F1-E3` | The trend's readings and interrogation, loaded now and not before | Judgement: trend reference and intuition record (gut call, optional reason, time recorded); time the readings were revealed |
| 4 | Reads the three readings | Each reading shows its lens, its text, its evidence and counter-evidence (each item with a source link and publication date) and its disconfirming condition, with equal visual weight, in the trend's random lens order | Reading ×3 | Nothing |
| 5 | Reads the interrogation prompts and either answers any of them in free text or skips them | Prompts shown grouped as provenance checks, assumption probes and pre-mortem, each with its own answer field. Answering is the primary action and skipping the secondary one (Q-1, rules below). Answers are optional and gate nothing | Interrogation (provenance checks, assumption probes, pre-mortem) | Judgement: prompt answers, if any |
| 6 | Chooses the lens they commit to (none pre-selected; in particular the gut call is **not** pre-selected) and writes a rationale | "Commit judgement" stays disabled until a lens is chosen **and** the rationale contains at least one non-whitespace character after trimming. While disabled, a line of text says what is missing. When both are present, shows `F1-S3` | Nothing further | Draft committed lens and rationale, in memory |
| 7 | Activates "Commit judgement" | Records the judgement, locks it read-only, and shows `F1-S4` | Nothing further | Judgement: committed lens, rationale, time committed |

**Rules that hold throughout F1.**

- Before step 3 completes, the page contains **no** reading text, evidence, counter-evidence,
  disconfirming condition or interrogation question other than the intuition prompt, in any form:
  not rendered and hidden, not in a `<template>`, not in an attribute, not in accessible-name text,
  not in a comment. The data is not merely hidden: it has not been loaded, and the browser has not
  requested it. The readings area shows only the sentence "The three readings appear once you have
  recorded your gut reading."
- The gut reading, once recorded, cannot be edited or cleared in the session.
- A committed judgement cannot be edited or recommitted in the session. Each trend has its own,
  independent Judgement.
- The demo never evaluates the viewer's judgement: no "match" or "mismatch" between gut call and
  judgement, no feedback on the choice, no comparison with other people.
- The only interactive controls that write data are the gut-reading control, the optional prompt
  answers, and the judgement control. Nothing is sent anywhere.

**Rules for answering and skipping the interrogation (Q-1).** These make "answering is primary,
skipping is secondary" observable by a test.

- Every question shows its own answer field directly beneath it, visible without any further action
  (never collapsed behind a disclosure). Each field is captioned "Your answer (optional)".
- There is one skip control for the whole interrogation, labelled "Skip the questions". It comes
  after the last question, in both document order and visual order. The first focusable element
  inside the interrogation area is the first answer field, never the skip control.
- The skip control is styled as a text link: its computed background is transparent, it has no
  border, and its font size and weight are no greater than those of the question text. The answer
  fields have a visible border.
- Activating the skip control writes nothing, disables nothing (the answer fields stay usable), and
  moves keyboard focus to the first option of the judgement control.
- Neither the skip control nor the commit hint says that skipping is wrong or that answering is
  required; the commit hint in `F1-S2` never mentions the answers.

**Expected labels.** Trend title and summary, the intuition prompt, the readings and the
interrogation prompts: `ai-generated`. Signal titles, sources and dates on the trend card: `real`.
Tracewell's name, wherever it appears as content: `fictional`. The gut-reading control and reason
field, the answer fields, the judgement control and rationale field, and every read-only echo of
them: `yours`.

### Screen states

| ID | State | What is shown | What is absent or disabled |
|---|---|---|---|
| `F1-S0` | Trend index | Trend titles in alphabetical order, each opening its trend card; the ordering note | Any reading content; any marker distinguishing one trend |
| `F1-S0e` | Trend index, empty | "No trend cards are available in this build." | — |
| `F1-S1` | Gut reading pending | Trend title, summary and signals; the intuition prompt; three lens options in the trend's random order; optional reason field; "Record my gut reading" (disabled until a lens is chosen); the readings placeholder sentence | All reading and interrogation content, from the DOM and from memory, and no request for it; judgement controls |
| `F1-S2` | Gut reading recorded, judgement incomplete | The locked gut reading; the three readings with the ordering note; the interrogation prompts with their answer fields and the skip control; the judgement control and rationale field; "Commit judgement" disabled, with a line saying "Choose a reading and write a rationale to commit your judgement." (or only the part still missing) | Editing of the gut reading |
| `F1-S3` | Ready to commit | As `F1-S2`, with "Commit judgement" enabled | — |
| `F1-S4` | Committed | The locked gut reading, the committed lens, the rationale, and any prompt answers, side by side without commentary; a statement that this judgement is held only in this browser tab, is not saved or sent anywhere, will be gone on reload, and does not appear in the decision log, which is a replay; a link "Take this trend into your conversations" to F5 for this trend | Any evaluation of the judgement; editing |
| `F1-E0` | Trend data could not be loaded | "Trend cards could not be loaded in this build." on the trend index and on every trend and scenario route. In F2, each signal shows "No trend card for this signal in this build." in place of its trend links. This state must not ship | Every trend |
| `F1-E1` | Trend not found | "This trend card does not exist in this build." and a way back to the trend index | Everything else of the trend |
| `F1-E2` | Trend withheld | "This trend card was withheld because its content failed validation." and a way back | Every part of the trend, including its title and signals, so that nothing is shown partially |
| `F1-E3` | Readings withheld | The locked gut reading, and "The readings for this trend were withheld because their content failed validation. Your gut reading is kept for this session." This state must not ship: every reveal bundle's full contract is proved before the freeze | Every reading and every interrogation question; the judgement controls |
| `G-E1`, `G-E2` | Application-wide | As in C-3 | — |

### Exit criterion

F1 is satisfied for a trend when all of the following hold and can be observed by a test:

1. Session state holds a Judgement for the trend with a recorded gut call (one lens), a committed
   lens and a rationale containing at least one non-whitespace character, and the times recorded
   satisfy: intuition recorded ≤ readings revealed ≤ judgement committed.
2. The intuition record was written before any reading existed in the page or in memory: a DOM
   snapshot taken in `F1-S1` contains none of the three readings' text, evidence, counter-evidence
   or disconfirming-condition strings, nor any interrogation question other than the intuition
   prompt; the browser's resource-timing entries in `F1-S1` contain no request for this trend's
   readings; and a snapshot taken **once the readings have loaded after step 3** contains all three
   readings.
3. In `F1-S2`, "Commit judgement" was disabled for an empty or whitespace-only rationale and for a
   missing lens.
4. With a seeded random source, the readings and both lens controls appear in the order that seed
   determines; across seeds, each of the six orders can occur.
5. The Q-1 rules above hold in `F1-S2`.
6. `F1-S4` is showing, every element of the viewer's own entries carries the label `yours`, and
   nothing was written to any browser storage or sent over the network.

---

## F2 — Weekly brief

**Purpose.** R1's attention budget made concrete: a small, fixed set of real signals that reads in
about ten minutes, each a door into F1. It shows R2's machine side, since scanning was automated.
The brief is the entry screen of the demo (DM-7).

### Preconditions

1. The application has started.
2. The weekly brief's data has loaded. The brief holds no more than `BRIEF_SIGNAL_CAP` (five)
   signals.
3. Each signal passes these structural checks, otherwise it is withheld (`F2-W1`): a source URL, a
   publisher, a publication date, a retrieval date, a non-empty English summary, a non-empty
   relevance note and a label from the vocabulary; any quote is no longer than `QUOTE_MAX_WORDS`
   (fifteen) words.
4. Content constraint enforced at G3: relevance notes say why a signal concerns Tracewell without
   calling it good, bad or unimportant for Tracewell (they are lens-neutral, so they cannot pre-empt
   the gut reading in F1), and they carry no level of relevance ("high", "low" or similar).

### Steps

| # | Viewer action | System response | Reads | Writes |
|---|---|---|---|---|
| 1 | Opens the weekly brief (or arrives on it, since it is the entry screen) | Shows `F2-S1`: a header with the period the brief covers and its freeze date, the ordering note, then the signals in the order set by C-4 | Brief container (period, freeze date, signal list); Signal for each listed signal; Trend list, to derive each signal's trend links | Nothing |
| 2 | Scans a signal | Each signal shows its title, English summary, optional short quote with attribution, publisher, publication date, a link to the source, the relevance note, and labels | Signal | Nothing |
| 3 | Activates a signal's trend link | Opens that trend card in F1, at `F1-S1` or at whatever state the trend reached earlier in the session. A signal that belongs to more than one trend shows one link per trend, in alphabetical order of trend title | Trend references derived from the Trend list | Nothing |
| 4 | Optionally activates a source link | Opens the original source in a new browser tab. This is navigation chosen by the viewer, not a runtime request by the demo | Signal source URL | Nothing |

The reading-time estimate is a test-time check, not an on-screen element: the total word count of
all text rendered in `F2-S1`, divided by `READING_WPM` (200), must be ten minutes or less.

**F2 designates no signal (K-1).** No signal is marked, highlighted, pinned, placed first by
choice, or described as the one worth discussing. Choosing which signal matters is the viewer's
work, not the brief's.

**How R1's acceptance test is scored (K-1, decided 4 October 2026).** R1 is frozen and its wording
is not changed. At G5 its criterion, "a viewer finds the one signal worth discussing within the
time budget", is scored like this: starting from the first display of `F2-S1`, the viewer names one
signal from the brief that *they* judge worth discussing and says, in their own words, why. Any
signal in the brief counts; there is no designated answer, and the observer records the choice and
the reason without judging either. The criterion is met if the viewer does this within ten minutes,
R1's time budget, and fails if they cannot. The demo itself records nothing of this.

**Expected labels.** The brief as an assembled container: `frozen`, with its freeze date. Each
signal as a whole, its title, source, date and any quote: `real`. Its summary and relevance note:
`ai-generated`, each shown with its own label.

### Screen states

| ID | State | What is shown | What is absent |
|---|---|---|---|
| `F2-S1` | Brief listed | As in steps 1 and 2 | Any signal visually distinguished from the others; any count, level or marker of relevance |
| `F2-S0` | Brief empty | "This brief contains no signals." | — |
| `F2-W1` | Some signals withheld | The remaining signals as in `F2-S1`, plus, for one signal, "1 signal was withheld because it failed the provenance check." and, for N greater than one, "N signals were withheld because they failed the provenance check." | The withheld signals, entirely |
| `F2-S2` | Signal without a resolvable trend | The signal as normal, with "No trend card for this signal in this build." in place of the link. This also appears for every signal under `F1-E0`. This state is a defect caught by the M5 unit test (every brief signal must resolve to at least one trend) and must not ship | — |
| `F2-E1` | Brief data invalid | "The weekly brief could not be shown because its content failed validation." | All signals |
| `G-E1`, `G-E2` | Application-wide | As in C-3 | — |

### Exit criterion

F2 is satisfied when `F2-S1` shows no more than five signals; every signal shows a working source
link, a publication date, a relevance note and its labels; the estimated reading time computed as
above is ten minutes or less; the list order equals the C-4 rule; no signal is visually
distinguished; and activating each signal's trend link opens the matching trend card in F1.

---

## F3 — Readiness and maturity, with the governance screen

**Purpose.** R6: show why Tracewell sits where it does across the five readiness categories and on
the maturity scale, and what the maturity framework describes for the next level. R8: a governance
screen stating plainly what is and is not implemented. F3 is read-only; the viewer writes nothing.

**The maturity framework, and what is still pending (D-1).** The framework is identified: World
Economic Forum and OECD (2025), *AI in strategic foresight: Reshaping anticipatory governance*,
https://doi.org/10.1787/aa573076-en. According to the thesis (Chapter 3, section 3.2, draft of 29
September 2026), the report names three levels on p. 9, expected to read "AI for analysis
augmentation", "AI as creative sparring partner" and "AI integrated and customized into workflow".
**These names, and the number of levels, are pending verification.** The Verifier re-opens p. 9
before G3. Until the Verifier has confirmed them and Miguel has set the maturity status to
verified, every place a level name would appear in the demo shows the literal placeholder
`LEVEL_NAME_UNVERIFIED`, and no level name may be written into `data/` or `assets/`. The names are
recorded here only so that the Verifier knows what to check.

**Level per foresight practice (D-1).** Following the thesis, F3 assigns a maturity level to each
foresight practice, not one level to the venture. The practices are the three foresight methods R2
names: scanning, trend analysis and scenario work. Where Tracewell's account of a practice falls
between two levels, the lower level is assigned, and the explanation says that this rule was
applied. The list of practices is to be confirmed against the thesis by the Verifier when p. 9 is
re-opened; if the thesis uses a different list, this paragraph changes before G3.

**The next level is the report's description, never the demo's advice (K-2).** For each practice,
F3 shows what the WEF/OECD report describes for the level above the one assigned, cited to the
report. It is never phrased as what Tracewell should do. The wording constraints that make this
testable are in step 3.

### Preconditions

1. The application has started.
2. The ReadinessProfile has loaded and passes these checks, otherwise the profile is withheld
   (`F3-E1`): exactly five readiness categories; each with at least one answer and a non-empty
   finding; one maturity entry for each of the three practices; labels present; no numeric score
   and no field named or behaving as a score, rank, confidence or priority.
3. The five categories are those of Jöhnk et al. (2021): strategic alignment, resources,
   knowledge, culture and data. This is confirmed by the thesis (Appendix A, adapted from Jöhnk et
   al., 2021), so the category keys in the schema stand (DM-8). The displayed category names are
   those the persona dossier records with its citation.
4. While the maturity status is unverified, each practice's level is `LEVEL_NAME_UNVERIFIED` and its
   explanation and next-level description are absent from the data. Once verified, each practice
   has a level name, an explanation and either a next-level description or the statement that the
   report describes no level above it, each with a citation to the report including a page number.
5. The governance content has loaded, otherwise `F3-E2`.

### Steps

| # | Viewer action | System response | Reads | Writes |
|---|---|---|---|---|
| 1 | Opens Readiness | Shows `F3-S1`: the five categories in source order, each with Tracewell's answers and a prose finding; a citation of Jöhnk et al. (2021) with a dated link | ReadinessProfile (categories, answers, findings, framework provenance) | Nothing |
| 2 | Reads the maturity view | For each practice, in C-4 order: the practice name and its level. **Unverified (`F3-S2`):** the level reads `LEVEL_NAME_UNVERIFIED`, followed once by the sentence "Level names pending verification against the WEF/OECD report." **Verified (`F3-S2v`):** the level name, and an explanation of why Tracewell's practice sits at that level, drawing on the dossier answers and citing the report with its page | ReadinessProfile (per practice: level, explanation; report citation) | Nothing |
| 3 | Reads what the report describes for the next level | **Unverified:** "Pending: the next complement depends on the verified level definitions." and nothing more. **Verified:** a block headed "What the WEF/OECD report describes for the next level", holding for each practice the name of the next level and the report's description of it, under the constraints below, and after all practices the sentence "These are the report's descriptions of the next level. They are not advice from this demo." | ReadinessProfile (per practice: next-level name and description; report citation) | Nothing |
| 4 | Opens the governance screen, from a link in F3 and from the main navigation | Shows `F3-S3` with two lists and the argument for own-data ingestion's conditions (see below) | Governance content | Nothing |

**Wording constraints for the next-level description (K-2).** Each description must satisfy all of
the following; each is checkable by a test or by the Verifier as stated.

1. It begins with "The report describes" (unit test).
2. It contains none of these words, as whole words and case-insensitively: you, your, we, our,
   should, must, need, needs, recommend, recommended, recommendation, advise, advice, Tracewell,
   team; nor the phrase "next step"; nor any C-6 term (unit test).
3. It is followed by a citation naming the report, the DOI link above, the publication year and the
   page number (unit test for presence; Verifier for the page).
4. It is a paraphrase of the report's own description of that level, with any quote no longer than
   `QUOTE_MAX_WORDS` and attributed with its page (Verifier at G3).
5. It describes the next level only, as the report does; it does not select, single out or order
   any part of that description as the one to pursue (Verifier and Red-team at G3).
6. Where the assigned level is the highest the report describes, the block for that practice reads
   "The report describes no level above this one." and nothing more (unit test).

**Required content of the governance screen (R8).** Two plainly headed lists.

*Implemented in this demo:* signals come only from the open web, from public sources, and were
frozen at G3; no viewer data is stored or transmitted; no AI service is called while the demo is
used; there are no accounts, cookies or analytics.

*Not implemented:* ingestion of a team's own data, which is argued on this screen and not built,
pending verified GDPR and EU compliance; persistence of judgements across sessions; the
role-aware data model (R7), which is designed in the architecture and not built.

The argument that follows the two lists states what own-data ingestion would require before it
could be built. Every factual claim in it about GDPR or other EU regulation carries a dated source
under NF2 and passes the Verifier. Who writes the argument is decided under Q-5 by a structured
debate, and the outcome and its reasoning are recorded in `gates.md` (as a proposal until Miguel
confirms it at G2). That outcome assigns the argument to a build agent, so it is agent-written text.

**Expected labels.** The readiness profile, Tracewell's answers and findings, and each practice's
verified level assignment and explanation: `fictional`. The framework citations (Jöhnk et al. and
the WEF/OECD report): `real`. The next-level descriptions: labelled by origin, `ai-generated` if
written by a pipeline agent, as signal summaries are (who writes them is open item O-2). The
maturity placeholder: no label, since it is not content. The two governance lists: `real`, since
each implemented item is a statement about the demo verified by a named test (DM-2). The governance
argument paragraphs: `ai-generated`, since the Q-5 outcome assigns them to an agent; each claim in
them carries its own `real`, dated source.

### Screen states

| ID | State | What is shown | What is absent |
|---|---|---|---|
| `F3-S1` | Readiness profile | As step 1 | Numeric scores, bars, gauges or colour scales implying a score; sorting of categories by finding |
| `F3-S2` | Maturity view, unverified | The three practices, each with `LEVEL_NAME_UNVERIFIED`; the pending sentence of step 2; the pending sentence of step 3 | Any level name, level count, level criterion or next-level description |
| `F3-S2v` | Maturity view, verified | The three practices, each with its verified level and explanation; the next-level block of step 3 | Any number, bar or scale; any wording that addresses Tracewell or the viewer in the next-level block |
| `F3-S3` | Governance screen | Both lists and the sourced argument | — |
| `F3-E1` | Readiness profile withheld | "The readiness profile was withheld because its content failed validation." | All five categories and the maturity view, so that none is shown partially |
| `F3-E2` | Governance content missing | "The governance statement could not be shown." This state must not ship, since R8's acceptance depends on the screen | — |
| `G-E1`, `G-E2` | Application-wide | As in C-3 | — |

The build renders whichever of `F3-S2` and `F3-S2v` the frozen data calls for. `F3-S2v` ships only
if the Verifier has confirmed p. 9 and Miguel has set the status to verified before G3; otherwise
`F3-S2` ships, and that is an honest, complete state.

### Exit criterion

F3 is satisfied when `F3-S1` shows all five categories with answers, findings and a dated
citation; the maturity view shows one level for each of the three practices; `F3-S3` shows both
the implemented and not-implemented lists; and either

- **unverified:** `F3-S2` shows `LEVEL_NAME_UNVERIFIED` for every practice, and no other level name
  appears anywhere in `index.html`, `assets/` or `data/`; or
- **verified:** `F3-S2v` shows, for every practice, a verified level, an explanation citing the
  report with a page, and a next-level block that meets all six wording constraints, followed by
  the sentence saying these are the report's descriptions and not advice.

R6's full acceptance test ("a viewer sees why the team sits at its level and the next complement to
build") is met only in the verified case.

---

## F4 — Decision log with retrospective replay

**Purpose.** R5: capability accumulates when past judgements are reviewed against what happened.
The demo shows this with a retrospective replay: real signals published between 1 January and 31
March 2026, a judgement written from those signals alone on behalf of the fictional Tracewell team,
and what actually happened by September 2026, from a dated real source. F4 is read-only; the viewer
writes nothing, and the viewer's own F1 judgements are not part of it (C-1, K-5).

**How the replay judgements are produced (K-7, decided 4 October 2026).** The past judgements are
written by the Rival Readers and the Interrogator from the early-2026 signals only, with the
outcomes withheld from them. Only afterwards does the Verifier attach each dated outcome. A
calibration note is then written against the outcome and is labelled `ai-generated` (DM-10). The
set must include at least one judgement that did not hold, and it is shown exactly as it was
written. The replay statement names who wrote the judgements and when.

### Preconditions

1. The application has started.
2. The log data has loaded. Each LogEntry passes these checks, otherwise it is withheld (`F4-W1`):
   at least one original signal with a URL and a publication date between `REPLAY_WINDOW_START` and
   `REPLAY_WINDOW_END` inclusive; a past judgement with a lens, a non-empty rationale, the date it is
   presented as of, the date it was written, and the agents who wrote it; an outcome with a
   paraphrase, a source URL, a publication date later than every original signal's, and the date
   the outcome was attached, which is on or after the date the judgement was written (so the
   outcome was withheld while the judgement was written); a non-empty calibration note; labels
   present.
3. Content constraints enforced at G3 by the Verifier and checked by the Red-team Reviewer: every
   outcome is real and dated (an invented outcome is a project-ending defect); the judgements were
   written before the outcomes were attached, as recorded in the verification record; at least one
   entry's outcome shows that its judgement did not hold; calibration notes are qualitative prose.
   Because the contracts hold no verdict field, the "did not hold" constraint is a review check, not
   a data check.

### Steps

| # | Viewer action | System response | Reads | Writes |
|---|---|---|---|---|
| 1 | Opens the decision log | Shows `F4-S1`. A replay statement, the first content on the screen and visible without scrolling at every NF5 viewport, says: this is a retrospective replay; the signals are real and were published between 1 January and 31 March 2026; the judgements were written for this demo on behalf of the fictional Tracewell team by the demo's Rival Reader and Interrogator agents, on the date or dates they were written, using those signals only, with the outcomes withheld; the outcomes are real and dated, and were attached afterwards by the Verifier agent; some judgements did not hold, and they are shown as written; the calibration notes are AI-generated; the judgements are not the viewer's, and judgements committed in this session are not stored and do not appear here | Log container; LogEntry list (including each past judgement's writing date) | Nothing |
| 2 | Reads an entry | The entry shows, in this fixed sequence: the original signal(s) with source link and publication date; the past judgement (lens and rationale), with a line giving the date it is presented as of, stating that the Tracewell team is fictional, and naming the agents who wrote it and the date it was written; the outcome with its source link and publication date; the calibration note | LogEntry | Nothing |
| 3 | Optionally activates a source link | Opens the source in a new browser tab, as in F2 step 4 | Source URL | Nothing |

When every past judgement was written on the same date, the replay statement gives that date; when
they were written on different dates, it gives the first and last.

**Rules that hold throughout F4.** No aggregate across entries: no tally of readings that held, no
hit rate, no accuracy figure, no chart of calibration, and the replay statement says "some" rather
than giving a number. No per-entry verdict icon (tick, cross, colour) that invites tallying; the
calibration note is prose only. Entries appear in the C-4 order.

**Expected labels.** The entry as a whole: `replay`. Each original signal and the outcome: `real`
(each paraphrase within them carries its own label, as signal summaries do). The past judgement:
`replay`. The calibration note: `ai-generated`.

### Screen states

| ID | State | What is shown | What is absent |
|---|---|---|---|
| `F4-S1` | Log listed | The replay statement, then the entries as in step 2 | Aggregates, verdict icons, any entry visually distinguished |
| `F4-S0` | Log empty | The replay statement and "This build contains no replay entries." | — |
| `F4-W1` | Some entries withheld | As `F4-S1`, plus, for one entry, "1 entry was withheld because it lacked a dated outcome source or failed validation." and, for N greater than one, "N entries were withheld because they lacked a dated outcome source or failed validation." | The withheld entries, entirely |
| `F4-E1` | Log data invalid | The replay statement and "The decision log could not be shown because its content failed validation." | All entries |
| `G-E1`, `G-E2` | Application-wide | As in C-3 | — |

### Exit criterion

F4 is satisfied when `F4-S1` shows at least one entry; every shown entry has an original signal
inside the replay window with a working, dated source, a past judgement with its as-of date,
writing date and authors, an outcome with a working source dated after the signal, and a
calibration note labelled `ai-generated`; the replay statement contains every element listed in
step 1 and is visible on arrival at every NF5 viewport; entries follow the C-4 order; no aggregate
or verdict icon appears; and the G3 verification record shows at least one entry whose judgement
did not hold.

---

## F5 — Scenario work from the founder's own conversations

**Purpose.** R2's third foresight method. R2 asks that scenario work be structured around the
founder's own external conversations, and that the viewer can tell which steps the machine did and
which the founder did. In F5 the founder supplies the substance: what they have heard from people
outside the company, and how they think the trend could play out. The machine supplies only
structure: a few questions, written offline, to take into the next conversations. The machine
writes no scenario, so there is nothing to rank and nothing for the founder to choose between.

F5 follows a committed judgement on the same trend. It is reached from the link on `F1-S4`, so the
readings for that trend have already been revealed and nothing in F5 can pre-empt the gut reading.

**Dependency flag.** The contract and shipping question are settled: the questions are
`ConversationQuestions` records, one module per trend in `data/conversation/<trendId>.js`, loaded
only after the scenario is recorded (`03-architecture.md`, section 6.4; A-11 answered). The
questions themselves do not exist yet: the Interrogator's instructions need an addition so that it
writes one to three conversation questions per trend in the same offline run (no new agent is
needed, since writing questions, not advice, is already the Interrogator's job; O-1). F5 lives in
module M6.

**When F5 is static.** Every scenario route that passes the trend checks shows the static screen
`F5-ST` when the build switch `SCENARIO_FLOW` is `"static"`, or when the build does not contain a
conversation module for every trend. `SCENARIO_FLOW` starts as `"static"`; the Orchestrator sets it
to `"interactive"` at the G3 freeze if the questions passed the Verifier, and back to `"static"` if
the build is behind on 6 October.

### Preconditions

1. The application has started, the trend data has loaded (otherwise `F1-E0`), and the trend in the
   route exists and passes F1 precondition 2 (otherwise `F1-E1` or `F1-E2`).
2. Session state holds a committed Judgement for this trend; otherwise `F5-S0`. After a reload
   there is none, so a scenario route opened directly always shows `F5-S0` first.
3. The conversation questions, once loaded after step 3, pass these checks, otherwise they are
   withheld (`F5-E2`): one to three questions; each non-empty and ending with a question mark; a
   label from the vocabulary; no forbidden field.
4. Content constraints enforced at G3: each question asks the founder whom they could ask, or what
   they could listen for, in a conversation with someone outside the company (for example a
   customer, partner, investor, peer or regulator); it is a question, not advice; it presupposes no
   lens and favours no reading; it contains no C-6 term; it is the same for every viewer.

### Steps

| # | Viewer action | System response | Reads | Writes |
|---|---|---|---|---|
| 1 | Activates "Take this trend into your conversations" on `F1-S4` | Shows `F5-S1`, or resumes at `F5-S2` if a ScenarioRecord for this trend already exists in the session | Trend (title); the session's Judgement for this trend (committed lens and rationale, shown read-only as context) | Nothing |
| 2 | Writes into two fields: "What have you heard in your own conversations, with customers, partners, investors or others outside the company, that bears on this trend?" and "In your own words, how could this trend play out over the next twelve months?" | "Record my scenario" becomes enabled once both fields contain at least one non-whitespace character after trimming. While disabled, a line says which field is still empty | Nothing further | Drafts of both fields, in memory |
| 3 | Activates "Record my scenario" | Writes the ScenarioRecord and locks both fields read-only for the rest of the session; **only then** renders the conversation questions, after checking them (precondition 3). Shows `F5-S2`, or `F5-E2` if the check fails | Conversation questions for this trend | ScenarioRecord: trend reference, what was heard, how it could play out, time recorded |
| 4 | Optionally, beside any question, notes whom they would ask | Each question has one optional field captioned "Who you would ask (optional)". The notes gate nothing and stay editable while the screen is open | Nothing further | ScenarioRecord: per-question notes, if any |

**Rules that hold throughout F5.**

- Before step 3 completes, the page contains no conversation question in any form, by the same
  standard as F1's rule for readings: not hidden, not in a template, attribute, accessible name or
  comment, and not loaded or requested.
- In `F5-S2` the viewer's text and the machine's questions sit in two separately headed regions,
  "What you wrote" first and "Questions to take into your next conversations" second, so that who
  did what is visible at a glance.
- Beneath the questions the screen says: "These questions were written offline, before you
  arrived, and are the same for every visitor. They do not respond to what you wrote." No AI
  service is called at any point.
- The demo never evaluates or compares what the viewer wrote: not against the readings, not against
  their judgement, not against anyone else.
- A statement says that what the viewer wrote is held only in this browser tab, is not saved or sent
  anywhere, and will be gone on reload (C-1).

**Expected labels.** The trend title: `ai-generated`. The read-only echo of the committed judgement,
both F5 fields, their read-only echoes and the per-question notes: `yours`. The conversation
questions: `ai-generated`, with identical label markup on each.

### Screen states

| ID | State | What is shown | What is absent or disabled |
|---|---|---|---|
| `F5-S0` | Not yet available | "Scenario work on this trend starts from a judgement you have committed in this session. Open the trend card and commit a judgement first." and a link to the trend card | Both fields; every conversation question |
| `F5-S1` | Scenario pending | Trend title; the committed judgement, read-only; the two fields; "Record my scenario", disabled until both fields hold text, with the line naming what is missing | Every conversation question, from the DOM |
| `F5-S2` | Scenario recorded | The two regions described above, with the optional note fields; the statement about the questions; the not-saved statement | Editing of the two recorded fields; any evaluation |
| `F5-E2` | Questions withheld | The recorded fields, read-only, and "The conversation questions for this trend were withheld because their content failed validation. What you wrote is kept for this session." This state must not ship | Every conversation question |
| `F5-ST` | Static fallback | A heading "Scenario work from your own conversations" and three sentences of description: that scenario work starts from what the founder has heard outside the company; that the founder writes how the trend could play out before seeing anything the machine prepared; and that the machine then offers questions to take into the next conversations. Then: "In this build the scenario step is described only. No questions are shown, because this screen cannot first record your own scenario." | Every input field and every AI-generated question |
| `F1-E0`, `F1-E1`, `F1-E2` | Trend unavailable | As in F1, on the scenario route | — |
| `G-E1`, `G-E2` | Application-wide | As in C-3 | — |

The static fallback shows no AI-generated content at all, because showing questions without first
recording the founder's own scenario would put machine content before the founder's step.

### Exit criterion

F5 is satisfied for a trend when all of the following hold and can be observed by a test:

1. Opening the scenario route with no committed Judgement for the trend shows `F5-S0`.
2. Session state holds a ScenarioRecord for the trend with both fields containing at least one
   non-whitespace character and a recorded time later than the Judgement's commit time.
3. A DOM snapshot taken in `F5-S1` contains none of the trend's conversation questions, and the
   browser's resource-timing entries contain no request for its conversation module; a snapshot
   taken in `F5-S2` contains all of them.
4. In `F5-S2`, every element of the viewer's text carries `yours`, every question carries
   `ai-generated`, the two sit in separately headed regions, and the statement about the questions
   is present.
5. Nothing was written to any browser storage or sent over the network.

If F5 ships as `F5-ST` (see "When F5 is static"), the exit criterion is instead: the scenario
route shows `F5-ST`, with no
input field and no AI-generated question anywhere in the page. In that case R2's scenario method is
described rather than demonstrated, and the traceability matrix says so.

---

## Verification of the non-functional requirements

Test levels follow `test-plan.md`. Tooling has no package manager, so unit tests are plain ES
modules run under `node --test` or in the browser; integration and system checks that need a real
browser are scripted walks run by the Test Engineer or the Red-team Reviewer. Module references
follow `04-module-design.md`; F5 lives in M6.

| NF | How it is verified | Test level | Modules | Pass criterion |
|---|---|---|---|---|
| NF1 Static, no runtime network calls | Static audit of every shipped file (`index.html`, `assets/`, `data/`) for `fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, `import` from an `http(s)` URL, `<script>`, `<link>`, `<img>`, `srcset`, `<iframe>`, `@import` or CSS `url()` pointing at a remote address, and remote `@font-face`. Plain `<a href>` links to sources are allowed, because they are navigation the viewer chooses. The same audit checks for `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`, `caches`, `serviceWorker` and `navigator.storage` (C-1) | Unit | M10, M1 | Zero matches outside `<a href>` |
| | Load the demo from a local static server with the browser offline in current Chromium and current Firefox, and from `file://` in both, and walk F1 to F5 while recording network activity | Integration | M10; M6 for F5 | From the server, in both browsers: every screen renders and no request leaves the page's own files. From `file://`: Firefox as from the server; Chromium shows `G-E1`, including its `file://` sentence, and nothing else (DM-6). Safari is not covered |
| | Invariant audit 6 | System | all | As in `test-plan.md` |
| NF2 Provenance | Schema check that every claim-bearing item has a source URL, publication date and retrieval date (M1); every Signal has a URL, date and summary (M3); every evidence and counter-evidence item has a dated source (M4); every replay outcome has a dated source later than its signal (M8); every verified maturity explanation and next-level description cites the report with a page (M7); every rendered claim shows its link and date, and every quote is within fifteen words (M9) | Unit | M1, M3, M4, M7, M8, M9 | All assertions pass for every fixture |
| | Claim-by-claim check that each source exists and says what is claimed; unverifiable claims struck | Review (Verifier at G3; Red-team Reviewer) | — | Verification record lists every claim with a verdict; no struck claim ships |
| | Invariant audit 4 | System | all | As in `test-plan.md` |
| NF3 Honest labelling | Every rendered content element carries a visible label and a machine-readable label from the six-value vocabulary; every element of the viewer's own text in F1 and F5 carries `yours`; peers carry identical labels; per-part labels appear where a part's origin differs; `frozen` appears as an element label only on the weekly brief; the demo-wide "frozen offline, no live AI" statement is present on every screen; the replay statement is present in F4 | Unit | M9; M6 for F1 and F5 | No content element lacks a label; no label outside the vocabulary; no viewer entry without `yours` |
| | Invariant audit 5, and review of whether each label is correct under C-5, not merely present | System; Review (Red-team at G3 and G4) | M9, M10 | No mislabelled element |
| NF4 Core loop under 8 minutes | Two to three people unfamiliar with the project open the demo unaided at the entry screen (the weekly brief, DM-7). The clock runs only for the core loop (Q-6): it starts at the first display of `F1-S1` for the trend the viewer chooses, and stops at `F1-S4` for that trend. Time spent in the brief before opening the trend card is not counted | Acceptance (G5), preceded by the agent rehearsal | M10, M5, M6 | Each viewer reaches `F1-S4` within 8 minutes of first seeing `F1-S1` |
| NF5 Responsive and legible | Walk F1 to F5 at four viewports (Q-7): phone in portrait at 360 × 640 and 390 × 844 CSS pixels; desktop or laptop in landscape at 1280 × 800 and 1440 × 900; a viewport meta element is present (static check) | System; Unit for the static check | M10 | At every viewport: every step completes; no horizontal scrolling; no clipped content or control; body text not smaller than 16 CSS pixels; the three readings keep equal visual weight; the F4 replay statement is visible on arrival |
| NF6 English interface | `<html lang="en">` present (static check); all interface copy in English (review); the future requirement below is present in this document | Unit for the static check; Review | M10 | All three hold |

**Invariant checks that are not NFs but must be verified.** Invariant audits 1, 2 and 3 in
`test-plan.md` verify F1's rules: M4 and M1 unit tests assert exactly three peer readings and no
forbidden field; M6 unit tests assert that no reading element exists, and no reading has been
requested, before the intuition record, and that commit is disabled for an empty or
whitespace-only rationale; the C-6 language audit runs over interface copy and fixture text as part
of the system test, including F3's next-level wording constraints and F5's questions. F5's own
ordering rule (no question before the scenario is recorded) is verified by its exit criterion 3.

### Future requirement recorded under NF6

*German-language source coverage.* Tracewell is based in Linz, and a real build would scan
German-language sources (Austrian and German trade press, registers and regulators) as well as
English ones. The demo does not do this systematically. In the demo, a signal may come from a
German-language source; its title may stay in the original language, its summary and relevance
note are in English, and any quote is short and attributed. Systematic German coverage is a future
requirement for a later pass at Level 1, not part of this build.

---

## Conflicts and questions raised at Level 2, and how they were resolved

On 19 September 2026 this document reported four conflicts with the invariants (K-1 to K-4), three
scope questions (K-5 to K-7), seven smaller questions (Q-1 to Q-7) and two content dependencies
(D-1, D-2) to the Orchestrator, and stated them without resolving them. The record below keeps each
item's original question in one sentence and says how it was resolved. Unless stated otherwise,
Miguel decided each item in chat on **4 October 2026**; the decisions are recorded in `gates.md`.

### Conflicts between the seeded flows and the invariants

**K-1. R1's acceptance wording and the no-ranking invariant.** *Raised:* "finds the one signal worth
discussing" read literally would require the brief to designate a signal. *Resolved, 4 Oct 2026:*
F2 designates no signal; R1 stays frozen; its acceptance test is scored as the viewer picking the
signal they judge worth discussing and saying why within the time budget. Written into F2.

**K-2. "One next complement" and the no-recommendation invariant.** *Raised:* a single next
complement chosen by the tool is a recommendation. *Resolved, 4 Oct 2026:* it is shown as what the
WEF/OECD model describes for the next level, cited to the report, and never as the tool's advice. F3
step 3 is unblocked and its wording constraints are specified.

**K-3. The honesty vocabulary did not cover every element.** *Raised:* viewer text had no label,
the vocabulary mixed origin and time status, and composite items had no rule. *Resolved, 4 Oct
2026,* by DM-1 (a sixth label, `yours`, now in `CLAUDE.md`) and DM-2 (the label states origin,
`frozen` is demo-wide and an element label only for assembled containers, composite items carry
per-part labels). Written into C-5 and every flow's expected labels.

**K-4. Invariant audit 2 and statically imported data.** *Raised:* statically imported readings
would sit in module state before the intuition record. *Resolved, 4 Oct 2026,* by DM-4 (per-trend
reveal bundles loaded by dynamic `import()` only after the intuition record, so the audit holds as
written) and DM-5 (F1 precondition 2 split, new state `F1-E3`, exit criterion 2 reworded), applied
as the Architect requested in `03-architecture.md`, section 13, C-R1.

### Scope questions

**K-5. R5 says "persist"; the demo stores nothing.** *Raised:* should an F1 judgement appear in F4
for the rest of the session? *Resolved, 4 Oct 2026:* no. Revisit only if acceptance viewers miss it.
Written into C-1.

**K-6. R2's scenario work had no flow.** *Resolved, 4 Oct 2026:* a flow is added, structured around
the founder's own external conversations, respecting every invariant, and shipping as a static
screen if time runs short. Specified as F5. A-11 is answered (C-R4, C-R6); its content depends
on O-1.

**K-7. Who writes the replay judgements, and how hindsight is kept out.** *Resolved, 4 Oct 2026:*
the Rival Readers and the Interrogator write them from the early-2026 signals only, outcomes
withheld; the Verifier attaches the dated outcomes afterwards; the set includes at least one
judgement that did not hold; the replay statement names who wrote them and when. DM-10 labels the
calibration notes `ai-generated`. Written into F4.

### Smaller questions

**Q-1. Interrogation answers.** *Resolved, 4 Oct 2026:* optional and gating nothing, but answering
is the primary, visually dominant action and skipping a secondary, less prominent control. Testable
rules in F1.

**Q-2. Order of the three readings.** *Resolved, 4 Oct 2026:* random per session, with a seed
injected by tests. Written into C-4, including the on-screen note.

**Q-3. Attention budget constants.** *Resolved, 4 Oct 2026:* `BRIEF_SIGNAL_CAP` = 5, meaning no
more than five; `READING_WPM` = 200. In C-8.

**Q-4. Quote length.** *Resolved, 4 Oct 2026:* `QUOTE_MAX_WORDS` = 15. In C-8. DM-9 also fixed the
replay window (1 January to 31 March 2026) and three questions per interrogation group.

**Q-5. Governance content.** *Resolved, 4 Oct 2026, as to process:* the author is decided by a
structured debate between agents before G3, with the outcome and reasoning recorded in `gates.md`;
every regulatory claim still passes the Verifier. The debate's outcome, recorded in `gates.md` on
5 October 2026, assigns the argument to a build agent; Miguel confirms it at G2.

**Q-6. What NF4's eight minutes measure.** *Resolved, 4 Oct 2026:* only the core loop, from opening
a trend card to a committed judgement. DM-7 confirmed the brief as the entry screen. In the NF4 row.

**Q-7. NF5 viewport sizes.** *Resolved, 4 Oct 2026:* 360 × 640 and 390 × 844 portrait; 1280 × 800
and 1440 × 900 landscape. In the NF5 row.

### Content dependencies

**D-1. The OECD/WEF report.** *Resolved in part, 4 Oct 2026:* the report is identified and the
expected level names are recorded in `gates.md` from the thesis. *Still open until G3:* the Verifier
re-opens p. 9; until then `LEVEL_NAME_UNVERIFIED` stays in everything that reaches the UI, and F3
ships as `F3-S2`. F3 now assigns a level per foresight practice and the lower level where an account
falls between two.

**D-2. Cowork outputs.** *Unchanged:* F2 depends on the scanning brief, F3 on the persona dossier,
F4 on the replay candidates. This specification describes how that content is shown and checked,
and does not presume what it says.

### Changes requested by the Architect

**C-R1** (`F1-E3`, precondition split, exit criterion 2), **C-R2** (`F1-E0`) and **C-R3** (`G-E2`
for unknown routes, and the `file://` sentence in `G-E1`) were requested in `03-architecture.md`,
section 13. None touches an invariant. All three are applied, on 5 October 2026.

**C-R4** (F5's `ConversationQuestions` contract in `data/conversation/<trendId>.js`, the
`SCENARIO_FLOW` switch and the condition for `F5-ST`), **C-R5** (O-4 answered by the Q-5 outcome),
**C-R6** (F5 lives in M6) and **C-R7** (F4 precondition 2 names the past judgement's authors and the
date the outcome was attached) were requested after the Architect's revision of 5 October 2026.
None touches an invariant. All four are applied, on 5 October 2026.

### Items still open

These do not block G2. Each says who closes it and what the demo does until then.

- **O-1. Conversation questions for F5** (Orchestrator). The contract exists (A-11, C-R4); what
  remains is a section in the Interrogator's instructions for one to three conversation questions
  per trend. Until the questions exist and pass the Verifier, `SCENARIO_FLOW` stays `"static"` and
  F5 ships as `F5-ST`.
- **O-2. Who writes the maturity explanations, the next-level descriptions and the replay
  calibration notes** (Orchestrator). No agent definition covers them. Whoever writes them, the
  Verifier checks them; a pipeline agent's text is labelled `ai-generated`. Until assigned, F3
  ships as `F3-S2`, and F4 cannot pass its exit criterion.
- **O-3. The list of foresight practices** (Verifier, with p. 9). F3 assumes the three methods R2
  names; the thesis is the authority.
- **O-4. The label of the governance argument.** *Closed, pending Miguel's confirmation of the Q-5
  outcome at G2.* The outcome recorded in `gates.md` assigns the argument to a build agent, so its
  paragraphs are `ai-generated` and no seventh label is needed. If Miguel assigns a person instead,
  this item reopens, because the six-value vocabulary has no value for human-written prose about
  the demo.

---

## Decisions handed to the Architect

A-1 to A-10, handed on 19 September 2026, are answered in `03-architecture.md`, section 12, and
the decisions they required from Miguel (DM-1 to DM-10) were taken on 4 October 2026. The
following follow from the 4 October decisions and are new.

- **A-11. F5's contracts and loading.** *Answered* in `03-architecture.md`, section 6.4:
  `ConversationQuestions` in one module per trend, loaded only after the scenario is recorded, the
  `SCENARIO_FLOW` switch, and F5 in M6.
- **A-12. The vocabulary's sixth value.** `common.schema.json`, `vocabulary.js` and the Judgement
  contract need `yours` (DM-1); the Judgement's label becomes `yours`, and so does the
  ScenarioRecord's.
- **A-13. ReadinessProfile under K-2 and D-1.** The maturity part holds one level per foresight
  practice, not one per venture; `nextComplement` is no longer pinned to null but holds, per
  practice, the next level's name, the report's description and a citation with a page, or the
  report's "no level above" case. Still no number, no level index and no boolean.
- **A-14. Tests touched by the decisions.** At least: M6-U7 (readings in a seeded random order,
  with the new note, instead of alphabetical order); M7-U7 (the pending sentence, plus the six
  wording constraints once verified); M9-U1 and M9-U2 (six labels; viewer entries now expected to
  pass with `yours`); M9-U4 and M10-U5 (the scenario route and `G-E2`); M10-U8 (the four Q-7
  viewports); and invariant audit 5 in `test-plan.md`, which still lists five labels.
