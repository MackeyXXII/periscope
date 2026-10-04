# Gate log

Gates are decided by Miguel in claude.ai chat, in the Internships and Applications project. Agents
propose; the Red-team Reviewer may block; Miguel approves. Record every outcome here, with a date.

| Gate | Covers | Date | Outcome |
|---|---|---|---|
| G1 | Level 1 user requirements R1–R8 and the four working assumptions | 16 Sept 2026 | **Approved** |
| G2 | Level 2 system requirements, Level 3 architecture, Level 4 module design, test plan | 19 Sept 2026 | Open |
| G3 | Content freeze: runtime pipeline output verified and frozen | 20 Sept 2026 | Not started |
| G4 | System test pass | — | Not started |
| G5 | Acceptance by real viewers | — | Not started |

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
