# Traceability matrix

Every requirement links to its functions, modules and tests. The Requirements Engineer and the
Architect keep this current; a change that leaves this matrix stale is an incomplete change.

Legend: R = user requirement (L1), F/NF = system requirement (L2), M = module (L4). Test
identifiers (for example M6-U1) are those in `04-module-design.md`. A test or test part marked
**D** has the status "Deferred (F5 static, decision of 5 Oct 2026)": it is specified for the
interactive F5, which is designed but not built, and is reported as skipped with that reason. The
earlier status Q is retired. Last updated 5 October 2026 by the Requirements Engineer, reconciled
with the final Levels 3 and 4 of that day: Miguel's G2 decisions of 4 and 5 October 2026 (including
the confirmed Q-5 outcome), the Red-team Reviewer's G2 findings, and C-R9. F5 is assigned to M6 and
**ships in this release as the static screen `F5-ST`**.

## Requirement → function → module → test

| R | Function | Modules | Verified by |
|---|---|---|---|
| R1 Attention budget | F2 | M5, M3 | Unit: no more than five signals (M5-U1, M1-U5); reading time at 200 words per minute within ten minutes (M5-U2); order by date, not importance (M5-U3); no signal distinguished, no relevance level (M5-U6, M5-U8); summaries and relevance notes free of C-6 terms and relevance levels, and relevance notes free of lens words, so they cannot prime the gut reading (M3-U6, N4) · Acceptance (G5), scored under K-1: the viewer picks the signal *they* judge worth discussing and says why within ten minutes; no designated answer |
| R2 Uneven augmentation | F1, F2, F5 (ships as `F5-ST`) | M3, M4, M6, M9 | Unit: machine steps labelled `ai-generated` and founder steps `yours` in F1 (M6-U17, M9-U1); `F5-ST` shows no input, no `ai-generated` or `yours` element and requests no conversation module (M6-U24, page part); `SCENARIO_FLOW` is `'static'` (M1-U15); no interactive F5 code is half-built (M10-U4) · Acceptance: viewer can say who did what in F1 and F2. **F5 ships as `F5-ST`, so R2's scenario method is described, not demonstrated, in this release** (Miguel, 5 Oct 2026). **D:** M6-U18 to M6-U23, M6-U25, M6-U26, the `scenarioMode` part of M6-U24 |
| R3 No ranking (non-negotiable) | F1 | M4, M6, M1 | Unit: no banned token in any schema property name, `required` entry or content key, including the extended N3 list on schema names (M1-U2); no numeric or boolean type (M1-U3); closed objects (M1-U4); no `score`/`rank` field (M4-U3); only allowlisted enumerations (M1-U5); exactly three peer readings (M4-U1, M1-U8); readings in a seeded random order, invariant under data order, identical templates (M6-U7); identical label markup on peers (M9-U5) · System: invariant audit 1 · Acceptance: no "best option" on any screen |
| R4 Questioning habits | F1 | M6, M4, M1 | Unit: readings neither in the page nor requested before the intuition record (M6-U1, M6-U2, M10-U4); `F1-E3` withholds failed readings (M6-U11); commit disabled without lens or rationale, and **refused at state level by `commitJudgement`**, leaving the stage unchanged (M6-U3, B4; M1-U10); **an intuition record without a lens refused at state level by `recordIntuition`** (M6-U5, B4); no pre-selection (M6-U4); answering primary, skipping secondary (M6-U16); questions, not advice (M4-U8, M4-U9) · System: invariant audits 2 and 3 |
| R5 Accumulated capability | F4 | M8 | Unit: every replay entry has a dated real outcome source (M8-U1); signals within 1 Jan to 31 Mar 2026 (M8-U2); judgement written before the outcome was attached (M8-U7); replay statement first, naming authors and dates, containing verbatim "the outcomes were withheld from the agents' inputs" and "the model's general knowledge extends to mid-2026 and may include some of these outcomes", and none of "signals only", "those signals only", "from those signals alone", "using only" (M8-U4, B5, C-R9); calibration note labelled `ai-generated` (M8-U9); no aggregate (M8-U5) · Review (G3): at least one judgement that did not hold; the Verifier's `outcomeVsCutoff` (`"before"` or `"after"` June 2026) on each replay entry's record in `pipeline/output/verification.json` (B5, F-3); calibration notes written by the Trend Analyst (O-2) · Acceptance: viewer sees a past judgement against what happened. K-5: F1 judgements do not appear in F4; revisit if G5 viewers miss them |
| R6 Complements | F3 | M7, M1, M9 | Unit: five readiness categories present (M7-U1); one level per practice, `LEVEL_NAME_UNVERIFIED` until verified (M7-U2, M7-U7, M1-U18); level names have one home (M1-U18); lower-level rule (M1-U20, M7-U10); next-level wording constraints (M7-U8, M7-U9); maturity explanations and next-level descriptions labelled `ai-generated` while level names stay under the profile's `fictional` label (M9-U6, M7-U8, M7-U10, M1-U20, M1-U6; B1, O-2) · Review (Verifier): level names on p. 9 of the WEF/OECD report; the three practices checked against the thesis (O-3 closed: they stay) · Category findings and level assignments labelled `fictional`, written in the dossier pass (confirmed by Miguel, 5 Oct 2026; `ai-generated` if an interpretive agent writes them instead) |
| R7 Role-aware model (designed, not built) | **None, by exemption (confirmed by Miguel, 5 Oct 2026)** | M1 | **Exemption.** R7's own L1 acceptance is "documented in the architecture only". It is designed, not built: `03-architecture.md` section 11 sets out the role-aware model, and `Judgement` and `LogEntry` carry an optional `role` field that nothing uses. A flow would need viewer roles, which the demo cannot have because it has no accounts and stores nothing (C-1). Acceptance is therefore met by documentation · Review: optional `role` field present; architecture section 11 present; governance screen lists the role-aware model as not implemented (F3, M7-U6) · Unit: no fixture or page code uses `role` (M8-U8) |
| R8 Open web by default | F3 (governance screen) | M7, M9, M1 | Unit: required items present; every item of both lists, implemented and not implemented, has a non-empty `verifiedBy` naming only non-deferred tests or audits (M7-U5, M7-U6, M1-U6; N5); argument paragraphs labelled `ai-generated`, lists `real` (M1-U17, M7-U5, M9-U6); `F3-E2` as a defence (M7-U11) · Review: governance screen states what is and is not implemented; argument written by the Architect from the Scout's frozen sources, every paragraph verified or struck (Q-5, confirmed 5 Oct 2026) · **N6, option (b), decided by Miguel 5 Oct 2026:** R8's acceptance rests on the two lists; if every argument paragraph is struck, the screen ships as `F3-S3a` (both lists and the fixed withheld-argument sentence, verbatim and unlabelled; no argument paragraph, no `ai-generated` element). The schema allows an empty `argument` and a test covers `F3-S3a` (M7-U11, as revised by the Architect at L4); `F3-E2` must not ship |

