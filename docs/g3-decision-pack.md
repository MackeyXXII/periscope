# G3 decision pack — for Miguel (draft, being filled in during the G3 run)

**Status:** in progress. The Orchestrator started this on the evening of 5 October 2026, and the
3 am run on 6 October continues it. The "Progress log" section says where work stands. When the
run is finished, this line will say so.

## Progress log

| Step | State |
|---|---|
| G2 approved; N6 option (b) applied to L2–L4, the schema and the tests | Done, 5 Oct |
| Runtime agents' instructions updated (F-1 to F-4, F-8, K-7, B5, D-1) | Done, 5 Oct |
| Briefs: persona dossier, scanning brief, replay candidates | Done, 5 Oct (M2 tests pass) |
| M1 contracts and freeze | Done, 5 Oct (all runnable M1 tests pass) |
| M9 honesty and M10 shell | Started 5 Oct; stopped at the usage limit. Any partial, uncommitted files in assets/ and index.html are unfinished: check them with `node --test`, then finish or redo them. M10-U9 needs `SHIPPED_FILES` in tests/lib/files.mjs updated for M1 and M9/M10 files (Test Engineer) |
| Pipeline (Scout started 5 Oct and stopped at the usage limit; partial files in pipeline/output/ are unverified and must be redone): Scout → Trend Analyst → Rival Readers → Interrogator → replay judgements → Verifier outcomes → Trend Analyst second pass → Architect governance draft → Brief Editor → Verifier final pass | Not started |
| Red-team review of content and code | Not started |

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

## Decisions for G3 (completed when the pipeline has run)

To follow: each governance paragraph to accept or strike, with a reason; the D-1 level names set to
`verified` if p. 9 matched; struck content; and the Red-team verdict.
