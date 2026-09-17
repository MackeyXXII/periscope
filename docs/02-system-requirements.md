# Level 2 — System requirements

**Status: seeded from the approved build plan. Owner: Requirements Engineer. Gate: G2.**

Four demo flows, in priority order, plus six non-functional requirements. If budget runs short,
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

## What the Requirements Engineer adds at this level

For each of F1 to F4, expand the table row into: preconditions, the step-by-step interaction, the
data each step reads and writes, the screen states (including empty and error states), and the
explicit exit criterion. For each NF, state how it is verified and by which test. Then update
`traceability.md` so every R has at least one F, and every F at least one test.

State any conflict between a flow and an invariant in `CLAUDE.md` rather than resolving it.
