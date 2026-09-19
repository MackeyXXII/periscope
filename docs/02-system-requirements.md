# Level 2 — System requirements

**Status: expanded by the Requirements Engineer on 19 September 2026; awaiting G2. Owner:
Requirements Engineer. Four conflicts with the invariants (K-1 to K-4), three scope questions on
coverage (K-5 to K-7) and seven smaller questions (Q-1 to Q-7) are reported to the Orchestrator in
"Conflicts reported to the Orchestrator"; two steps of F3 are blocked pending K-2 and the OECD/WEF
verification (D-1). `traceability.md` is updated by the Orchestrator in a consolidated
pass after the Architect and Test Engineer.**

Four demo flows, in build order, plus six non-functional requirements. If budget runs short,
F3 and F4 become static screens rather than being cut.

## Functional requirements

| ID | Flow | What the viewer does | Satisfies |
|---|---|---|---|
| F1 | Core loop | Opens a trend card, records a gut reading, then sees three rival readings (opportunity, threat, noise), each with evidence, counter-evidence and a disconfirming condition; answers interrogation prompts; commits a judgement with a rationale | R3, R4, R2 |
| F2 | Weekly brief | Scans a small set of signals with source, date and relevance note; each signal links into F1 | R1, R2 |
| F3 | Readiness and maturity | Reads the persona's answers across the five readiness categories, the resulting profile, current maturity level and one next complement | R6, R8 |
| F4 | Decision log with replay | Reviews past judgements against real outcomes, with a calibration note such as "threat reading held; timing was early" | R5 |

## Non-functional requirements

| ID | Requirement |
|---|---|
| NF1 | Static and self-contained: no network calls at runtime |
| NF2 | Provenance: every factual claim links to a dated source; quotes short, paraphrase preferred |
| NF3 | Honest labelling of AI-generated, frozen, fictional and replayed content |
| NF4 | Core loop completable in under 8 minutes without a guide |
| NF5 | Responsive and legible on laptop and phone |
| NF6 | English interface; German-language source coverage recorded as a future requirement |

## How the rest of this document is organised

The two tables above are the agreed scope and are unchanged. Everything below expands them so
that an Implementer and a Test Engineer can work from this text without asking a question. First
come the conventions that hold across every flow; then each flow in turn, with its preconditions,
numbered steps, the data each step reads and writes, its screen states and its exit criterion; then
the verification of each non-functional requirement; and finally the conflicts, open questions and
decisions handed on to the Architect.

Screen states carry identifiers (for example `F1-S2`, `F2-E1`) so that tests can name them. `S`
marks a normal state, `W` a state in which some content has been withheld, and `E` an error state.

---

## Conventions that hold across all flows

### C-1. The demo stores nothing

All state created by the viewer — gut readings, prompt answers, judgements and rationales — lives
in memory for the lifetime of the loaded page and nowhere else. It is never written to
`localStorage`, `sessionStorage`, IndexedDB, cookies, the Cache API or a service worker, and it is
never transmitted. Moving between screens inside the demo keeps it; reloading or closing the page
discards it. There is no "save", no account and no export.

The consequence for F4 must be stated plainly: **the judgements in the decision log are frozen
replay content attributed to the fictional Tracewell team. They are not the viewer's own
judgements, and a judgement the viewer commits in F1 does not appear in F4.** (Whether it should
appear there, in-session only, is scope question K-5 below; this specification follows the seeded
scope until Miguel decides otherwise.)

### C-2. Entities named in this document

The Architect formalises these as JSON Schema in `schemas/`. The fields below are stated at the
level of intent, so that each step can say what it reads and writes; names, types and nesting are
the Architect's to decide. No entity may carry a `score`, `rank`, `confidence` or `priority` field,
or any field that orders one item above another by importance.

| Entity | Origin | Intent of its fields |
|---|---|---|
| Signal | Frozen, from the Scout via the Verifier | Title; English paraphrase summary; optional short quote; source (URL, publisher, publication date, retrieval date); relevance note for Tracewell; the trend or trends it belongs to; honesty label |
| Trend | Frozen, from the Trend Analyst | Title; summary written without any opportunity, threat or noise direction; the signals it rests on; exactly three Readings; honesty label; provenance |
| Reading | Frozen, from the Rival Readers | Lens (`opportunity` \| `threat` \| `noise`); the reading in plain language; evidence items, each with a dated source; counter-evidence items, each with a dated source; a disconfirming condition; honesty label |
| Interrogation | Frozen, from the Interrogator | For one trend: an intuition prompt; provenance checks; assumption probes; a pre-mortem question; honesty label |
| Judgement | **In-session only**, created by the viewer | The trend it concerns; the intuition record (gut call as one lens, optional one-line reason); optional answers to interrogation prompts; the lens the viewer commits to; the rationale; optional `role` (R7, designed for, not used in the demo) |
| ReadinessProfile | Frozen; answers from the persona dossier | Tracewell's answers in each of the five readiness categories; a prose finding per category; the maturity level (placeholder until verified, see F3); honesty labels; provenance for the framework |
| LogEntry | Frozen replay | The original signal or signals (real, dated); the past judgement attributed to the fictional team (lens and rationale; optional `role`); the outcome (paraphrase with a dated, real source); a calibration note; honesty labels |

