# Traceability matrix

Every requirement links to its functions, modules and tests. The Requirements Engineer and the
Architect keep this current; a change that leaves this matrix stale is an incomplete change.

Legend: R = user requirement (L1), F/NF = system requirement (L2), M = module (L4). Test
identifiers (for example M6-U1) are those in `04-module-design.md`. Last updated 5 October 2026 by
the Requirements Engineer, applying Miguel's G2 decisions of 4 and 5 October 2026 (including the
confirmed Q-5 outcome), the Red-team Reviewer's G2 findings B4, B5 and N2, and the Architect's test
revisions of the same day. F5 is assigned to M6 and **ships in this release as the static screen
`F5-ST`**; tests of the interactive F5 design are kept and marked *deferred*.

## Requirement → function → module → test

| R | Function | Modules | Verified by |
|---|---|---|---|
| R1 Attention budget | F2 | M5, M3 | Unit: no more than five signals (M5-U1, M1-U5); reading time at 200 words per minute within ten minutes (M5-U2); order by date, not importance (M5-U3); no signal distinguished, no relevance level (M5-U6, M5-U8); summaries and relevance notes free of C-6 terms, relevance levels and lens words, so they cannot pre-empt the gut reading (M3-U6, lens-word rule added 5 Oct 2026) · Acceptance (G5), scored under K-1: the viewer picks the signal *they* judge worth discussing and says why within ten minutes; no designated answer |
| R2 Uneven augmentation | F1, F2, F5 (ships as `F5-ST`) | M3, M4, M6, M9 | Unit: machine steps labelled `ai-generated` and founder steps `yours` in F1 (M6-U17, M9-U1); `F5-ST` shows no input and no machine content, and requests no conversation module, with `SCENARIO_FLOW` `"static"` (M6-U24, M9-U1 static-F5 walk) · Acceptance: viewer can say who did what in F1 and F2. **F5 ships as `F5-ST`, so R2's scenario method is described, not demonstrated, in this release** (Miguel, 5 Oct 2026). *Deferred with the interactive F5 design:* M6-U18 to M6-U23, M6-U25, M6-U26 |
| R3 No ranking (non-negotiable) | F1 | M4, M6, M1 | Unit: no `score`/`rank` field or numeric type (M1-U2, M1-U3, M1-U4, M4-U3); only allowlisted enumerations (M1-U5); exactly three peer readings (M4-U1, M1-U8); readings in a seeded random order, invariant under data order, identical templates (M6-U7); identical label markup on peers (M9-U5) · System: invariant audit 1 · Acceptance: no "best option" on any screen |
| R4 Questioning habits | F1 | M6, M4, M1 | Unit: readings neither in the page nor requested before the intuition record (M6-U1, M6-U2, M10-U4); `F1-E3` withholds failed readings (M6-U11); commit disabled without lens or rationale **and refused by the commit function on every path, including a keyboard submit** (M6-U3, refusal cases added 5 Oct 2026, B4; M1-U10); intuition record locked, and **an intuition record without a lens refused by the recording function** (M6-U5, refusal case added 5 Oct 2026, B4); answering primary, skipping secondary (M6-U16); questions, not advice (M4-U8, M4-U9) · System: invariant audits 2 and 3 |
| R5 Accumulated capability | F4 | M8 | Unit: every replay entry has a dated real outcome source (M8-U1); signals within 1 Jan to 31 Mar 2026 (M8-U2); judgement written before the outcome was attached (M8-U7); replay statement names authors and dates, contains "the outcomes were withheld from the agents' inputs" and "the model's general knowledge extends to mid-2026 and may include some of these outcomes", and does not claim the judgements used the signals only (M8-U4, revised 5 Oct 2026, B5); calibration note labelled `ai-generated` (M8-U9); no aggregate (M8-U5) · Review (G3): at least one judgement that did not hold; the Verifier records per entry whether the outcome predates June 2026 (B5); calibration notes written by the Trend Analyst (O-2) · Acceptance: viewer sees a past judgement against what happened. K-5: F1 judgements do not appear in F4; revisit if G5 viewers miss them |
| R6 Complements | F3 | M7, M1, M9 | Unit: five readiness categories present (M7-U1); one level per practice, `LEVEL_NAME_UNVERIFIED` until verified (M7-U2, M7-U7, M1-U18); level names have one home (M1-U18); lower-level rule (M1-U20, M7-U10); next-level wording constraints (M7-U8, M7-U9); maturity explanations and next-level descriptions labelled `ai-generated`, level assignments `fictional` (M9-U6, explanation label added 5 Oct 2026; O-2) · Review (Verifier): level names on p. 9 of the WEF/OECD report; the three practices checked against the thesis (O-3 closed: they stay) · Pending Miguel at G2: category findings labelled `fictional` (proposed default) |
| R7 Role-aware model (designed, not built) | **None, by exemption (proposed, Miguel to confirm at G2)** | M1 | **Exemption.** R7's own L1 acceptance is "documented in the architecture only". It is designed, not built: `03-architecture.md` section 11 sets out the role-aware model, and `Judgement` and `LogEntry` carry an optional `role` field that nothing uses. A flow would need viewer roles, which the demo cannot have because it has no accounts and stores nothing (C-1). Acceptance is therefore met by documentation · Review: optional `role` field present; architecture section 11 present; governance screen lists the role-aware model as not implemented (F3) · Unit: no fixture or page code uses `role` (M8-U8). If Miguel does not confirm, R7 is an open gap that blocks G2 |
| R8 Open web by default | F3 (governance screen) | M7, M9, M1 | Unit: required items present and each implemented item names its test (M7-U5, M7-U6); argument paragraphs labelled `ai-generated`, lists `real` (M1-U17, M7-U5, M9-U6) · Review: governance screen states what is and is not implemented; argument written by the Architect from the Scout's frozen sources, every paragraph verified or struck (Q-5, confirmed by Miguel 5 Oct 2026) |

