# Gate log

Gates are decided by Miguel in claude.ai chat, in the Internships and Applications project. Agents
propose; the Red-team Reviewer may block; Miguel approves. Record every outcome here, with a date.

| Gate | Covers | Target date | Outcome | What has to happen now |
|---|---|---|---|---|
| G1 | Level 1 user requirements R1–R8 and the four working assumptions | 16 Sept 2026 | **Approved** | Nothing. L1 is frozen. |
| G2 | Level 2 system requirements, Level 3 architecture, Level 4 module design, test plan | 5 Oct 2026 | **Approved, 5 Oct 2026**, by Miguel in chat, after Red-team sign-off with conditions; all three conditions decided (below) | Apply the N6 option (b) change to L2, L3, L4, the governance schema and its tests; then Level 5 and the G3 content work run. |
| G3 | Content freeze: runtime pipeline output verified and frozen into `data/` | 6 Oct 2026, morning; re-planned to 7 Oct, early morning | **Approved, 6 Oct 2026 (late evening)**, by Miguel, after Red-team sign-off with conditions; decisions below | Content frozen into `data/` (frozen on 6 Oct). Miguel pushes `main`. Next: the verified-maturity pass (D-1 below), then G4 checks. |
| G4 | System test pass at the four Q-7 viewports, Red-team audit, deploy to GitHub Pages | 6 Oct 2026, evening; re-planned to 7 Oct, push by about 11:00 | Not started | After G3: build M5 to M8 tests-first, then integration and system tests. Miguel pushes to `main`, because agents may not push. |
| G5 | Acceptance by real viewers | From 7 Oct 2026 (Wels career fair, 7 and 8 Oct) | Not started | A rehearsal walk as a hiring manager on the morning of 7 Oct, then two to three unfamiliar viewers. |

If the build is behind at midday on 6 Oct, F3 and F4 ship as static screens; F5 is static already
(decision of 5 Oct); F1 and F2 stay fully interactive.

## Standing entry requirements for G2

- Every R has at least one F; every F has at least one module and one test.
- Data contracts exist as JSON Schema in `schemas/` and contain no ranking field.
- `traceability.md` is complete and matches the documents.
- Red-team Reviewer has signed off or recorded a blocking finding.

## G2 decisions, 4 October 2026

Miguel decided the following in chat on 4 October 2026. They are binding on Levels 2 to 4 and are
to be written into the documents, and into `traceability.md`, before G2 is recorded as approved.

| Item | Decision |
|---|---|
| K-1 | The viewer chooses which signal is worth discussing. R1's acceptance test is scored as: the viewer picks the signal *they* judge worth discussing and can say why, within the time budget. F2 designates no signal. R1 stays frozen. |
| K-2 | The "next complement" is sourced to the maturity framework: it is shown as what the WEF/OECD model describes for the next level, cited to the report, and never as the tool's advice. F3 step 3 is unblocked. |
| K-5 | No. A judgement committed in F1 does not appear in F4. Revisit only if acceptance viewers miss it. |
| K-6 | A flow is added for R2's scenario work, structured around the founder's own external conversations. The Requirements Engineer specifies it as F5; it must respect every invariant (no ranking, intuition first, viewer text labelled, no live AI). If time runs short it ships as a static screen, like F3 and F4. |
| Q-1 | Interrogation answers stay optional and gate nothing, but answering is the primary, visually dominant action; skipping is a secondary, less prominent control. |
| Q-2 | The three readings appear in a random order per session. Tests inject a fixed seed so they stay repeatable. |
| Q-5 | Who writes the governance screen's argument is decided by a structured debate between agents (or the LLM council) before G3; the outcome and its reasoning are recorded here. Every regulatory claim still passes the Verifier. |
| Q-6 | NF4's eight minutes time only the core loop: from opening a trend card to a committed judgement. |
| Q-7 | The demo is optimised for two orientations: phone in portrait and desktop or laptop in landscape. Test viewports: 360×640 and 390×844 portrait; 1280×800 and 1440×900 landscape. |
| D-1 | Resolved from the thesis (Chapter 3, section 3.2, draft of 29 Sept 2026). Report: World Economic Forum and OECD (2025), *AI in strategic foresight: Reshaping anticipatory governance*, https://doi.org/10.1787/aa573076-en. Level names, p. 9: "AI for analysis augmentation", "AI as creative sparring partner", "AI integrated and customized into workflow". The Verifier re-opens p. 9 before G3; then these names replace `LEVEL_NAME_UNVERIFIED`. The thesis also assigns a level per foresight practice rather than per venture, and the lower level when an account falls between two; F3 should follow the same rule. |
| DM-8 | Supported by the thesis (Appendix A, adapted from Jöhnk et al., 2021): the five categories are strategic alignment, resources, knowledge, culture and data, so the schema keys stand. |
| Models | From 4 Oct, Opus 5.5 only, for every session and subagent. |
| Deadline | Demo live on GitHub Pages by the morning of 7 Oct 2026. |