## Function → screen states → module → test

| F | States | Modules | Verified by |
|---|---|---|---|
| F1 Core loop | `F1-S0`, `F1-S0e`, `F1-S1` to `F1-S4`, `F1-E0`, `F1-E1`, `F1-E2`, `F1-E3` | M6, M4, M1, M9, M10 | Unit: M6-U1 to M6-U17 (`F1-E0`: M6-U15; Q-1: M6-U16; Q-2: M6-U7; B4 state-level refusal of commit and of an intuition record without a lens: M6-U3, M6-U5), M1-U8 to M1-U10, M1-U12 (`loadReveal` refusals), M4-U1 to M4-U9 · System: scripted walk, including an attempted keyboard submit with no lens or rationale |
| F2 Weekly brief | `F2-S0`, `F2-S1`, `F2-S2`, `F2-W1`, `F2-E1` | M5, M3, M9 | Unit: M5-U1 to M5-U11, M3-U1 to M3-U6 (M3-U6 with lens words in relevance notes, N4) · System: scripted walk · Acceptance: R1 scoring rule (K-1) |
| F3 Readiness, maturity, governance | `F3-S1`, `F3-S2`, `F3-S2v`, `F3-S3`, `F3-S3a`, `F3-E1`, `F3-E2` | M7, M1, M9 | Unit: M7-U1 to M7-U12, M1-U6, M1-U17, M1-U18, M1-U20, M9-U6 (explanation label: M9-U6, M7-U8, M7-U10; not-implemented `verifiedBy`: M7-U5, M7-U6, M1-U6; `F3-S3a` with an empty `argument`: M7-U11 as revised by the Architect, with the empty-argument case accepted by the schema) · Review: Verifier at G3 (level names, Trend Analyst text, governance argument) · Exit: `F3-S3` or `F3-S3a` satisfies the governance part; `F3-E2` must not ship (N6, option (b), Miguel 5 Oct 2026) |
| F4 Decision log with replay | `F4-S0`, `F4-S1`, `F4-W1`, `F4-E1` | M8, M9 | Unit: M8-U1 to M8-U10 (M8-U4 with the two B5 phrases, C-R9), M9-U6 · Review: K-7 conditions at G3, and `outcomeVsCutoff` per entry in `verification.json` (B5) |
| F5 Scenario work, **shipping as `F5-ST`** | Shipped: `F5-ST`, and `F1-E0` to `F1-E2` on the scenario route. Designed, not built: `F5-S0`, `F5-S1`, `F5-S2`, `F5-E2` | M6 (`screens/scenario.js`, rendering `F5-ST` only); M1 (`SCENARIO_FLOW`). Not built in this release: `assets/js/state/scenario.js` and `loadConversation` | Unit, this release: M6-U24 page part (`F5-ST`); M9-U1 and M9-U8 (walk including `F5-ST`); M9-U4 and M10-U5 (route); M6-U15 (`F1-E0` on the scenario route); M1-U15 (`SCENARIO_FLOW` is `'static'`); M10-U4 (`loadConversation` named nowhere, no `state/scenario.js`); M1-U9 ("no conversation module" branch for `data/`) · System: scripted walk showing `F5-ST` from `F1-S4`, with no input field, no `ai-generated` or `yours` element and no `data/conversation/` request. **D:** M6-U18 to M6-U23, M6-U25, M6-U26, M1-U19, M4-U10, M4-U11; the `loadConversation` part of M1-U12; the `scenarioMode` part of M6-U24; the validator half of the conversation and scenario-record mutants in M1-U6 (their schema half runs). M9-U1 and M9-U5 no longer cover `F5-S2` |
| Application-wide | `G-E1` (failed to start, with the `file://` sentence), `G-E2` (page not found) | M10 | Unit: M10-U3 (`G-E1`), M10-U5 (`G-E2`, routes including `#/scenario/<id>`), M10-U6 (per-screen failure) |

