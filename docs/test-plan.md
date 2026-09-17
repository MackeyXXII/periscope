# Test plan — the right arm of the V

**Status: seeded. Owner: Test Engineer. Gate: G2.**

Each test level verifies its mirror on the left arm. Every test is written from the specification
before the corresponding artefact is built.

## Above unit level

| Test | Verifies | Method | Pass criterion |
|---|---|---|---|
| Integration | Level 3 architecture | Load frozen pipeline output into every screen | All fixtures validate against M1 and render without errors |
| System | Level 2 requirements | Scripted walk of F1 to F4; Red-team Reviewer audits invariants | Click path completes; nothing ranked; intuition captured first; everything sourced and labelled |
| Rehearsal (pre-acceptance) | Level 1 requirements | An agent reviews the demo as a Dynatrace hiring manager would | Findings fixed or consciously accepted before G5 |
| Acceptance (G5) | Level 1 requirements | Two to three people unfamiliar with the project walk the demo unaided | Within 8 minutes, each can state in one sentence what makes it different from a signal digest |

## Invariant audit — run at every gate from G3

A gate fails if any of these is false:

1. No `score`, `rank`, `confidence` or `priority` field exists in any schema, fixture or rendered
   element; no screen presents a "best option" or an ordered recommendation.
2. No AI reading is reachable in the DOM or in module state before the intuition step is recorded.
3. Commit is disabled until a rationale is present.
4. Every factual claim resolves to a dated source; no unverifiable claim survives.
5. Every element carries a label from `real` | `ai-generated` | `frozen` | `fictional` | `replay`.
6. No `fetch`, `XMLHttpRequest`, CDN link, remote font or remote image appears anywhere in the
   shipped files.

## Note on tooling

No package manager, so unit tests run as plain ES modules in the browser or under `node --test`
with no dependencies. Static checks (grep-level audits for forbidden fields and network calls) are
part of the system test, not an afterthought.
