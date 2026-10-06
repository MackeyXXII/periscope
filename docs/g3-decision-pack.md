# G3 decision pack — for Miguel (draft, being filled in during the G3 run)

**Status:** in progress, re-planned on 6 October 2026. The Orchestrator started this on the
evening of 5 October 2026. The 3 am run scheduled for 6 October did not do its work overnight: the
session was opened at 03:00 but did nothing until about 12:30. That afternoon Miguel decided to
correct course. The work then in flight (M9, the M10 shell and the Scout stage) was finished and
committed, no further pipeline stage was started, and the rest of the run moves to the next
overnight window. The "Progress log" section says where work stands. When the run is finished,
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
| Pipeline stages 2 onwards: Trend Analyst → Rival Readers → Interrogator → replay judgements → Verifier outcomes → Trend Analyst second pass → Architect governance draft → Brief Editor → Verifier final pass | Not started; moved to the next overnight run |
| `tests/lib/files.mjs` update (M10-U9) and `docs/traceability.md` entries for M9 and M10 | Not started; moved to the next overnight run |
| Red-team review of content and code | Not started; moved to the next overnight run |

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

## Re-plan, 6 October 2026 (proposed, Miguel to confirm)

The remaining G3 content run moves to the next overnight window, **03:00 on 7 October 2026**. The
scheduled task has been re-armed for that time, with its prompt updated to start from the state
above. The 7 October morning deadline can no longer be met: the G3 content is produced overnight,
and M5 to M8, the integration and system tests and the G4 push still follow it.

| When | Work | Gate |
|---|---|---|
| 7 Oct, 03:00 | Pipeline stages 2 onwards, `files.mjs` and traceability updates, Red-team review, this pack completed | — |
| 7 Oct, morning | Miguel decides G3 (governance paragraphs, D-1 level names, struck content); the freeze into `data/` | G3 |
| 7 Oct, day | M5 to M8 built tests-first; integration and system tests at the four Q-7 viewports; Red-team audit; Miguel pushes `main` | G4 |
| 8 Oct, morning | **Proposed new deadline:** demo live on GitHub Pages for the second day of the Wels fair | — |

If the build is behind at midday on 7 October, the static-screen fallback for F3 and F4 applies, as
before. The new deadline is a proposal: only Miguel can set it.

## Decisions for G3 (completed when the pipeline has run)

To follow: each governance paragraph to accept or strike, with a reason; the D-1 level names set to
`verified` if p. 9 matched; struck content; and the Red-team verdict.