Two containers are needed that are not in the Architect's list: something that holds one weekly
brief (the period it covers, its freeze date and which signals it contains) and something that
holds the governance screen's content (F3, step 4). The Architect decides whether these are new
entities or plain data modules; see A-2.

### C-3. Fail closed on invalid content

Every fixture is validated against its schema at test time (M1). The UI additionally performs the
structural checks listed in each flow's preconditions before it renders an item, because those
checks guard the invariants. When a check fails, the item is **not rendered at all** — never
partially — and a plain notice says that content was withheld because it failed validation, and how
many items were affected. The demo never shows a trend with two readings, a signal without a date,
or a replay entry without an outcome source.

If the application cannot start at all (a data module fails to load, a script error during start
up), `index.html` shows a static message, present in the HTML and removed by script only on
successful start, stating that the demo could not load and that it makes no network requests. This
is state `G-E1` and applies to every flow.

### C-4. No list order carries meaning

Every list on every screen has a fixed ordering rule that is independent of importance, and the
rule is stated in a short line of text next to the list wherever the list could be mistaken for a
ranking. No item in any list is visually distinguished from its peers: same template, same size,
same weight, no badge, no highlight, no "new" marker, no pinned item.

| List | Order | On-screen note required |
|---|---|---|
| Signals in the weekly brief (F2) | Publication date, newest first; ties by signal identifier, ascending | Yes: "Listed by publication date. The order says nothing about importance." |
| Signals on a trend card (F1) | Same rule as F2 | No |
| Trend index (F1) | Trend title, alphabetical | Yes: "Listed alphabetically." |
| The three readings (F1) | Fixed lens order, alphabetical by lens name: noise, opportunity, threat (see Q-2) | Yes: "The three readings are peers. They appear in alphabetical order of their lens." |
| Lens options in the gut-reading and judgement controls (F1) | Same fixed lens order as the readings | No |
| Evidence and counter-evidence items within a reading (F1) | Source publication date, oldest first | No |
| Interrogation prompts (F1) | Grouped by kind in the fixed sequence provenance checks, assumption probes, pre-mortem; within a group, fixture order. The Interrogator's rule that questions are not ordered by importance is the guarantee, checked at G3 | No |
| Readiness categories (F3) | The order in which Jöhnk et al. (2021) present them, as recorded in the persona dossier; never sorted by finding | No |
| Replay entries (F4) | Publication date of the original signal, oldest first; ties by entry identifier, ascending | Yes: "Listed by the date of the original signal." |

On a phone, side-by-side items stack in the same order; the order rule is unchanged.

### C-5. Honesty labels

Every content element shows a visible label from the vocabulary `real` | `ai-generated` | `frozen`
| `fictional` | `replay`, and carries the same label in machine-readable form so that tests can
check it. A demo-wide statement, visible from every screen, says that all content was produced
offline and frozen on the G3 date, and that nothing in the demo calls an AI service or the network.

How the vocabulary applies to composite items and to text the viewer types is **not settled**; it
is conflict K-3 below. The expected labels stated in each flow are a working proposal for the
Architect to confirm or replace, not a decision.

### C-6. Language rule for all interface copy and fixture text

No interface text, button, heading, tooltip, alternative text or fixture text may use ranking or
advisory language about options, trends, signals or readings. The forbidden set includes at least:
best, better option, recommended, recommendation, top, priority, prioritise, rank, ranking, score,
confidence, most important, most likely, key signal, must-read, winner. Quoted source text that
happens to contain one of these words is listed for Red-team review rather than silently passed.
The only evaluative text in the demo is the founder's own (their gut reading and rationale) and the
qualitative calibration notes in the replay (F4).

---

## F1 — Core loop

**Purpose.** The founder meets a trend, commits their own gut reading, and only then sees three
rival AI readings as peers. They are questioned, and they commit a judgement that cannot be
committed without a rationale. This flow carries R3 and R4 and shows R2's division of labour: the
machine did the scanning and the readings; the founder does the intuition and the judgement.

### Preconditions

1. The application has started (state `G-E1` is not showing).
2. The trend's data has loaded and passes these structural checks, otherwise the trend is withheld
   (`F1-E2`):
   - it has exactly three Readings, whose lenses are exactly `opportunity`, `threat` and `noise`,
     one each;
   - every Reading has non-empty reading text, at least one evidence item with a dated source, at
     least one counter-evidence item with a dated source, and a non-empty disconfirming condition;
   - it has an Interrogation with a non-empty intuition prompt;
   - every element carries a label from the vocabulary;
   - no `score`, `rank`, `confidence` or `priority` field is present.
