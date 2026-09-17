# Level 4 — Module design

**Status: seeded. Owner: Architect (design) and Test Engineer (paired unit tests). Gate: G2.**

Ten modules implement the four flows. Each unit test is written by the Test Engineer **before**
the Implementer starts that module.

| Module | Purpose | Unit tests |
|---|---|---|
| M1 Data contracts | Schemas every agent writes to and the UI reads from | All fixtures validate against the schemas |
| M2 Persona and scanning brief | Scenario ground truth | Every named competitor and regulation is real and dated |
| M3 Scan pipeline | Scout output into signals | Every signal has a URL, a date and a summary |
| M4 Interpretation pipeline | Trends into rival readings and interrogation | Exactly three readings per trend; each has a disconfirming condition; no `score` or `rank` field exists |
| M5 Brief composer | R1 attention budget | Signal count within the cap; estimated reading time 10 minutes or less |
| M6 Judgement capture | Intuition first, then commit | AI readings stay hidden until intuition is recorded; commit disabled without a rationale |
| M7 Readiness and maturity | F3 | All five readiness categories present; level names match the verified report |
| M8 Decision log and replay | F4 | Every replay entry carries a dated, real outcome source |
| M9 Honesty and provenance layer | NF2 and NF3 | Every AI-generated, fictional or replayed element carries its label |
| M10 UI shell and navigation | Click path across F1 to F4 | No external network requests at runtime |

For each module the Architect states: its inputs, its outputs, the entities it touches, the
modules it may depend on, and the single invariant it is most at risk of violating.
