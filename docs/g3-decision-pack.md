# G3 decision pack — for Miguel (draft, being filled in during the G3 run)

**Status:** in progress, re-planned on 6 October 2026. The Orchestrator started this on the
evening of 5 October 2026. The 3 am run scheduled for 6 October did not do its work overnight: the
session was opened at 03:00 but did nothing until about 12:30. That afternoon Miguel decided to
correct course. The work then in flight (M9, the M10 shell and the Scout stage) was finished and
committed. Miguel then set the target of a presentable demo live by midday on 7 October, and the
run continues in the windows listed in the re-plan below. The "Progress log" section says where work stands. When the run is finished,
this line will say so.

## Progress log

| Step | State |
|---|---|
| G2 approved; N6 option (b) applied to L2–L4, the schema and the tests | Done, 5 Oct |
| Runtime agents' instructions updated (F-1 to F-4, F-8, K-7, B5, D-1) | Done, 5 Oct |
| Briefs: persona dossier, scanning brief, replay candidates | Done, 5 Oct (M2 tests pass) |
| M1 contracts and freeze | Done, 5 Oct (all runnable M1 tests pass) |
| M9 honesty and M10 shell | Done, 6 Oct afternoon (`efeaeca`, `ea304ba`). `node --test`: 137 tests, 73 pass, 15 fail, 49 skipped. The failures are M10-U9 (`SHIPPED_FILES` in `tests/lib/files.mjs` lacks the M1, M9 and M10 files, a Test Engineer task) and 14 tests of the screen modules M5, M6 and M8, which are not built yet. The browser tests of M9 and M10 cannot run until the screens exist. |
| Pipeline stage 1, Scout | Done, 6 Oct afternoon (`bc44866`, `069609b`). 16 signals in the window, each date taken from the page itself; 10 regulatory sources (F-8); replay signals for R1 to R5, 7 of 8 confirmed (the CNBC article for R4 returned 403 and was left out). Schema and lexical checks pass. Nothing is verified yet: that is the Verifier's work |
| Pipeline stages 2 onwards: Trend Analyst → Rival Readers → Interrogator → replay judgements → Verifier outcomes → Trend Analyst second pass → Architect governance draft → Brief Editor → Verifier final pass | Started 6 Oct afternoon |
| `tests/lib/files.mjs` update (M10-U9) and `docs/traceability.md` entries for M9 and M10 | Started 6 Oct afternoon |
| Red-team review of content and code | Started 6 Oct afternoon |

## Items for Miguel collected so far

1. **Scanning window (scope).** No document set it. The brief researcher proposed
   `2026-07-01 to 2026-09-30`, the quarter before the freeze, so that it does not overlap the replay
   window of 1 Jan to 31 Mar 2026. The Scout scans against it. Confirm it or change it.
2. **Dynatrace's headquarters.** The Orchestrator's own brief to the researcher said Dynatrace is
   "headquartered in Linz". That is wrong. Dynatrace's 10-K of 20 May 2026 gives Boston as its
   headquarters and Linz as its primary R&D site. The dossier states it correctly. No other
   repository file made the claim.
3. **Maturity levels in the dossier**, assigned by the thesis rule against the unverified D-1
   descriptions:
   - scanning: level 1;
   - trend analysis: level 2, between 2 and 3;
   - scenario work: level 1, between 1 and 2.

   If p. 9 of the report differs, they are redone, not adjusted.
4. **The "Kind" vocabulary in the Named entities tables** has no value for funders, incubators or
   universities (aws, tech2b, JKU, IT:U, EY Austria). These are listed as `publication`. It is a
   minor stretch, so either confirm it or ask for a new kind.
5. **"High-risk".** The AI Act's legal term appears in replay candidate R1 and in the scanning
   brief. It contains the C-6 word "high", and lexical tests may flag it. It is a quoted legal
   term, not a ranking.
6. **The freeze driver deletes stale files.** After a successful freeze, `pipeline/freeze.mjs`
   deletes any file in `data/` that the new manifest does not list, and prints what it removed.
   This keeps `data/` truthful. It is a destructive choice, and the Implementer offered to make it
   refuse instead.
7. **K-7 hygiene.** `pipeline/briefs/replay-candidates.md` contains the outcomes, so any agent
   with file access could read them. The Rival Readers and the Interrogator are instructed to work
   only from `pipeline/output/replay-signals.json`, which has no outcomes, and not to open the
   candidates file. The replay statement says honestly that outcomes were withheld from the
   agents' *inputs*.