## Function → screen states → module → test

| F | States | Modules | Verified by |
|---|---|---|---|
| F1 Core loop | `F1-S0`, `F1-S0e`, `F1-S1` to `F1-S4`, `F1-E0`, `F1-E1`, `F1-E2`, `F1-E3` | M6, M4, M1, M9, M10 | Unit: M6-U1 to M6-U17 (`F1-E0`: M6-U15; Q-1: M6-U16; Q-2: M6-U7; B4 refusal of commit and of an empty intuition record, including keyboard submit: M6-U3, M6-U5), M1-U8 to M1-U10, M1-U12, M4-U1 to M4-U9 · System: scripted walk, including an attempted keyboard submit with no lens or rationale |
| F2 Weekly brief | `F2-S0`, `F2-S1`, `F2-S2`, `F2-W1`, `F2-E1` | M5, M3, M9 | Unit: M5-U1 to M5-U11, M3-U1 to M3-U6 (M3-U6 with the lens-word rule) · System: scripted walk · Acceptance: R1 scoring rule (K-1) |
| F3 Readiness, maturity, governance | `F3-S1`, `F3-S2`, `F3-S2v`, `F3-S3`, `F3-E1`, `F3-E2` | M7, M1, M9 | Unit: M7-U1 to M7-U11, M1-U17, M1-U18, M1-U20, M9-U6 (explanation and next-level labels `ai-generated`) · Review: Verifier at G3 (level names, Trend Analyst text, governance argument) |
| F4 Decision log with replay | `F4-S0`, `F4-S1`, `F4-W1`, `F4-E1` | M8, M9 | Unit: M8-U1 to M8-U10 (M8-U4 with the two B5 phrases), M9-U6 · Review: K-7 conditions at G3, and the Verifier's per-entry record of whether each outcome predates June 2026 (B5) |
| F5 Scenario work, **shipping as `F5-ST`** | Shipped: `F5-ST`, and `F1-E0` to `F1-E2` on the scenario route. Designed, not built: `F5-S0`, `F5-S1`, `F5-S2`, `F5-E2` | M6 (screen, switch); M1 and M4 for the deferred design (contracts `ConversationQuestions`, `ScenarioRecord`; `loadConversation`; conversation questions) | Unit, this release: M6-U24 (`F5-ST` and the switch), M9-U1 (static-F5 walk), M6-U15 (`F1-E0` on the scenario route), M1-U12 (loader refusals) · System: scripted walk showing `F5-ST` from `F1-S4`, with no input field, no `ai-generated` element and no `data/conversation/` request. *Deferred, not removed (interactive design):* M6-U18 to M6-U23, M6-U25, M6-U26, M1-U19, M4-U10, M4-U11, and any conversation-module cases of M1-U6 and M1-U9, as marked in `04-module-design.md` |
| Application-wide | `G-E1` (failed to start, with the `file://` sentence), `G-E2` (page not found) | M10 | Unit: M10-U3 (`G-E1`), M10-U5 (`G-E2`, routes including `#/scenario/<id>`), M10-U6 (per-screen failure) |