3. Content constraints enforced before the freeze (Verifier at G3, not by the UI): the trend
   summary, the signal relevance notes and the intuition prompt express no opportunity, threat or
   noise direction and do not paraphrase any reading. Everything the viewer can see before the gut
   reading is recorded must be lens-neutral.

### Steps

| # | Viewer action | System response | Reads | Writes |
|---|---|---|---|---|
| 1 | Opens a trend card, either from a signal's trend link in F2 or from the trend index | If no Judgement exists for this trend in session state, shows `F1-S1`. If one exists, resumes at the state it had reached (`F1-S2`, `F1-S3` or `F1-S4`) | Trend (title, summary, signal list, label); Signal (title, publisher, publication date, URL, label) for each signal on the trend; Interrogation (intuition prompt only) | Nothing |
| 2 | Chooses a gut call: one of the three lens options, none pre-selected. Optionally types a one-line reason | "Record my gut reading" becomes enabled once a lens is chosen. The readings area still contains only a neutral placeholder | Nothing further | Draft gut call and reason, held in memory, not yet recorded |
| 3 | Activates "Record my gut reading" | Writes the intuition record, locks it read-only for the rest of the session, and **only then** creates the reading elements in the page. Shows `F1-S2` | Nothing further | Judgement: trend reference and intuition record (gut call, optional reason) |
| 4 | Reads the three readings | Each reading shows its lens, its text, its evidence and counter-evidence (each item with a source link and publication date) and its disconfirming condition, with equal visual weight, in the fixed lens order | Reading ×3 | Nothing |
| 5 | Reads the interrogation prompts and, optionally, answers any of them in free text | Prompts shown grouped as provenance checks, assumption probes and pre-mortem. Answers are optional and do not gate anything (see Q-1) | Interrogation (provenance checks, assumption probes, pre-mortem) | Judgement: prompt answers, if any |
| 6 | Chooses the lens they commit to (none pre-selected; in particular the gut call is **not** pre-selected) and writes a rationale | "Commit judgement" stays disabled until a lens is chosen **and** the rationale contains at least one non-whitespace character after trimming. While disabled, a line of text says what is missing. When both are present, shows `F1-S3` | Nothing further | Draft committed lens and rationale, in memory |
| 7 | Activates "Commit judgement" | Records the judgement, locks it read-only, and shows `F1-S4` | Nothing further | Judgement: committed lens, rationale |

**Rules that hold throughout F1.**

- Before step 3 completes, the page contains **no** reading text, evidence, counter-evidence or
  disconfirming condition for this trend in any form: not rendered and hidden, not in a
  `<template>`, not in an attribute, not in accessible-name text, not in a comment. The readings
  area shows only the sentence "The three readings appear once you have recorded your gut
  reading." Whether the reading data may sit in a loaded JavaScript module before step 3 is an
  Architect decision (conflict K-4).
- The gut reading, once recorded, cannot be edited or cleared in the session.
- A committed judgement cannot be edited or recommitted in the session. Each trend has its own,
  independent Judgement.
- The demo never evaluates the viewer's judgement: no "match" or "mismatch" between gut call and
  judgement, no feedback on the choice, no comparison with other people.
- The only interactive controls that write data are the gut-reading control, the optional prompt
  answers, and the judgement control. Nothing is sent anywhere.

**Expected labels (proposal, pending K-3).** Trend title and summary, readings and interrogation
prompts: `ai-generated`. Signals: `real`. Tracewell and anything attributed to its team:
`fictional`. The viewer's own entries: unresolved, see K-3.

### Screen states

| ID | State | What is shown | What is absent or disabled |
|---|---|---|---|
| `F1-S0` | Trend index | Trend titles in alphabetical order, each opening its trend card; the ordering note | Any reading content; any marker distinguishing one trend |
| `F1-S0e` | Trend index, empty | "No trend cards are available in this build." | — |
| `F1-S1` | Gut reading pending | Trend title, summary and signals; the intuition prompt; three lens options; optional reason field; "Record my gut reading" (disabled until a lens is chosen); the readings placeholder sentence | All reading content, from the DOM and not merely from view; interrogation prompts other than the intuition prompt; judgement controls |
| `F1-S2` | Gut reading recorded, judgement incomplete | The locked gut reading; the three readings; the interrogation prompts with optional answer fields; the judgement control and rationale field; "Commit judgement" disabled, with a line saying "Choose a reading and write a rationale to commit your judgement." (or only the part still missing) | Editing of the gut reading |
| `F1-S3` | Ready to commit | As `F1-S2`, with "Commit judgement" enabled | — |
| `F1-S4` | Committed | The locked gut reading, the committed lens, the rationale, and any prompt answers, side by side without commentary; a statement that this judgement is held only in this browser tab, is not saved or sent anywhere, will be gone on reload, and does not appear in the decision log, which is a replay | Any evaluation of the judgement; editing |
| `F1-E1` | Trend not found | "This trend card does not exist in this build." and a way back to the trend index | Everything else of the trend |
| `F1-E2` | Trend withheld | "This trend card was withheld because its content failed validation." and a way back | Every part of the trend, including its title and signals, so that nothing is shown partially |
| `G-E1` | Application failed to start | The static message described in C-3 | Everything else |

