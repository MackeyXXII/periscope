# G2 decision pack — for Miguel, 5 October 2026

This is everything you need to decide Gate G2. G2 covers Level 2 (system requirements), Level 3
(architecture and data contracts), Level 4 (module design) and the test plan. Reading this page
and answering the four questions in section 2 should take about fifteen minutes. The optional
spot-checks in section 3 take another twenty.

Gates are decided by you in claude.ai chat. Paste your answers there (or here in Claude Code), and
the Orchestrator records them in `gates.md` and starts Level 5 and the G3 content work.

## 1. Where things stand

**All of your decisions are applied.** Those of 4 October (K-1 to Q-7, D-1, DM-1 to DM-10) and of
5 October (Q-5 confirmed, O-2 to the Trend Analyst, O-3 kept, Node installed, F5 static) are written
into L2, L3, L4, the schemas, the tests and `traceability.md`.

**The Red-team Reviewer blocked the first version** with five findings. All five are fixed:

| Finding | What was wrong | What was done |
|---|---|---|
| B1 | The maturity explanations, now written by the Trend Analyst, were still labelled `fictional` | They are `ai-generated` in the schema, the label table and the tests; each practice's level assignment stays `fictional` |
| B2 | Your 4 and 5 Oct decisions were not yet in the documents; interactive F5 was still required | Applied everywhere. Interactive F5 is designed, not built: its tests are kept with status D, "Deferred (F5 static, decision of 5 Oct 2026)" |
| B3 | One test failed for an undocumented reason (a hidden placeholder file) | The test ignores dot-files, as the spec says |
| B4 | "No commit without a rationale" relied only on a disabled button | The state functions now refuse an incomplete intuition or judgement, whatever the path (Enter key, form submit, direct call); tests cover it |
| B5 | The replay statement claimed the judgements used "those signals only", which cannot be verified: the model's knowledge reaches June 2026 | Reworded honestly (below); the Verifier records for each replay entry whether its outcome predates June 2026 |

Eight non-blocking findings (N1 to N8) were also applied. They include a wider list of banned
ranking words, a lens-word check on signal relevance notes, and a named test behind every "not
implemented" claim on the governance screen. The browser-only freeze page was dropped now that
Node is installed.

**Tests.** `node --test` runs 137 tests: 50 pass, 38 fail and 49 are skipped. Every failure is the
test-first rule at work: the module under test is not written yet, or the content briefs have not
been delivered. Each one is listed with its cause in `test-plan.md`, and the list matches the run
exactly. Of the skips, 37 wait for G3 content in `data/` and 12 are the deferred F5 tests.

**Red-team re-check: sign-off with conditions.** The reviewer confirmed all five blocking
findings fixed, the non-blocking ones applied, and every test failure documented. It found no
ranking field, no runtime network call and no wording about Dynatrace beyond verifiable fact. Its
only conditions are the three decisions below. It noted two loose ends:

- Some process prose still said "signals only". This is now fixed.
- The browser test runner has not been re-run since this revision. It will be run before G4.

## 2. What you decide

### Decision 1 — R7 has no flow, by exemption

R7 (the role-aware model) is designed but not built. Its own L1 acceptance test is "documented in
the architecture only". The standing G2 rule says every R needs an F, so R7 needs an explicit
exemption.

- **Proposed:** confirm the exemption. R7 is met by architecture section 11 and the unused optional
  `role` field. The governance screen lists the role-aware model as not implemented.
- **If you decline:** R7 is an open gap and G2 cannot pass without a new flow.

### Decision 2 — Who writes the readiness findings and level assignments, and their label

Each of the five readiness categories shows Tracewell's answers and a short prose finding, and
each of the three practices shows the level Tracewell sits at. No agent owned the findings, and no
document says who assigns the levels.

- **Proposed:** both are part of the persona dossier, written in the dossier pass in Claude Code on
  5–6 Oct. Levels are assigned there by the thesis rule (D-1: per practice, the lower level when
  between two). Both describe the fictional company and are labelled `fictional`, as Tracewell's
  answers already are.
