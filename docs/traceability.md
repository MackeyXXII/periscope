# Traceability matrix

Every requirement links to its functions, modules and tests. The Requirements Engineer and the
Architect keep this current; a change that leaves this matrix stale is an incomplete change.

Legend: R = user requirement (L1), F/NF = system requirement (L2), M = module (L4). Test
identifiers (for example M6-U1) are those in `04-module-design.md`. Last updated 5 October 2026,
applying Miguel's G2 decisions of 4 October 2026.

## Requirement → function → module → test

| R | Function | Modules | Verified by |
|---|---|---|---|
| R1 Attention budget | F2 | M5, M3 | Unit: no more than five signals (M5-U1); reading time at 200 words per minute within ten minutes (M5-U2); no signal distinguished (M5-U6, M5-U8) · Acceptance (G5), scored under K-1: the viewer picks the signal *they* judge worth discussing and says why within ten minutes; no designated answer |
| R2 Uneven augmentation | F1, F2, F5 | M3, M4, M9; F5: to be assigned by the Architect | System: labels distinguish machine steps (`ai-generated`) from founder steps (`yours`) in F1 and F5 · F5 exit criteria: no conversation question before the scenario is recorded; viewer text and questions in separate regions · Acceptance: viewer can say who did what. If F5 ships as `F5-ST`, R2's scenario method is described, not demonstrated |
| R3 No ranking (non-negotiable) | F1 | M4, M6, M1 | Unit: no `score`/`rank` field (M1-U2, M4-U3); exactly three peer readings (M4-U1, M1-U8); readings in a seeded random order with identical templates (M6-U7, to be revised under Q-2) · System: invariant audit 1 · Acceptance: no "best option" on any screen |
| R4 Questioning habits | F1 | M6, M4, M1 | Unit: readings neither in the page nor requested before the intuition record (M6-U1, M6-U2, M10-U4); `F1-E3` withholds failed readings (M6-U11); commit disabled without rationale (M6-U3, M1-U10); answering primary, skipping secondary (Q-1, test to be added) · System: invariant audits 2 and 3 |
| R5 Accumulated capability | F4 | M8 | Unit: every replay entry has a dated real outcome source (M8-U1); signals within 1 Jan to 31 Mar 2026 (M8-U2); judgement written after its as-of date and after the outcome (M8-U7); replay statement names authors and dates (M8-U4) · Review (G3): at least one judgement that did not hold · Acceptance: viewer sees a past judgement against what happened. K-5: F1 judgements do not appear in F4; revisit if G5 viewers miss them |
| R6 Complements | F3 | M7 | Unit: five readiness categories present (M7-U1); `LEVEL_NAME_UNVERIFIED` until verified, one level per practice; next-level wording constraints (M7-U7, to be revised under K-2) · Review (Verifier): level names on p. 9 of the WEF/OECD report, list of practices |
| R7 Role-aware model (designed, not built) | — | M1 | Review: optional `role` field on `Judgement` and `LogEntry`; architecture paragraph present · Unit: no fixture or page code uses it (M8-U8) |
| R8 Open web by default | F3 (governance screen) | M7, M9 | Unit: required items present and each implemented item names its test (M7-U5, M7-U6) · Review: governance screen states what is and is not implemented; author decided under Q-5 (`gates.md`) |

## Function → screen states → module → test

| F | States | Modules | Verified by |
|---|---|---|---|
| F1 Core loop | `F1-S0`, `F1-S0e`, `F1-S1` to `F1-S4`, `F1-E0` (trend data not loaded), `F1-E1`, `F1-E2`, `F1-E3` (readings withheld) | M6, M4, M1, M9, M10 | Unit: M6-U1 to M6-U14, M1-U8 to M1-U10, M1-U12; `F1-E0` test to be added · System: scripted walk |
| F2 Weekly brief | `F2-S0`, `F2-S1`, `F2-S2`, `F2-W1`, `F2-E1` | M5, M3, M9 | Unit: M5-U1 to M5-U8, M3-U1 to M3-U6 · System: scripted walk · Acceptance: R1 scoring rule (K-1) |
| F3 Readiness, maturity, governance | `F3-S1`, `F3-S2`, `F3-S2v`, `F3-S3`, `F3-E1`, `F3-E2` | M7, M9 | Unit: M7-U1 to M7-U7 · Review: Verifier at G3 |
| F4 Decision log with replay | `F4-S0`, `F4-S1`, `F4-W1`, `F4-E1` | M8, M9 | Unit: M8-U1 to M8-U8, M9-U6 · Review: K-7 conditions at G3 |
| F5 Scenario work from the founder's own conversations | `F5-S0`, `F5-S1`, `F5-S2`, `F5-E2`, `F5-ST` (static fallback) | To be assigned by the Architect (A-11) | To be assigned by the Architect; F5's exit criteria in `02-system-requirements.md` are the test basis |
| Application-wide | `G-E1` (failed to start, with the `file://` sentence), `G-E2` (page not found) | M10 | Unit: M10-U3 (`G-E1`), M10-U5 (`G-E2`), M10-U6 (per-screen failure) |

## Non-functional → module → test

| NF | Modules | Verified by |
|---|---|---|
| NF1 Static, no runtime network calls | M10, M1 | Unit: static audit for network calls and storage (M10-U1, M10-U2) · Integration: offline from a local server in Chromium and Firefox; from `file://`, Firefox works and Chromium shows `G-E1` with its `file://` sentence (DM-6) · System: invariant audit 6 |
| NF2 Provenance | M9, M3, M4, M7, M8 | Unit: every claim resolves to a dated source; quotes at most 15 words (M3-U4, M9-U3, M9-U7) · Review: Verifier at G3 · System: invariant audit 4 |
| NF3 Honest labelling | M9, M6 | Unit: every element carries a label from the six-value vocabulary, including `yours` on every viewer entry in F1 and F5; identical labels on peers; per-part labels (M9-U1, M9-U2, M9-U5, M9-U6) · System: invariant audit 5 (to be updated to six labels) · Review: labels correct under C-5 |
| NF4 Core loop under 8 minutes | M10, M5, M6 | Acceptance: unaided walk, timed only for the core loop (Q-6), from first display of `F1-S1` to `F1-S4`; the entry screen is the weekly brief (DM-7) and time there is not counted |
| NF5 Responsive | M10 | System: F1 to F5 complete at 360 × 640 and 390 × 844 portrait, 1280 × 800 and 1440 × 900 landscape (Q-7) · Unit: M10-U8 (to be revised to the four viewports) |
| NF6 English interface | M10 | Unit: `<html lang="en">` (M10-U3) · Review: German-source coverage recorded as a future requirement |

## Gaps to close before G2

- [x] F1–F4 expanded into step-level specifications, F5 added, and the G2 decisions of 4 Oct 2026
  applied (Requirements Engineer, 5 Oct 2026)
- [ ] `schemas/` populated and every module mapped to the entities it touches, including the sixth
  label, the per-practice maturity view and F5's contracts (Architect: A-11 to A-13)
- [ ] F5 assigned to a module and its tests (Architect, then Test Engineer)
- [ ] Unit test written for each of M1–M10, including the revisions listed in A-14 (Test Engineer)
- [ ] OECD/WEF level names confirmed against p. 9, or `LEVEL_NAME_UNVERIFIED` still in place
  (Verifier before G3; Miguel sets the status)