### Exit criterion

F1 is satisfied for a trend when all of the following hold and can be observed by a test:

1. Session state holds a Judgement for the trend with a recorded gut call (one lens), a committed
   lens and a rationale containing at least one non-whitespace character.
2. The intuition record was written before any reading element existed in the page: a DOM snapshot
   taken in `F1-S1` contains none of the three readings' text, evidence, counter-evidence or
   disconfirming-condition strings, and a snapshot taken immediately after step 3 contains all
   three readings.
3. In `F1-S2`, "Commit judgement" was disabled for an empty or whitespace-only rationale and for a
   missing lens.
4. `F1-S4` is showing, and nothing was written to any browser storage or sent over the network.

---

## F2 — Weekly brief

**Purpose.** R1's attention budget made concrete: a small, fixed set of real signals that reads in
about ten minutes, each a door into F1. It shows R2's machine side, since scanning was automated.

### Preconditions

1. The application has started.
2. The weekly brief's data has loaded. The brief holds no more than `BRIEF_SIGNAL_CAP` signals (a
   named constant whose value Miguel sets; see Q-3).
3. Each signal passes these structural checks, otherwise it is withheld (`F2-W1`): a source URL, a
   publication date, a retrieval date, a non-empty English summary, a non-empty relevance note and
   a label from the vocabulary; any quote is no longer than `QUOTE_MAX_WORDS` (see Q-4).
4. Content constraint enforced at G3: relevance notes say why a signal concerns Tracewell without
   calling it good, bad or unimportant for Tracewell (they are lens-neutral, so they cannot pre-empt
   the gut reading in F1), and they carry no level of relevance ("high", "low" or similar).

### Steps

| # | Viewer action | System response | Reads | Writes |
|---|---|---|---|---|
| 1 | Opens the weekly brief | Shows `F2-S1`: a header with the period the brief covers and its freeze date, the ordering note, then the signals in the order set by C-4 | Brief container (period, freeze date, signal list); Signal for each listed signal | Nothing |
| 2 | Scans a signal | Each signal shows its title, English summary, optional short quote with attribution, publisher, publication date, a link to the source, the relevance note, and labels | Signal | Nothing |
| 3 | Activates a signal's trend link | Opens that trend card in F1, at `F1-S1` or at whatever state the trend reached earlier in the session. A signal that belongs to more than one trend shows one link per trend, in alphabetical order of trend title | Trend reference(s) on the Signal | Nothing |
| 4 | Optionally activates a source link | Opens the original source in a new browser tab. This is navigation chosen by the viewer, not a runtime request by the demo | Signal source URL | Nothing |

The reading-time estimate is a test-time check, not an on-screen element: the total word count of
all text rendered in `F2-S1`, divided by `READING_WPM` (a named constant, proposed at 200 words per
minute; Miguel confirms, see Q-3), must be ten minutes or less.

**Expected labels (proposal, pending K-3).** Signal title, source, date and quote: `real`. Summary
and relevance note: `ai-generated`. The brief as a whole: `frozen`, with its freeze date.

### Screen states

| ID | State | What is shown | What is absent |
|---|---|---|---|
| `F2-S1` | Brief listed | As in steps 1 and 2 | Any signal visually distinguished from the others; any count, level or marker of relevance |
| `F2-S0` | Brief empty | "This brief contains no signals." | — |
| `F2-W1` | Some signals withheld | The remaining signals as in `F2-S1`, plus "N signal(s) were withheld because they failed the provenance check." | The withheld signals, entirely |
| `F2-S2` | Signal without a resolvable trend | The signal as normal, with "No trend card for this signal in this build." in place of the link. This state is a defect caught by the M5 unit test (every brief signal must resolve to at least one trend) and must not ship | — |
| `F2-E1` | Brief data invalid | "The weekly brief could not be shown because its content failed validation." | All signals |
| `G-E1` | Application failed to start | As in C-3 | Everything else |

### Exit criterion

F2 is satisfied when `F2-S1` shows no more than `BRIEF_SIGNAL_CAP` signals; every signal shows a
working source link, a publication date, a relevance note and a label; the estimated reading time
computed as above is ten minutes or less; the list order equals the C-4 rule; no signal is visually
distinguished; and activating each signal's trend link opens the matching trend card in F1.

---

## F3 — Readiness and maturity, with the governance screen

**Purpose.** R6: show why Tracewell sits where it does across the five readiness categories and on
the maturity scale. R8: a governance screen stating plainly what is and is not implemented. F3 is
read-only; the viewer writes nothing.