## Non-functional → module → test

| NF | Modules | Verified by |
|---|---|---|
| NF1 Static, no runtime network calls | M10, M1, M6 | Unit: static audit for network calls and storage (M10-U1, M10-U2); no data path outside the loader, no preload (M10-U4); no storage in F1 (M6-U9); F5 storage test M6-U25 deferred with the interactive design · Integration: offline from a local server in Chromium and Firefox, F1 to F5 (F5 as `F5-ST`); from `file://`, Firefox works and Chromium shows `G-E1` with its `file://` sentence (DM-6) · System: invariant audit 6 · Tests run under Node (F-9, v24.21.0); no `fetch()` anywhere in the repository; DM-11 not needed |
| NF2 Provenance | M9, M3, M4, M7, M8, M1 | Unit: every claim resolves to a dated source (M1-U1, M3-U1, M3-U2, M4-U2, M4-U4, M8-U1); nothing ships without a `pass` verdict (M1-U16); quotes at most 15 words (M3-U4, M9-U7); report citations with page (M7-U8, M7-U9, M9-U3); replay statement makes no unverifiable "signals only" claim (M8-U4, B5) · Review: Verifier at G3, including the per-entry June 2026 record · System: invariant audit 4 |
| NF3 Honest labelling | M9, M6, M5, M8, M1 | Unit: every element carries a label from the six-value vocabulary, including `yours` on every viewer entry in F1 (M9-U1, M9-U2, M6-U17); `F5-ST` carries no `ai-generated` element (M6-U24); identical labels on peers (M9-U5); per-part labels, including `ai-generated` maturity explanations and next-level descriptions (M9-U6, M5-U11, M8-U9); interface copy unlabelled (M9-U8); `frozen` only on the brief (M9-U9). F5 `yours` checks (M6-U22) deferred · System: invariant audit 5, listing the six labels (`test-plan.md`, 5 Oct 2026) · Review: labels correct under C-5 |
| NF4 Core loop under 8 minutes | M10, M5, M6 | Acceptance: unaided walk, timed only for the core loop (Q-6), from first display of `F1-S1` to `F1-S4`; the entry screen is the weekly brief (DM-7) and time there is not counted |
| NF5 Responsive | M10 | Unit: M10-U8 at 360 × 640 and 390 × 844 portrait, 1280 × 800 and 1440 × 900 landscape (Q-7) · System: F1 to F5 (F5 as `F5-ST`) complete at the same four viewports |
| NF6 English interface | M10 | Unit: `<html lang="en">` (M10-U3) · Review: German-source coverage recorded as a future requirement |

## Unit tests by module

All ten modules have their paired test files in `tests/unit/` (`m1-contracts`, `m1-freeze`,
`m2-briefs`, `m3-signals`, `m4-interpretation`, `m5-brief`, `m6-judgement`, `m6-scenario`,
`m7-readiness`, `m8-log`, `m9-honesty`, `m10-shell`, as `.test.mjs` for Node and `.browser.mjs`
for browser runners where needed), with the shared harness in `tests/lib/`. Revisions the Architect
specified on 5 October 2026 must be carried into those files by the Test Engineer.