### Defaults confirmed by Miguel, 4 October 2026

Proposed so that work could continue towards the 7 Oct deadline, each following the Architect's
recommendation where one existed, and confirmed by Miguel in chat on 4 October 2026.

| Item | Decision |
|---|---|
| DM-1 | (a) Add a sixth label, `yours`, for text the viewer types. |
| DM-2 | Adopt the proposal: the element label states origin, `frozen` is demo-wide, composite items carry per-part labels. |
| DM-3 | Ratify null source fields for generated and viewer entities; each claim inside carries its own source. |
| DM-4 | Ratify per-trend reveal bundles loaded by dynamic `import()` after the intuition record. |
| DM-5 | Accept the Level 2 change and the new state `F1-E3`. |
| DM-6 | (a) Narrow the `file://` sentence in `CLAUDE.md`: GitHub Pages or a local static server; `file://` only where the browser allows module scripts, elsewhere a clear message. |
| DM-7 | The entry screen is the weekly brief. Under Q-6 it no longer affects NF4's timing. |
| DM-9 | `BRIEF_SIGNAL_CAP` = 5, meaning no more than five; `READING_WPM` = 200; `QUOTE_MAX_WORDS` = 15; replay window 1 Jan to 31 Mar 2026; three questions per interrogation group. |
| K-7 | The replay judgements are written by the Rival Readers and the Interrogator from the early-2026 signals only, with outcomes withheld; the Verifier attaches the dated outcomes afterwards. The set includes at least one judgement that did not hold. The replay statement names who wrote the judgements and when. |
| DM-10 | Calibration notes are labelled `ai-generated`, following K-7. |

## G2 decisions, 5 October 2026

Miguel decided the following in chat on 5 October 2026. They are binding on Levels 2 to 4 and are
to be written into the documents, and into `traceability.md`, before G2 is recorded as approved.

| Item | Decision |
|---|---|
| Q-5 | **Confirmed.** The Architect writes the governance argument, as in the outcome below. O-4 is closed. |
| O-2 | **The Trend Analyst** writes the maturity explanations, the next-level descriptions and the replay calibration notes, in a short G3 pass after the main run, as the Architect recommended (architecture, section 14). All three are labelled `ai-generated` and checked by the Verifier. |
| O-3 | The three foresight practices stay as R2 names them: scanning, trend analysis and scenario work. The Verifier still checks them against the thesis when it re-opens p. 9. |
| F-9 | Node is installed on the build machine (v24.21.0, checked on 5 Oct). `node --test` runs from the repository root. |
| DM-11 | **Not needed. The architecture's default stands:** with Node installed, the text-based tests run under Node, and no `fetch()` exists anywhere in the repository, tests included. |
| D-1 | Miguel restated the three level names in chat: level one "AI for analysis augmentation", level two "AI as creative sparring partner", level three "AI integrated and customized into workflow". They match the D-1 entry of 4 Oct word for word. The status stays `unverified` until the Verifier has re-opened p. 9 of the report itself (CLAUDE.md). |
| F5 | **F5 ships as the static screen `F5-ST`.** `SCENARIO_FLOW` stays `"static"`. The conversation questions (O-1, F-7) are out of scope for this release. |

**G2 conditions decided by Miguel, 5 October 2026 (evening).**