**Dependency flag.** The maturity level names, the number of levels and the criteria for each level
come from the OECD/WEF report, which is not yet identified by title, date and URL anywhere in the
repository and has not been verified. Until Miguel confirms them against the report itself, every
place a level name would appear shows the literal placeholder `LEVEL_NAME_UNVERIFIED`. No step
below states, implies or guesses a level name, the number of levels, or a level's criteria.

### Preconditions

1. The application has started.
2. The ReadinessProfile has loaded and passes these checks, otherwise the profile is withheld
   (`F3-E1`): exactly five readiness categories; each with at least one answer and a non-empty
   finding; labels present; no numeric score and no field named or behaving as a score, rank,
   confidence or priority.
3. The five categories are those of Jöhnk et al. (2021), recorded in the persona dossier with a
   citation. The paper names them strategic alignment, resources, knowledge, culture and data;
   the exact labels are confirmed against the paper by the Verifier before freeze, and the UI uses
   the confirmed labels.
4. The governance content has loaded, otherwise `F3-E2`.

### Steps

| # | Viewer action | System response | Reads | Writes |
|---|---|---|---|---|
| 1 | Opens Readiness | Shows `F3-S1`: the five categories in source order, each with Tracewell's answers and a prose finding; a citation of Jöhnk et al. (2021) with a dated link | ReadinessProfile (categories, answers, findings, framework provenance) | Nothing |
| 2 | Reads the maturity view | Shows the current maturity level as `LEVEL_NAME_UNVERIFIED`, with the sentence "Level name pending verification against the OECD/WEF report." The explanation of why the team sits at that level is **blocked** until the report's level criteria are verified (see D-1): until then the view shows "The explanation of this level will be added once the level definitions are verified." | ReadinessProfile (maturity level, explanation, report provenance) | Nothing |
| 3 | Reads the next complement | **Blocked** by conflict K-2 and by D-1. Until both are resolved, the view shows "Pending: the next complement depends on the verified level definitions." and nothing more | ReadinessProfile (next complement) | Nothing |
| 4 | Opens the governance screen, from a link in F3 and from the main navigation | Shows `F3-S3` with two lists and the argument for own-data ingestion's conditions (see below) | Governance content | Nothing |

**Required content of the governance screen (R8).** Two plainly headed lists.

*Implemented in this demo:* signals come only from the open web, from public sources, and were
frozen at G3; no viewer data is stored or transmitted; no AI service is called while the demo is
used; there are no accounts, cookies or analytics.

*Not implemented:* ingestion of a team's own data, which is argued on this screen and not built,
pending verified GDPR and EU compliance; persistence of judgements across sessions; the
role-aware data model (R7), which is designed in the architecture and not built.

The argument that follows the two lists states what own-data ingestion would require before it
could be built. Every factual claim in it about GDPR or other EU regulation carries a dated source
under NF2 and passes the Verifier. Who writes this content is not yet assigned (Q-5).

**Expected labels (proposal, pending K-3).** Tracewell's answers and findings: `fictional`. The
framework citations: `real`. The maturity placeholder: no label until the level is verified, since
it is not content. The governance lists: statements about the demo itself, label to be decided
under K-3.

### Screen states

| ID | State | What is shown | What is absent |
|---|---|---|---|
| `F3-S1` | Readiness profile | As step 1 | Numeric scores, bars, gauges or colour scales implying a score; sorting of categories by finding |
| `F3-S2` | Maturity view, unverified | The placeholder, the pending sentence and the blocked-step sentences from steps 2 and 3 | Any level name, level count or level criterion |
| `F3-S2v` | Maturity view, verified | Specified only after D-1 and K-2 are resolved; not buildable at G2 | — |
| `F3-S3` | Governance screen | Both lists and the sourced argument | — |
| `F3-E1` | Readiness profile withheld | "The readiness profile was withheld because its content failed validation." | All five categories, so that none is shown partially |
| `F3-E2` | Governance content missing | "The governance statement could not be shown." This state must not ship, since R8's acceptance depends on the screen | — |
| `G-E1` | Application failed to start | As in C-3 | Everything else |

### Exit criterion

At G2, F3 is satisfied when `F3-S1` shows all five categories with answers, findings and a dated
citation; `F3-S2` shows `LEVEL_NAME_UNVERIFIED` and no other level name anywhere in the shipped
files; and `F3-S3` shows both the implemented and not-implemented lists. The full R6 exit
criterion — the viewer sees why the team sits at its level and the next complement — cannot be met
until D-1 and K-2 are resolved, and is re-specified then.

---

## F4 — Decision log with retrospective replay

**Purpose.** R5: capability accumulates when past judgements are reviewed against what happened.
The demo shows this with a retrospective replay: real signals from about early 2026, a judgement
attributed to the fictional Tracewell team, and what actually happened by September 2026, from a
dated real source. F4 is read-only; the viewer writes nothing, and the viewer's own F1 judgements
are not part of it (C-1).