- **Condition the Red-team attached:** this holds only if they really are dossier content. If the
  Trend Analyst or another interpretive agent writes or assigns them, they are machine judgements
  and must be labelled `ai-generated`, by the same logic as B1.
- **Alternative:** label both `ai-generated` now, by their machine author. This is the stricter
  reading of DM-2 ("the label states origin") and a one-line schema change for each.

### Decision 3 — If the governance argument is struck entirely

Under the Q-5 outcome, the Verifier may strike every paragraph of the governance argument,
including the one-paragraph fallback. The schema requires at least one paragraph, and the error
state `F3-E2` must never ship.

- **Proposed:** in that case G4 is a no-go for that content, and you decide what ships. Nothing is
  softened to make it pass.

### Decision 4 — Approve G2

- **Approve:** Level 5 (implementation) and the G3 content work start at once.
- **Approve with conditions:** name them, and they are tracked in `gates.md`.
- **Reject:** name what must change.

### Already settled, for the record

- **F5-ST wording.** The static scenario screen now ends: "In this build the scenario step is
  described only: there is nothing to write here, and no conversation questions were prepared for
  this release." The old sentence implied that questions existed and were being held back.
- **Replay statement (B5).** F4 must now say "the outcomes were withheld from the agents' inputs"
  and "the model's general knowledge extends to mid-2026 and may include some of these outcomes".
  This is more honest, and it may make the replay look weaker to a viewer. If you prefer different
  wording, say so now; the test quotes these phrases.
- **Level names (D-1).** The three names you gave match the thesis word for word. They stay behind
  `LEVEL_NAME_UNVERIFIED` until the report itself is checked, which `CLAUDE.md` requires. If you
  have opened p. 9 yourself, you can say so at G3, and that counts as the check.

## 3. Optional spot-checks (about 20 minutes)

If you want to see the substance rather than take the agents' word for it:

1. `docs/02-system-requirements.md`, **F4 step 1**: read the replay statement as a hiring manager
   would.
2. `docs/02-system-requirements.md`, **F5 states table**: check that `F5-ST` reads as an honest
   description, not a dead end.
3. `docs/03-architecture.md`, **section 5.3** (label table): every element has one of the six
   labels, and it states origin.
4. `docs/traceability.md`: every R row has at least one F, apart from R7 by exemption.
5. Run the tests yourself, in a fresh terminal (a new terminal picks up Node):

   ```
   node --test
   ```

## 4. What happens after G2, and when you are needed again

| When | Work | Your part |
|---|---|---|
| 5 Oct evening to 6 Oct morning | Persona dossier, scanning brief and replay candidates. Runtime agents' instructions updated. Pipeline run once: Scout, Trend Analyst, Rival Readers, Interrogator, Verifier, Brief Editor, Trend Analyst second pass. M1, M9 and the M10 shell built in parallel | None until G3 |
| 6 Oct morning — **G3** | Red-team review of the frozen content | Decide G3. Set the D-1 level names to `verified` if p. 9 was confirmed. Accept or strike the governance argument, with a reason |
| 6 Oct | M5 to M8 built, tests first; integration and system tests at the four viewports; Red-team audit | At midday: if the build is behind, F3 and F4 ship static |
| 6 Oct evening — **G4** | Deploy | **Push `main` yourself.** Agents are not allowed to push. Then check GitHub Pages |
| 7 Oct morning — G5 starts | Rehearsal walk as a hiring manager; final fixes | Walk the demo once yourself |

**Usage.** Everything runs on Opus 5.5. If a usage limit approaches, work stops at the next
artefact boundary, commits and resumes in the next window. The pipeline run on the night of 5 Oct is
the heaviest step. If it cannot finish before the window closes, G3 slips to midday on 6 Oct and the
static-screen fallback for F3 and F4 becomes likely.