## Non-functional → module → test

| NF | Modules | Verified by |
|---|---|---|
| NF1 Static, no runtime network calls | M10, M1, M6 | Unit: static audit for network calls and storage (M10-U1, M10-U2); import graph, no data path outside the loader, no preload, no half-built interactive F5 (M10-U4); no storage in F1 (M6-U9); M6-U25 **D** · Integration: offline from a local server in Chromium and Firefox, F1 to F5 (F5 as `F5-ST`); from `file://`, Firefox works and Chromium shows `G-E1` with its `file://` sentence (DM-6) · System: invariant audit 6 · Tests run under Node (F-9, v24.21.0); no `fetch()` anywhere in the repository; DM-11 not needed |
| NF2 Provenance | M9, M3, M4, M7, M8, M1 | Unit: every claim resolves to a dated source (M1-U1, M3-U1, M3-U2, M4-U2, M4-U4, M8-U1); nothing ships without a `pass` verdict (M1-U16); quotes at most 15 words (M3-U4, M9-U7); report citations with page (M7-U8, M7-U9, M9-U3); replay statement makes no unverifiable "signals only" claim (M8-U4, B5) · Review: Verifier at G3, including `outcomeVsCutoff` per replay entry · System: invariant audit 4 |
| NF3 Honest labelling | M9, M6, M5, M8, M1 | Unit: every element carries a label from the six-value vocabulary, including `yours` on every viewer entry in F1 (M9-U1, M9-U2, M6-U17); `F5-ST` carries no content element (M6-U24, M9-U1); identical labels on peers (M9-U5); per-part labels, including `ai-generated` maturity explanations and next-level descriptions (M9-U6, M5-U11, M8-U9); interface copy unlabelled (M9-U8); `frozen` only on the brief (M9-U9). M6-U22 **D** · System: invariant audit 5, listing the six labels (`test-plan.md`, 5 Oct 2026) · Review: labels correct under C-5 |
| NF4 Core loop under 8 minutes | M10, M5, M6 | Acceptance: unaided walk, timed only for the core loop (Q-6), from first display of `F1-S1` to `F1-S4`; the entry screen is the weekly brief (DM-7) and time there is not counted |
| NF5 Responsive | M10 | Unit: M10-U8 at 360 × 640 and 390 × 844 portrait, 1280 × 800 and 1440 × 900 landscape (Q-7) · System: F1 to F5 (F5 as `F5-ST`) complete at the same four viewports |
| NF6 English interface | M10 | Unit: `<html lang="en">` (M10-U3) · Review: German-source coverage recorded as a future requirement |

## Unit tests by module

All ten modules have their paired test files in `tests/unit/` (`.test.mjs` for Node and
`.browser.mjs` for browser runners where needed), with the shared harness in `tests/lib/`. The
revisions the Architect specified on 5 October 2026 must be carried into those files by the Test
Engineer, with every **D** test or part skipped under the reason "Deferred (F5 static, decision of
5 Oct 2026)".