### Preconditions

1. The application has started.
2. The log data has loaded. Each LogEntry passes these checks, otherwise it is withheld (`F4-W1`):
   at least one original signal with a URL and a publication date in the replay window; a past
   judgement with a lens and a non-empty rationale; an outcome with a paraphrase, a source URL and a
   publication date later than the original signal's; a non-empty calibration note; labels present.
3. Content constraints enforced at G3: every outcome is real and dated (an invented outcome is a
   project-ending defect); calibration notes are qualitative prose.

### Steps

| # | Viewer action | System response | Reads | Writes |
|---|---|---|---|---|
| 1 | Opens the decision log | Shows `F4-S1`. A replay statement, visible without scrolling on laptop and phone, says: this is a retrospective replay; the signals are real and from early 2026; the outcomes are real and dated by September 2026; the judgements are attributed to the fictional Tracewell team and were written for this demo after the fact (see K-7); they are not the viewer's; judgements committed in this session are not stored and do not appear here | Log container; LogEntry list | Nothing |
| 2 | Reads an entry | The entry shows, in this fixed sequence: the original signal(s) with source link and publication date; the past judgement (lens and rationale); the outcome with its source link and publication date; the calibration note | LogEntry | Nothing |
| 3 | Optionally activates a source link | Opens the source in a new browser tab, as in F2 step 4 | Source URL | Nothing |

**Rules that hold throughout F4.** No aggregate across entries: no tally of readings that held, no
hit rate, no accuracy figure, no chart of calibration. No per-entry verdict icon (tick, cross,
colour) that invites tallying; the calibration note is prose only. Entries appear in the C-4 order.

**Expected labels (proposal, pending K-3).** Original signals and outcomes: `real`. Past judgement:
`replay` (and attributed to a `fictional` team). Calibration note: `ai-generated` or authored, to be
settled under K-3 and K-7. The entry as a whole: `replay`.

### Screen states

| ID | State | What is shown | What is absent |
|---|---|---|---|
| `F4-S1` | Log listed | The replay statement, then the entries as in step 2 | Aggregates, verdict icons, any entry visually distinguished |
| `F4-S0` | Log empty | The replay statement and "This build contains no replay entries." | — |
| `F4-W1` | Some entries withheld | As `F4-S1`, plus "N entr(y/ies) were withheld because they lacked a dated outcome source or failed validation." | The withheld entries, entirely |
| `F4-E1` | Log data invalid | The replay statement and "The decision log could not be shown because its content failed validation." | All entries |
| `G-E1` | Application failed to start | As in C-3 | Everything else |

### Exit criterion

F4 is satisfied when `F4-S1` shows at least one entry; every shown entry has an original signal
with a working, dated source, a past judgement, an outcome with a working source dated after the
signal, and a calibration note; the replay statement is visible on arrival at laptop and phone
widths; entries follow the C-4 order; and no aggregate or verdict icon appears.

---

## Verification of the non-functional requirements

Test levels follow `test-plan.md`. Tooling has no package manager, so unit tests are plain ES
modules run under `node --test` or in the browser; integration and system checks that need a real
browser are scripted walks run by the Test Engineer or the Red-team Reviewer. Module references
follow `04-module-design.md`.

| NF | How it is verified | Test level | Modules | Pass criterion |
|---|---|---|---|---|
| NF1 Static, no runtime network calls | Static audit of every shipped file (`index.html`, `assets/`, `data/`) for `fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, `import` from an `http(s)` URL, `<script>`, `<link>`, `<img>`, `srcset`, `<iframe>`, `@import` or CSS `url()` pointing at a remote address, and remote `@font-face`. Plain `<a href>` links to sources are allowed, because they are navigation the viewer chooses. The same audit checks for `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`, `caches` and `serviceWorker` (C-1) | Unit | M10, M1 | Zero matches outside `<a href>` |
| | Load the demo from a local static server with the browser offline, then from `file://`, and walk F1 to F4 while recording network activity | Integration | M10 | Every screen renders; no request leaves the page's own files. See A-9 on `file://` |
| | Invariant audit 6 | System | all | As in `test-plan.md` |
| NF2 Provenance | Schema check that every claim-bearing item has a source URL, publication date and retrieval date (M1); every Signal has a URL, date and summary (M3); every evidence and counter-evidence item has a dated source (M4); every replay outcome has a dated source later than its signal (M8); every rendered claim shows its link and date, and every quote is within `QUOTE_MAX_WORDS` (M9) | Unit | M1, M3, M4, M8, M9 | All assertions pass for every fixture |
| | Claim-by-claim check that each source exists and says what is claimed; unverifiable claims struck | Review (Verifier at G3; Red-team Reviewer) | — | Verification record lists every claim with a verdict; no struck claim ships |
| | Invariant audit 4 | System | all | As in `test-plan.md` |
| NF3 Honest labelling | Every rendered content element carries a visible label and a machine-readable label from the vocabulary; the demo-wide "frozen offline, no live AI" statement is present on every screen; the replay statement is present in F4 | Unit | M9 | No content element lacks a label; no label outside the vocabulary |
| | Invariant audit 5, and review of whether each label is correct, not merely present | System; Review (Red-team at G3 and G4) | M9, M10 | No mislabelled element |
| NF4 Core loop under 8 minutes | Two to three people unfamiliar with the project open the demo unaided; timed from first display of the entry screen to `F1-S4` for one trend (see Q-6) | Acceptance (G5), preceded by the agent rehearsal | M10, M5, M6 | Each viewer reaches `F1-S4` in under 8 minutes |
| NF5 Responsive and legible | Walk F1 to F4 at a phone viewport of 360 by 640 CSS pixels and a laptop viewport of 1280 by 800 (widths proposed; Q-7); a viewport meta element is present (static check) | System; Unit for the static check | M10 | Every step completes at both sizes; no horizontal scrolling; no clipped content or control; body text not smaller than 16 CSS pixels; the three readings keep equal visual weight at both sizes |
| NF6 English interface | `<html lang="en">` present (static check); all interface copy in English (review); the future requirement below is present in this document | Unit for the static check; Review | M10 | All three hold |

