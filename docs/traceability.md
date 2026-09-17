# Traceability matrix

Every requirement links to its functions, modules and tests. The Requirements Engineer and the
Architect keep this current; a change that leaves this matrix stale is an incomplete change.

Legend: R = user requirement (L1), F/NF = system requirement (L2), M = module (L4).

## Requirement → function → module → test

| R | Function | Modules | Verified by |
|---|---|---|---|
| R1 Attention budget | F2 | M5, M3 | Unit: signal cap and reading-time estimate · Acceptance: viewer finds the signal worth discussing in time |
| R2 Uneven augmentation | F1, F2 | M3, M4, M9 | System: labels distinguish machine steps from founder steps · Acceptance: viewer can say who did what |
| R3 No ranking (non-negotiable) | F1 | M4, M6, M1 | Unit: no `score`/`rank` field; exactly three peer readings · System: invariant audit 1 · Acceptance: no "best option" on any screen |
| R4 Questioning habits | F1 | M6, M4 | Unit: readings unreachable before intuition recorded; commit disabled without rationale · System: invariant audit 2 and 3 |
| R5 Accumulated capability | F4 | M8 | Unit: every replay entry has a dated real outcome source · Acceptance: viewer sees a past judgement against what happened |
| R6 Complements | F3 | M7 | Unit: five readiness categories present; level names match the verified report |
| R7 Role-aware model (designed, not built) | — | M1 | Review: optional `role` field on `Judgement` and `LogEntry`; architecture paragraph present |
| R8 Open web by default | F3 (governance screen) | M7, M9 | Review: governance screen states what is and is not implemented |

## Non-functional → module → test

| NF | Modules | Verified by |
|---|---|---|
| NF1 Static, no runtime network calls | M10, M1 | Unit: static audit for `fetch`, `XMLHttpRequest`, CDN, remote font, remote image · Integration: renders from `file://` |
| NF2 Provenance | M9, M3 | Unit: every claim resolves to a dated source · System: invariant audit 4 |
| NF3 Honest labelling | M9 | Unit: every element carries a label from the vocabulary · System: invariant audit 5 |
| NF4 Core loop under 8 minutes | M10, M5, M6 | Acceptance: unaided walk within the time budget |
| NF5 Responsive | M10 | System: click path completes at phone and laptop widths |
| NF6 English interface | M10 | Review: German-source coverage recorded as a future requirement |

## Gaps to close before G2

- [ ] F1–F4 expanded into step-level specifications (Requirements Engineer)
- [ ] `schemas/` populated and every module mapped to the entities it touches (Architect)
- [ ] Unit test written for each of M1–M10 (Test Engineer)
- [ ] OECD/WEF level names confirmed, or `LEVEL_NAME_UNVERIFIED` still in place (Miguel)
