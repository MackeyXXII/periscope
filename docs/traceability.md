# Traceability matrix

Every requirement links to its functions, modules and tests. The Requirements Engineer and the
Architect keep this current; a change that leaves this matrix stale is an incomplete change.

Legend: R = user requirement (L1), F/NF = system requirement (L2), M = module (L4). Test
identifiers (for example M6-U1) are those in `04-module-design.md`. Last updated 5 October 2026 by
the Architect, applying Miguel's G2 decisions of 4 October 2026, the Q-5 debate outcome of 5 October
2026 (pending Miguel's confirmation) and the revised Levels 3 and 4. F5 is assigned to M6.

## Requirement → function → module → test

| R | Function | Modules | Verified by |
|---|---|---|---|
| R1 Attention budget | F2 | M5, M3 | Unit: no more than five signals (M5-U1, M1-U5); reading time at 200 words per minute within ten minutes (M5-U2); order by date, not importance (M5-U3); no signal distinguished, no relevance level (M5-U6, M5-U8, M3-U6) · Acceptance (G5), scored under K-1: the viewer picks the signal *they* judge worth discussing and says why within ten minutes; no designated answer |
| R2 Uneven augmentation | F1, F2, F5 | M3, M4, M6, M9 | Unit: machine steps labelled `ai-generated` and founder steps `yours` in F1 and F5 (M6-U17, M6-U22, M9-U1); no conversation question in the page or loaded before the scenario is recorded (M6-U20); viewer text and questions in separately headed regions (M6-U22); static fallback shows no machine content (M6-U24) · Acceptance: viewer can say who did what. If F5 ships as `F5-ST`, R2's scenario method is described, not demonstrated |
| R3 No ranking (non-negotiable) | F1 | M4, M6, M1 | Unit: no `score`/`rank` field or numeric type (M1-U2, M1-U3, M1-U4, M4-U3); only allowlisted enumerations (M1-U5); exactly three peer readings (M4-U1, M1-U8); readings in a seeded random order, invariant under data order, identical templates (M6-U7); identical label markup on peers (M9-U5) · System: invariant audit 1 · Acceptance: no "best option" on any screen |
| R4 Questioning habits | F1 | M6, M4, M1 | Unit: readings neither in the page nor requested before the intuition record (M6-U1, M6-U2, M10-U4); `F1-E3` withholds failed readings (M6-U11); commit disabled without rationale (M6-U3, M1-U10); answering primary, skipping secondary (M6-U16); questions, not advice (M4-U8, M4-U9) · System: invariant audits 2 and 3 |
| R5 Accumulated capability | F4 | M8 | Unit: every replay entry has a dated real outcome source (M8-U1); signals within 1 Jan to 31 Mar 2026 (M8-U2); judgement written before the outcome was attached (M8-U7); replay statement names authors and dates (M8-U4); calibration note labelled `ai-generated` (M8-U9); no aggregate (M8-U5) · Review (G3): at least one judgement that did not hold · Acceptance: viewer sees a past judgement against what happened. K-5: F1 judgements do not appear in F4; revisit if G5 viewers miss them |
| R6 Complements | F3 | M7, M1 | Unit: five readiness categories present (M7-U1); one level per practice, `LEVEL_NAME_UNVERIFIED` until verified (M7-U2, M7-U7, M1-U18); level names have one home (M1-U18); lower-level rule (M1-U20, M7-U10); next-level wording constraints (M7-U8, M7-U9) · Review (Verifier): level names on p. 9 of the WEF/OECD report; list of practices (O-3) |
| R7 Role-aware model (designed, not built) | — | M1 | Review: optional `role` field on `Judgement` and `LogEntry`; architecture section 11 present · Unit: no fixture or page code uses it (M8-U8) |
| R8 Open web by default | F3 (governance screen) | M7, M9, M1 | Unit: required items present and each implemented item names its test (M7-U5, M7-U6); argument paragraphs labelled `ai-generated`, lists `real` (M1-U17, M7-U5, M9-U6) · Review: governance screen states what is and is not implemented; argument drafted by the Architect from the Scout's frozen sources, every paragraph verified or struck (Q-5, `gates.md`) |

## Function → screen states → module → test

| F | States | Modules | Verified by |
|---|---|---|---|
| F1 Core loop | `F1-S0`, `F1-S0e`, `F1-S1` to `F1-S4`, `F1-E0`, `F1-E1`, `F1-E2`, `F1-E3` | M6, M4, M1, M9, M10 | Unit: M6-U1 to M6-U17 (`F1-E0`: M6-U15; Q-1: M6-U16; Q-2: M6-U7), M1-U8 to M1-U10, M1-U12, M4-U1 to M4-U9 · System: scripted walk |
| F2 Weekly brief | `F2-S0`, `F2-S1`, `F2-S2`, `F2-W1`, `F2-E1` | M5, M3, M9 | Unit: M5-U1 to M5-U11, M3-U1 to M3-U6 · System: scripted walk · Acceptance: R1 scoring rule (K-1) |
| F3 Readiness, maturity, governance | `F3-S1`, `F3-S2`, `F3-S2v`, `F3-S3`, `F3-E1`, `F3-E2` | M7, M1, M9 | Unit: M7-U1 to M7-U11, M1-U17, M1-U18, M1-U20 · Review: Verifier at G3 |
| F4 Decision log with replay | `F4-S0`, `F4-S1`, `F4-W1`, `F4-E1` | M8, M9 | Unit: M8-U1 to M8-U10, M9-U6 · Review: K-7 conditions at G3 |
| F5 Scenario work from the founder's own conversations | `F5-S0`, `F5-S1`, `F5-S2`, `F5-E2`, `F5-ST` (static fallback) | M6 (screen, state, gate), M4 (conversation questions), M1 (contracts `ConversationQuestions`, `ScenarioRecord`; `loadConversation`) | Unit: M6-U18 to M6-U26 (`F5-ST`: M6-U24), M1-U6, M1-U9, M1-U12, M1-U19, M4-U8, M4-U10, M4-U11 · System: scripted walk, including no `data/conversation/` request in `F5-S1` |
| Application-wide | `G-E1` (failed to start, with the `file://` sentence), `G-E2` (page not found) | M10 | Unit: M10-U3 (`G-E1`), M10-U5 (`G-E2`, routes including `#/scenario/<id>`), M10-U6 (per-screen failure) |

## Non-functional → module → test

| NF | Modules | Verified by |
|---|---|---|
| NF1 Static, no runtime network calls | M10, M1, M6 | Unit: static audit for network calls and storage (M10-U1, M10-U2); no data path outside the loader, no preload (M10-U4); no storage in F1 and F5 (M6-U9, M6-U25) · Integration: offline from a local server in Chromium and Firefox, F1 to F5; from `file://`, Firefox works and Chromium shows `G-E1` with its `file://` sentence (DM-6) · System: invariant audit 6 |
| NF2 Provenance | M9, M3, M4, M7, M8, M1 | Unit: every claim resolves to a dated source (M1-U1, M3-U1, M3-U2, M4-U2, M4-U4, M8-U1); nothing ships without a `pass` verdict (M1-U16); quotes at most 15 words (M3-U4, M9-U7); report citations with page (M7-U8, M7-U9, M9-U3) · Review: Verifier at G3 · System: invariant audit 4 |
| NF3 Honest labelling | M9, M6, M5, M8, M1 | Unit: every element carries a label from the six-value vocabulary, including `yours` on every viewer entry in F1 and F5 (M9-U1, M9-U2, M6-U17, M6-U22); identical labels on peers (M9-U5); per-part labels (M9-U6, M5-U11, M8-U9); interface copy unlabelled (M9-U8); `frozen` only on the brief (M9-U9) · System: invariant audit 5 (to be updated to six labels by the Test Engineer) · Review: labels correct under C-5 |
| NF4 Core loop under 8 minutes | M10, M5, M6 | Acceptance: unaided walk, timed only for the core loop (Q-6), from first display of `F1-S1` to `F1-S4`; the entry screen is the weekly brief (DM-7) and time there is not counted |
| NF5 Responsive | M10 | Unit: M10-U8 at 360 × 640 and 390 × 844 portrait, 1280 × 800 and 1440 × 900 landscape (Q-7) · System: F1 to F5 complete at the same four viewports |
| NF6 English interface | M10 | Unit: `<html lang="en">` (M10-U3) · Review: German-source coverage recorded as a future requirement |

## Unit tests by module

| Module | Tests |
|---|---|
| M1 Data contracts | M1-U1 to M1-U20 (new on 5 Oct 2026: M1-U14 to M1-U20; M1-U13 split into U13 and U14) |
| M2 Persona and scanning brief | M2-U1 to M2-U5 |
| M3 Scan pipeline | M3-U1 to M3-U6 |
| M4 Interpretation pipeline | M4-U1 to M4-U11 (new: M4-U10, M4-U11; M4-U8 revised) |
| M5 Brief composer | M5-U1 to M5-U11 (new: M5-U9 to M5-U11) |
| M6 Judgement and scenario capture | M6-U1 to M6-U26 (F1: U1 to U17, new U15 to U17, U7 revised for Q-2; F5: U18 to U26) |
| M7 Readiness and maturity | M7-U1 to M7-U11 (U1, U2, U7 revised; new U8 to U11) |
| M8 Decision log and replay | M8-U1 to M8-U10 (U4, U7 revised; new U9, U10) |
| M9 Honesty and provenance layer | M9-U1 to M9-U9 (U1, U2, U4 revised; new U8, U9) |
| M10 UI shell and navigation | M10-U1 to M10-U9 (U3 to U5, U7, U8 revised; new U9) |

## Gaps to close before G2

- [x] F1–F4 expanded into step-level specifications, F5 added, and the G2 decisions of 4 Oct 2026
  applied (Requirements Engineer, 5 Oct 2026)
- [x] `schemas/` populated and every module mapped to the entities it touches, including the sixth
  label, the per-practice maturity view and F5's contracts (Architect, 5 Oct 2026: A-11 to A-13)
- [x] F5 assigned to a module and its tests specified (Architect, 5 Oct 2026: M6, M6-U18 to M6-U26)
- [x] Unit tests specified for each of M1–M10, including the revisions listed in A-14 (Architect,
  5 Oct 2026, in `04-module-design.md`)
- [ ] Unit tests written for each of M1–M10 (Test Engineer)
- [ ] Invariant audit 5 in `test-plan.md` updated to the six labels (Test Engineer)
- [ ] Level 2 changes C-R4 to C-R7 from `03-architecture.md` section 13 applied (Requirements
  Engineer)
- [ ] Q-5 outcome confirmed by Miguel; DM-11 (test tooling may read files by same-origin requests)
  decided by Miguel
- [ ] OECD/WEF level names confirmed against p. 9, or `LEVEL_NAME_UNVERIFIED` still in place
  (Verifier before G3; Miguel sets the status)