| Item | Decision |
|---|---|
| R7 exemption | **Confirmed.** R7 has no flow. It is designed, not built, and its own L1 acceptance ("documented in the architecture only") is met by architecture section 11 and the optional `role` field. |
| Readiness findings and level assignments | **Confirmed as proposed.** Both are part of the persona dossier, written in the dossier pass in Claude Code, and labelled `fictional`. Levels are assigned there by the thesis rule (D-1). If an interpretive agent ends up writing or assigning them instead, they must be labelled `ai-generated` (Red-team condition). |
| Governance argument struck entirely (N6) | **Option (b), not the proposed no-go.** R8's L1 acceptance only requires the screen to state what is and is not implemented, which the two lists do. If every argument paragraph, including the one-paragraph GDPR fallback, is struck, the screen ships both lists and one sentence saying the argument is not shown because its claims did not pass verification. Nothing unverified ships. The schema allows an empty `argument`, L2 gains a screen state for it, and a test covers it. `F3-E2` still must not ship. |
| G2 | **Approved, 5 October 2026.** Level 5 and the G3 content work may start. |

**Can F3 and F4 now be dynamic? (Orchestrator's check, 5 October 2026.)** Yes, both. Neither has
any viewer input; "dynamic" here means rendered in full from frozen data rather than as a static
fallback. With O-2 assigned, the design has no gap left. What remains is content, on the G3 path:

- **F3 in its verified state (`F3-S2v`)** needs four things before G3:
  - the Verifier confirms the level names on p. 9 (D-1);
  - the Trend Analyst writes an explanation and a next-level description for each of the three
    practices;
  - each of those passes the Verifier and the six K-2 wording constraints;
  - Miguel sets the readiness status to `verified` at G3.

  If any one is missing, F3 still ships data-driven, in its honest unverified state `F3-S2`, which
  L2 accepts as complete. R6's full acceptance test is met only in the verified state.
- **F4 (`F4-S1`)** needs the replay candidates (Cowork brief), past judgements by the Rival Readers
  and the Interrogator with the outcomes withheld (K-7), dated outcomes attached by the Verifier,
  and calibration notes by the Trend Analyst. At least one judgement must not have held, and the
  entries must be transcribed into `log.json` (F-4). If no entry survives verification, F4 shows
  `F4-S0`, which fails its exit criterion. F4 is the flow most at risk on the content path.

### Q-5 outcome: who writes the governance argument (debated 5 October 2026, confirmed by Miguel 5 October 2026)

The question was settled by a structured debate. Three advocate agents each made the strongest case
for one author, independently and without seeing the others: the Architect, a runtime-pipeline
pass, and Miguel himself. A neutral adjudicator agent then read all three arguments against the
invariants and the deadline. All four ran on Opus 5.5. The outcome below is the adjudicator's. Miguel
confirmed it on 5 October 2026.

**Decision.** The Architect writes the governance argument and is accountable for it. The Scout
gathers the regulatory sources in the same one-off offline run as the signals. Each argument
paragraph carries its own label, `ai-generated`. The two lists of what is and is not implemented
stay `real`, as DM-2 decided, because each is a statement about the demo backed by a named test.
The Architect changes `governance.schema.json` at G2, not on freeze day: every `argument` item gets
a required `label` fixed to `ai-generated`, with a matching M1 unit test and a traceability entry.
Miguel does not write the argument. He accepts or strikes it at G3, and records his reason here.

**Reasoning.** Under DM-2 a label states where text came from, and the label vocabulary is closed.
Prose written by Miguel would fit none of the labels:

- `yours` means text the viewer types, and Miguel is not the viewer.
- `real` would blur "a person wrote it" with "verifiable published fact", the confusion DM-1 was
  decided to avoid.

Miguel writing it would therefore need a seventh label, which means changing an invariant on
freeze day. Machine-written prose carries `ai-generated` honestly, following K-7 and DM-10.

The Architect is preferred over a new pipeline author for three reasons:

- It is already defined.
- It wrote architecture section 11, which sets out what own-data ingestion would need.
- It is best placed to keep the argument consistent with what was actually built.

It has no web tools and needs none. It drafts only from the Scout's frozen source list, and any
sentence it cannot tie to a listed source is cut.

Checked against each invariant:

- **No ranking (invariant 1).** The prose states conditions, not advice, and passes the C-6
  language check.
- **Intuition before AI (invariant 2).** Does not apply; the screen shows no readings.
- **Rationale (invariant 3).** Applies to Miguel's G3 decision, which he records with a reason.
- **Sourcing (invariant 4).** The Verifier checks every paragraph against an opened, dated source,
  or strikes it.
- **Labelling (invariant 5).** Every label is honest, and there are no live calls.

**Conditions and fallback.** The adjudicator set clock times on the assumption that G3 content work
began on the morning of 5 October. G2 was still open that day, so the times are recorded here as
offsets from the start of G3 content work:

| Step | Due |
|---|---|
| Scout delivers the regulatory sources | start + 3 h |
| Architect's draft ready | start + 5 h |
| Verifier's pass or strike record complete | start + 7 h |

Struck paragraphs are dropped, not softened. If no paragraph has passed at start + 7 h, the
Architect cuts the argument to one paragraph. That paragraph states the system conditions from
section 11 and makes a single regulatory claim, citing the GDPR's own definition of personal data.
The Verifier checks it against EUR-Lex within two hours. If that paragraph is struck too, the
governance argument stays out of the G3 freeze and Miguel decides go or no-go at G4.

**Strongest dissent: Miguel writes it.** Taking a regulatory stance is itself an act of selection,
and a hiring manager may want to see Miguel's own judgement. This did not prevail for two reasons.
Labelling his prose honestly would have meant changing an invariant at the last minute, and it
would have made Miguel's scarce G3 time a single point of failure. His judgement still shows: he
accepts or strikes the argument, writes his reason, and that decision is recorded in this log.

## G3 decisions, 6 October 2026 (late evening)

Miguel decided the following in Claude Code on 6 October 2026, from `g3-decision-pack.md`.

| Item | Decision |
|---|---|
| Governance argument (Q-5) | **Route B.** Accepted: `ai-act-conditions` and `pending-gdpr-amendment`, because every sentence rests on an opened, dated source (the Commission's AI Act page of 3 Aug 2026, the Parliament's Legislative Train of 20 Sep 2026 and the EDPB–EDPS item of 11 Feb 2026). Struck: `personal-data-condition`, `lawful-basis-and-design` and `workplace-and-impact-assessment`, because their GDPR articles could be checked only on EUR-Lex, which no tool could open, and Miguel did not check them by hand. Nothing unverified ships. The screen shows the two lists and two paragraphs (`F3-S3`). |
| D-1 level names | **Verified.** The Verifier opened p. 9 of the WEF/OECD report on 6 Oct 2026 and found the three names word for word; Miguel accepts the check. The readiness data stays `unverified` until the Trend Analyst's maturity explanations and next-level descriptions are written and pass the Verifier; then `MATURITY_LEVEL_NAMES` and the profile's status change together (M1-U18). |
| Scanning window | 1 July to 30 September 2026, confirmed. |
| Brief selection | Kept as it is: five signals chosen by coverage of the trends, listed by date. |
| Fictional premises | Accepted, together with the B-1 line that says Tracewell is fictional on the brief and every trend card. |
| Freeze date | 6 October 2026, the day the text was fixed and verified: `node pipeline/freeze.mjs --frozen-on 2026-10-06 --pipeline-run-on 2026-10-06`. |
| G3 | **Approved.** Miguel pushes to GitHub when told. |

**D-1 completed, 6 October 2026 (late evening).** The condition Miguel set at G3 is met: the Trend
Analyst wrote the three maturity explanations and the next-level descriptions from the Verifier's
extract of p. 9 (`pipeline/output/report-pages.md`) and the persona dossier, and the Verifier passed
them. The readiness profile is now `verified`, `MATURITY_LEVEL_NAMES` in `vocabulary.js` holds the
three names, and the content was re-frozen (still dated 6 October). The report is cited by its DOI,
as L2 F3 rule 3 requires; p. 9 was read in the WEF-hosted copy of the same publication, because the
OECD page behind the DOI returns 403 to the agents. `node --test`: 125 pass, 0 fail, 12 skipped
(the deferred interactive-F5 tests).