| Module | Tests | Revised 5 Oct 2026, and deferred (D) |
|---|---|---|
| M1 Data contracts | M1-U1 to M1-U20 | M1-U2: extended N3 tokens on schema names. M1-U6: B1 and N5 mutants; conversation and scenario-record mutants schema half only, validator half **D**. M1-U12: `loadConversation` part **D**. M1-U15: `SCENARIO_FLOW` must be `'static'`. M1-U19 **D**. The freeze driver is `pipeline/freeze.mjs` only (`pipeline/freeze.html` dropped, N8) |
| M2 Persona and scanning brief | M2-U1 to M2-U5 | — |
| M3 Scan pipeline | M3-U1 to M3-U6 | M3-U6: lens words in relevance notes (N4) |
| M4 Interpretation pipeline | M4-U1 to M4-U11 | M4-U10, M4-U11 **D** |
| M5 Brief composer | M5-U1 to M5-U11 | — |
| M6 Judgement and scenario capture | M6-U1 to M6-U26 | M6-U3, M6-U5: state-level refusal (B4). M6-U15: `loadConversation` dropped. M6-U24: page part built, `scenarioMode` part **D**. M6-U18 to M6-U23, M6-U25, M6-U26 **D**. `assets/js/state/scenario.js` not written |
| M7 Readiness and maturity | M7-U1 to M7-U12 | M7-U5, M7-U6: `verifiedBy` on both lists (N5). M7-U8, M7-U10: explanation as `ai-generated` text (B1). M7-U11: N6 note (`F3-E2` never ships). M7-U12 (new): `F3-S3a` with an empty `argument`, both lists and the withheld sentence verbatim. M1-U6: the empty-argument fixture is a valid sample |
| M8 Decision log and replay | M8-U1 to M8-U10 | M8-U4: the two B5 phrases and the forbidden phrases (C-R9) |
| M9 Honesty and provenance layer | M9-U1 to M9-U9 | M9-U1: walk includes `F5-ST`, not `F5-S2`. M9-U5: `F5-S2` questions dropped. M9-U6: explanation label `ai-generated`, level name stays `fictional` |
| M10 UI shell and navigation | M10-U1 to M10-U9 | M10-U4: `loadConversation` named nowhere and no `state/scenario.js` |

## Gaps

**G2 approved by Miguel on 5 October 2026**, on condition that N6 option (b) is applied (`gates.md`).

- [x] F1–F4 expanded into step-level specifications, F5 added, and the G2 decisions of 4 Oct 2026
  applied (Requirements Engineer, 5 Oct 2026)
- [x] G2 decisions of 5 Oct 2026 applied at Level 2: F5 ships as `F5-ST`; O-2 Trend Analyst with
  `ai-generated` labels; O-3 closed; Q-5 confirmed and O-4 closed; F-9 resolved and DM-11 not
  needed (Requirements Engineer, 5 Oct 2026)
- [x] Red-team findings B4, B5 and N2 applied at Level 2 and in this matrix (Requirements Engineer,
  5 Oct 2026); C-R9 applied (F4 step 1 holds the two phrases verbatim)
- [x] Level 3 and Level 4 revisions of 5 Oct 2026 committed (Architect), and this matrix reconciled
  with them
- [x] Unit tests written for each of M1–M10 (Test Engineer, in `tests/unit/`)
- [ ] The 5 Oct revisions and the **D** skips carried into `tests/unit/` and `test-plan.md` (Test
  Engineer). M6-U24 must quote the revised `F5-ST` sentence in Level 2
- [x] Level 2 changes C-R4 to C-R7 and C-R9 applied (Requirements Engineer, 5 Oct 2026)
- [x] Q-5 outcome confirmed by Miguel (5 Oct 2026); DM-11 not needed (F-9 resolved)
- [x] R7 exemption confirmed by Miguel (5 Oct 2026)
- [x] Category findings and level assignments labelled `fictional` confirmed by Miguel (5 Oct 2026)
- [x] N6 decided by Miguel (5 Oct 2026): option (b), not the no-go. Applied at Level 2 as `F3-S3a`
  (Requirements Engineer, 5 Oct 2026)
- [x] N6 option (b) applied at Levels 3 and 4 and in the governance schema (empty `argument`
  allowed), test M7-U12 specified (Architect, 5 Oct 2026). Open: M1-U6 and M7-U12 carried into `tests/unit/`
  (Test Engineer)
- [ ] OECD/WEF level names confirmed against p. 9, or `LEVEL_NAME_UNVERIFIED` still in place
  (Verifier before G3; Miguel sets the status)