| Module | Tests | Revised 5 Oct 2026 (Red-team G2 findings and Miguel's decisions) |
|---|---|---|
| M1 Data contracts | M1-U1 to M1-U20 | M1-U19 (`ScenarioRecord`) deferred with interactive F5 |
| M2 Persona and scanning brief | M2-U1 to M2-U5 | — |
| M3 Scan pipeline | M3-U1 to M3-U6 | M3-U6: lens-word rule added |
| M4 Interpretation pipeline | M4-U1 to M4-U11 | M4-U10, M4-U11 (conversation questions) deferred |
| M5 Brief composer | M5-U1 to M5-U11 | — |
| M6 Judgement and scenario capture | M6-U1 to M6-U26 | M6-U3, M6-U5: refusal by the module function, including keyboard submit (B4). M6-U24 is the shipped F5 test; M6-U18 to M6-U23, M6-U25, M6-U26 deferred |
| M7 Readiness and maturity | M7-U1 to M7-U11 | — |
| M8 Decision log and replay | M8-U1 to M8-U10 | M8-U4: the two B5 phrases, and no "signals only" claim |
| M9 Honesty and provenance layer | M9-U1 to M9-U9 | M9-U1, M9-U5: F5 walked in its static state; M9-U6: maturity explanation labelled `ai-generated` |
| M10 UI shell and navigation | M10-U1 to M10-U9 | — |

## Gaps to close before G2

- [x] F1–F4 expanded into step-level specifications, F5 added, and the G2 decisions of 4 Oct 2026
  applied (Requirements Engineer, 5 Oct 2026)
- [x] G2 decisions of 5 Oct 2026 applied at Level 2: F5 ships as `F5-ST`; O-2 Trend Analyst with
  `ai-generated` labels; O-3 closed; Q-5 confirmed and O-4 closed; F-9 resolved and DM-11 not
  needed (Requirements Engineer, 5 Oct 2026)
- [x] Red-team findings B4, B5 and N2 applied at Level 2 and in this matrix (Requirements Engineer,
  5 Oct 2026)
- [x] `schemas/` populated and every module mapped to the entities it touches, including the sixth
  label, the per-practice maturity view and F5's contracts (Architect, 5 Oct 2026: A-11 to A-13)
- [x] F5 assigned to a module and its tests specified (Architect, 5 Oct 2026: M6, M6-U18 to M6-U26;
  interactive tests now deferred)
- [x] Unit tests specified for each of M1–M10 (Architect, 5 Oct 2026, in `04-module-design.md`)
- [x] Unit tests written for each of M1–M10 (Test Engineer, 5 Oct 2026, in `tests/unit/`)
- [ ] The Architect's 5 Oct revisions (M3-U6, M6-U3, M6-U5, M8-U4, M9-U1, M9-U5, M9-U6, the
  deferred interactive-F5 tests) carried into `04-module-design.md` (Architect) and then into
  `tests/unit/` and `test-plan.md` (Test Engineer)
- [x] Invariant audit 5 in `test-plan.md` updated to the six labels (Test Engineer, 5 Oct 2026)
- [x] Level 2 changes C-R4 to C-R7 from `03-architecture.md` section 13 applied (Requirements
  Engineer, 5 Oct 2026)
- [x] Q-5 outcome confirmed by Miguel (5 Oct 2026); DM-11 not needed (F-9 resolved)
- [ ] R7 exemption confirmed by Miguel at G2 (proposed by the Requirements Engineer, 5 Oct 2026)
- [ ] Category findings labelled `fictional` confirmed by Miguel at G2 (proposed default)
- [ ] OECD/WEF level names confirmed against p. 9, or `LEVEL_NAME_UNVERIFIED` still in place
  (Verifier before G3; Miguel sets the status)