8. **The Scout kept replay outcomes out of the main signals.** Five in-window sources already
   named in the briefs are `Outcome:` URLs of replay candidates (Regulation 2026/1744 on EUR-Lex,
   the Parliament's Legislative Train page, ENISA's reporting platform, Dynatrace's Q1 FY27 release,
   EY's H1 2026 barometer). They are not in `signals.json`, so the Rival Readers cannot see them.
   Six signals that were kept sit near replay topics without being outcomes: the CRA guidance (R3),
   Datadog Q2, Grafana's tools and the Palo Alto Networks transcript (R4), the EDPB anonymisation
   item (R2) and the Austrian fund-of-funds report (R5). So the replay judges must work only from
   `replay-signals.json`, never from `signals.json` or `regulatory-sources.json` (entries 6, 7 and
   9 of the latter are in effect the outcomes of R1 and R2).
9. **R4 without CNBC.** The CNBC article of 6 Feb 2026 could not be opened (403). R4 now rests on
   the Dynatrace and Datadog releases only, so the "software stocks fell" half of its heading has no
   signal behind it. Options: add the ABC News article of 5 Feb 2026 on the same sell-off as a
   substitute original, have the Verifier reach CNBC, or reword the heading.
10. **Sources the fetch tool could not open.** EUR-Lex returned empty pages for every view, so the
    GDPR, AI Act and Regulation 2026/1744 entries were confirmed through secondary listings. The
    Council press release of 13 Mar 2026 (R1) returned 403 and was confirmed through a dated
    browser print hosted elsewhere. Two OpenTelemetry blog dates come from the posts' source files
    on GitHub, because the pages show none. The Verifier must re-check all of these, and you may
    prefer to open the EUR-Lex pages yourself.
11. **Publishers missing from the briefs' Named entities tables** (M2-U2 will fail at G3 without
    them): ORF, the Unternehmensserviceportal (USP), The Motley Fool and Splunk. Adding them is a
    brief edit.
12. **Small choices in the M10 shell to review.** The demo-wide statement sits in a footer on every
    screen, not the header, so that the replay statement stays on the first screen at 360 × 640
    (M10-U8); on long pages the footer needs scrolling. The Implementer also wrote four short texts
    Level 2 does not fix: "Open the weekly brief" on the not-found screen; a fallback "This screen
    could not be shown in this build."; "Source" as link text when a reference has no title; and
    the publisher in brackets after a quote.

## Re-plan, 6 October 2026: presentable by midday on 7 October

Miguel set the target on the afternoon of 6 October: as much as possible of a presentable demo,
live by **midday on Wednesday 7 October**. Work runs in the windows he gave. Content and build run
in parallel, and the core loop (F2 brief into F1 trend card) comes first.

| Window | Content path | Build path |
|---|---|---|
| 6 Oct, now to 15:40 | Trend Analyst (trends); then Rival Readers and Interrogator (readings, interrogation, intuition prompts, replay judgements from `replay-signals.json` only) | M6 state and screens (F1, F5-ST), then M5 (F2); `files.mjs` and test-plan counts |
| 6 Oct, from 15:40 to the usage limit | Verifier: replay outcomes, p. 9 level names, first pass on signals, readings and regulatory sources. Trend Analyst second pass; Architect governance draft; Brief Editor | M7 (readiness and governance), M8 (log) |
| 6 Oct, from about 21:00 | Verifier final pass and `verification.json`; Red-team review of content and code; fixes by the owning agents | Browser test run (`tests/run.html` on a local server) |
| Overnight | This pack completed; `CONTENT_FROZEN` prepared but **not** set; everything committed | System checks at the four Q-7 viewports; fixes |
| 7 Oct, morning | **Miguel decides G3**; freeze into `data/`; final Red-team check on the frozen data | **Miguel pushes `main`** by about 11:00 and checks GitHub Pages |

**What can be live by midday, in order of confidence:**

1. **Very likely:** the weekly brief (F2) and the full core loop (F1): gut reading first, the three
   readings in random order, interrogation, commit with a rationale. Verified real signals, honest
   labels on every element, the demo-wide statement, no network calls. F5 is the static `F5-ST`.
2. **Likely:** the readiness screen in its honest unverified state `F3-S2` (level names withheld
   behind `LEVEL_NAME_UNVERIFIED`) and the governance screen with both lists. It ships with the
   argument paragraphs that pass, or as `F3-S3a`. `F3-S2v` needs the p. 9 match and Miguel's
   `verified` at G3. If both happen, it is possible.
3. **At risk:** the decision log (F4), which needs every replay outcome found, verified and dated,
   at least one judgement that did not hold, and calibration notes. If it falls short it ships as
   the honest `F4-S0`, or the static fallback.
4. **Not by midday:** the full system-test matrix in Chromium and Firefox and the G5 rehearsal
   with outside viewers. A spot-check at the four viewports is planned overnight instead.

The critical dependency is Miguel's own time on the morning of 7 October: the G3 decision (about
30 minutes with this pack) and the push. Agents may do neither. If the usage windows end early, the
order above is the order in which things are cut, and F3 or F4 fall back to static screens.

## Decisions for G3 (completed when the pipeline has run)

To follow: each governance paragraph to accept or strike, with a reason; the D-1 level names set to
`verified` if p. 9 matched; struck content; and the Red-team verdict.