**Invariant checks that are not NFs but must be verified.** Invariant audits 1, 2 and 3 in
`test-plan.md` verify F1's rules: M4 and M1 unit tests assert exactly three peer readings and no
forbidden field; M6 unit tests assert that no reading element exists before the intuition record
and that commit is disabled for an empty or whitespace-only rationale; the C-6 language audit runs
over interface copy and fixture text as part of the system test.

### Future requirement recorded under NF6

*German-language source coverage.* Tracewell is based in Linz, and a real build would scan
German-language sources (Austrian and German trade press, registers and regulators) as well as
English ones. The demo does not do this systematically. In the demo, a signal may come from a
German-language source; its title may stay in the original language, its summary and relevance
note are in English, and any quote is short and attributed. Systematic German coverage is a future
requirement for a later pass at Level 1, not part of this build.

---

## Conflicts reported to the Orchestrator

These are stated, not resolved. Where a step depends on one, the step says so.

### Conflicts between the seeded flows and the invariants

**K-1. R1's acceptance wording and the no-ranking invariant.** R1's acceptance test reads "A viewer
finds *the one signal worth discussing* within the time budget." Read literally, the brief would
have to contain one designated signal, which is a prioritisation. The invariant wins in the
specification: F2 designates, highlights and distinguishes no signal. What is open is how G5 scores
this criterion. The reading consistent with the invariant is that the viewer picks the signal *they*
judge worth discussing and can say why within the time budget. R1 is frozen and is not edited here;
Miguel should confirm this reading at G2 or reopen G1.

**K-2. "One next complement" (R6, F3) and the no-recommendation invariant.** Presenting a single
next complement for the team to build is, on its face, a recommendation from the tool, which
`CLAUDE.md` rules out. It could be compatible if it is presented as what the verified maturity
framework itself defines as the requirement for the next level, sourced to the report, rather than
as the tool's advice; or it could be replaced by showing the gaps without choosing among them. This
is Miguel's decision. F3 step 3 is blocked until then (and in any case until D-1).

**K-3. The honesty vocabulary does not cover every element.** Three gaps. First, text the viewer
types (gut reading, prompt answers, rationale) is none of `real`, `ai-generated`, `frozen`,
`fictional` or `replay`, yet invariant 5 says every element carries one, and R2's acceptance test
needs founder steps to be distinguishable from machine steps. Second, the vocabulary mixes two
dimensions — origin (real, AI-generated, fictional) and time status (frozen, replay) — while the
invariant says "labelled as *one* of"; every pipeline reading is both AI-generated and frozen.
Third, composite items (a replay entry holding a real signal, a fictional team's judgement and a
real outcome) need either per-part labels or a rule. Miguel should decide the label semantics; the
Architect then fixes the mechanism. Until then, the expected labels in each flow are proposals.

**K-4. Invariant audit 2 and statically imported data.** `test-plan.md` says no AI reading may be
reachable "in the DOM *or in module state*" before intuition is recorded. `CLAUDE.md` requires
fixtures to ship as ES modules imported directly. If the readings are imported at start up, their
text is in module state from the first moment, even though it is not in the DOM. Either the readings
are loaded only after the intuition record (for example by a dynamic `import()` triggered by step 3,
which also needs to work from `file://`), or the audit's wording is narrowed to "not in the DOM and
not reachable through the rendering path". This specification fixes the DOM behaviour and leaves
the module-state question to the Architect and Miguel; it should not be settled by quietly reading
the audit narrowly.

### Scope questions for Miguel

**K-5. R5 says "persist"; the demo stores nothing.** R5 asks that signals, readings,
judgements and outcomes persist and are reviewed later. The demo persists nothing and shows R5
through frozen replay only, which meets R5's acceptance test ("a viewer sees a past judgement
compared with what happened") but not the requirement's wording for the viewer's own judgements.
Should a judgement committed in F1 also appear in F4 for the rest of the session, clearly labelled
as the viewer's and unsaved? This specification currently says no, following the seeded F4 row.

**K-6. R2's scenario work has no flow.** R2 asks for "scenario work structured around the founder's
own external conversations". None of F1 to F4 covers it; the pre-mortem prompt in F1 touches it only
loosely. Is it deliberately out of the demo's scope (and so to be stated as such in the traceability
matrix and perhaps on the governance screen), or is a flow missing? No feature has been invented
here to cover it.

**K-7. Who writes the replay judgements, and how is hindsight kept out.** The replay candidates
brief supplies original signals and dated outcomes, not the past judgements or their rationales.
Someone must author a judgement "as of early 2026" in September 2026, knowing the outcome. Without a
rule, the replay risks showing judgements that conveniently held. Miguel should decide who authors
them (for example the Rival Readers and a judgement written from the early-2026 signals only, before
the outcome is attached), whether the set must include judgements that did not hold, and what the
replay statement says about authorship. The F4 replay statement already says the judgements were
written after the fact.

**Q-1. Interrogation answers.** Specified as optional, gating nothing, to keep NF4's budget. If
Miguel wants answering to be required before commit, F1 step 6 changes.

**Q-2. Order of the three readings.** Specified as a fixed alphabetical order by lens (noise,
opportunity, threat) with an on-screen note. The alternative is a per-session random order, which
removes any fixed position but makes tests and walkthroughs less repeatable.

**Q-3. Attention budget constants.** The value of `BRIEF_SIGNAL_CAP`, whether R1's "fixed number"
means exactly that many or no more than that many (this specification says no more than), and
`READING_WPM` (proposed 200).

**Q-4. Quote length.** `QUOTE_MAX_WORDS`, the cap that makes "short quote" testable.

**Q-5. Governance content.** No agent is assigned to write the governance screen's argument, which
contains regulatory claims that must be sourced and verified.

**Q-6. What NF4's eight minutes measures.** Specified as entry screen to `F1-S4` for one trend. The
alternative is timing only the core loop from opening a trend card.

**Q-7. NF5 viewport sizes.** Proposed 360 by 640 and 1280 by 800 CSS pixels.

### Dependencies on content not yet produced

**D-1. The OECD/WEF report.** Not identified in the repository by title, date and URL. F3 steps 2
and 3 and state `F3-S2v` depend on it for level names, number of levels, level criteria and the
mapping from readiness findings to a level. `LEVEL_NAME_UNVERIFIED` stays in place until Miguel
confirms the names against the report.

**D-2. Cowork outputs.** F2 depends on the scanning brief (time window, sources); F3 on the persona
dossier (the five categories and Tracewell's answers); F4 on the replay candidates (signals and
dated outcomes). This specification describes how that content is shown and checked, and does not
presume what it says.

---

## Decisions handed to the Architect

- **A-1. Entity shapes.** Field names, types and nesting for the seven entities in C-2, including
  where the intuition record sits (inside Judgement, as a required part, or as a separate record the
  Judgement must reference) so that "a Judgement is invalid without a preceding intuition" is
  enforced by the schema.
- **A-2. Containers.** How the weekly brief (period, freeze date, signal list) and the governance
  content are held: new entities or plain data modules.
- **A-3. Signal-to-trend link.** Which side holds the reference, and how the M5 test proves every
  brief signal resolves to a trend.
- **A-4. Interrogation structure.** Whether assumption probes are per trend or per reading, and
  whether the intuition prompt is held separately so that nothing else from the Interrogation is
  rendered before step 3.
- **A-5. Runtime checks and loading.** Which of the structural checks in each flow's preconditions
  run in the browser; how a failed or missing data module produces a per-screen error state rather
  than stopping the whole application (static imports fail the whole module graph, so per-screen
  error states imply dynamic `import()` or a single validated data entry point); and the static
  `G-E1` fallback in `index.html`.
- **A-6. Readings before intuition.** The answer to K-4, in coordination with Miguel.
- **A-7. Label mechanism.** How a label is shown and made machine-readable, at what granularity, once
  K-3 is decided.
- **A-8. Session state.** How in-memory state is held across screens without any browser storage,
  and how screens are addressed (for example by URL fragment) so that `F1-E1` has a meaning.
- **A-9. `file://`.** Chromium-based browsers refuse to load ES module scripts from `file://`
  origins, so "the demo also works from `file://`" in `CLAUDE.md` may hold only in some browsers.
  The Architect should state which browsers the `file://` check in NF1's integration test covers,
  or report the constraint to the Orchestrator.
- **A-10. ReadinessProfile without a score.** How per-category findings and the maturity level are
  represented with no `score` field and no numeric scale, subject to Red-team review.
