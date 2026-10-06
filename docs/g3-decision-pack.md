# G3 decision pack — for Miguel, 7 October 2026

This is everything you need to decide Gate G3, the content freeze. Reading this page and answering
the four decisions in section 2 should take about twenty minutes; the freeze and the push in
section 3 take another fifteen. The target you set on 6 October is a presentable demo live on
GitHub Pages by **midday on 7 October**, focused on the weekly brief and the core loop.

Gates are decided by you. Answer in claude.ai chat or here in Claude Code, and the Orchestrator
records the outcome in `gates.md`.

## 1. Where things stand

**How the run went.** The 3 am run of 6 October started but did no work overnight: it waited on a
permission prompt until you returned at about 12:30. In the afternoon you set the midday target,
then narrowed the focus to the brief and the core loop and set the decision log aside. The work
then ran through the afternoon and evening windows, with one stop to save usage.

**What is built.** Every module of the demo exists and is committed: M1 contracts and freeze, M5
weekly brief, M6 trend card and session (F1) and the static scenario screen (F5-ST), M7 readiness
and governance, M8 decision log, M9 labels and sources, M10 shell. The readiness, governance and
log screens were built to their specifications, but with proportionate effort, as you asked.

**Tests.**

| Run | Tests | Pass | Fail | Skipped |
|---|---|---|---|---|
| `node --test`, repository as committed | 137 | 88 | 0 | 49 (37 wait for `data/`, 12 deferred F5) |
| `node --test`, a throwaway copy frozen with the real driver and `CONTENT_FROZEN` on | 137 | 123 | 0 | 14 |
| Browser runner `tests/run.html`, headless Chrome (Implementer, 6 Oct) | 205 | 127 | 0 | 78 (data, deferred F5, needs Node) |

The 37 tests that wait for `data/` all pass against the frozen copy, so the freeze in section 3
should leave no failure. The browser runner has been run headless only; a run in your own browser
after the push is worth two minutes.

**The core loop, walked by hand** in the frozen copy (6 Oct, evening): the brief lists five real
signals with their labels and links; a trend card shows its signals and the intuition prompt, and
no reading exists in the page, nor is the reveal file requested, until the gut reading is
recorded; the three readings then appear as peers in random order with the questions; "Commit
judgement" stays disabled until a reading is chosen and a rationale written; the committed view
shows gut call, chosen reading and rationale, each labelled `yours`. Every route renders at
360 × 640 without sideways scrolling.

**The content.** Produced on 6 October by the runtime agents, all on Opus 5.5, and all in
`pipeline/output/`:

| Item | Count | Verifier |
|---|---|---|
| Signals, 1 July to 30 September 2026 | 16 | All pass after strikes |
| Trends | 4 | All pass after corrections |
| Readings, three peers per trend, 2 evidence and 2 counter-evidence each | 12 | All pass after corrections |
| Interrogations (2 provenance checks, 2 assumption probes, 2 pre-mortem questions each) | 4 | All pass after one correction |
| Weekly brief: 5 of the 16 signals, every trend reachable | 1 | Pass |
| Readiness profile, unverified | 1 | Pass (citation corrected) |
| Governance container | 1 | **Pending your check (decision 2)** |
| Decision log | empty | Not worked on, by your decision |

The Verifier ran three passes. It struck seven claims in the first pass and four entities in the
second; every strike was applied by deletion or by the Verifier's own corrected wording, never by
finding a friendlier source, and the third pass confirmed each. The records are
`verification-pass1.md`, `verification-pass2.md` (with pass 3 at the end) and
`verification-governance.md`; `verification.json` holds the hashes the freeze checks.

**Red-team verdict.** See section 4. It reviewed the content and the code on the evening of 6 Oct.

## 2. What you decide

### Decision 1 — The governance argument: route A or route B

The argument has five paragraphs, all labelled `ai-generated`, drafted by the Architect from the
Scout's regulatory source list only. Two pass outright: `ai-act-conditions` (on the Commission's
AI Act page, updated 3 Aug 2026) and `pending-gdpr-amendment` (on the Parliament's Legislative Train
and the EDPB–EDPS joint opinion). The other three rest on GDPR articles that only EUR-Lex states,
and EUR-Lex serves no automated tool (it answers with a bot challenge). The WP249 sentence was
struck because its source could not be read.

- **Route A (proposed if you can spare ten minutes):** open the GDPR on EUR-Lex
  (https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng) and compare Art. 4(1), 6(1), 25(1), 35(1)
  and 88(1)–(2), and the publication date 4 May 2016, with the wording quoted in
  `pipeline/output/verification-governance.md`. If they match, all five paragraphs ship. Your check
  counts as the opened source, and it is recorded here with the date.
- **Route B:** the three GDPR paragraphs are dropped whole (`governance-route-b.json` is ready).
  Two paragraphs ship, and the screen is the ordinary `F3-S3`, not the withheld state.

Either way, say for each paragraph whether you accept it and why; the reason is recorded in
`gates.md`, as the Q-5 outcome requires.

### Decision 2 — The maturity level names

The Verifier opened the WEF/OECD report on 6 Oct and found the three names on p. 9 word for word:
"AI for analysis augmentation", "AI as creative sparring partner", "AI integrated and customized
into workflow". (It read the WEF PDF, because the OECD page behind the DOI returned 403; the title,
date and authorship match the DOI's record.)

- **Proposed: keep the readiness screen unverified for this release (`F3-S2`).** The verified
  state also needs the Trend Analyst's maturity explanations and next-level descriptions, which
  were not written because you narrowed the focus. `F3-S2` is complete and honest under Level 2;
  it shows `LEVEL_NAME_UNVERIFIED` where the names would go.
- **Alternative:** record the D-1 names as verified now (the p. 9 check is done), and have the
  explanations written and verified in a later pass before the status changes in the data.

### Decision 3 — Small content points (accept or change)

1. **Scanning window** 1 July to 30 September 2026, proposed by the brief researcher so it does
   not overlap the replay window. Every signal sits inside it.
2. **The brief's five signals** were chosen by coverage, not significance: the latest signal of
   each trend, then the next latest of those left. The brief says "Listed by publication date. The
   order says nothing about importance." The AI-agents trend has two of the five places because of
   dates. If you prefer one per trend, the brief can ship four signals.
3. **Fictional premises in content.** Readings and one relevance note mention Tracewell's
   fictional pilots, assistant and Collector distribution; the Verifier accepted these as story
   premises, never as sourced claims. The NIS2 relevance note assumes Tracewell's customers fall
   under the NISG 2026.
4. **Dynatrace** appears in two signals and in readings, described from its own press release and
   neutrally. Its headquarters is Boston and its main R&D site Linz (10-K of 20 May 2026); the
   relevance note that said so was struck because the press release does not say it.
5. **Freeze dates.** The pipeline entities record 6 October as their freeze date, and the brief
   header shows "Frozen on 6 October 2026"; the data modules are written on 7 October. Proposed:
   freeze with `--frozen-on 2026-10-07` and accept that the brief header shows the content's own
   date, or freeze with `2026-10-06`, the day the text was fixed and verified.
6. **Kind "publication"** is used for funders, universities and publishers in the entity tables.
   Seven publishers cited by the pipeline were added to the scanning brief's table on 6 October.
7. **The freeze driver deletes stale files** in `data/` that the new manifest does not list.
8. **The Implementer's wording choices** for interface copy that Level 2 does not fix are listed
   in the commit messages of d911c83, 24750f9 and 02f331c; the demo-wide statement sits in a footer.

### Decision 4 — Approve G3

- **Approve:** the freeze runs as in section 3 and the push follows.
- **Approve with conditions:** name them.
- **Reject:** name what must change; the static fallback for F3 then applies.

## 3. The freeze and the push (about 15 minutes)

Once you have decided, the Orchestrator can do steps 1 to 4 in a few minutes if you say
"G3 approved, route A" (or B). Only you push.

1. Governance: for route A, set the governance verdict to `pass` in
   `pipeline/output/verification-final.json` with a note recording your EUR-Lex check; for route B,
   copy `governance-route-b.json` over `governance.json` and set its verdict to `pass`.
2. Rebuild the record and freeze:
   `node pipeline/verification-record.mjs pipeline/output/verification-final.json`, then
   `node pipeline/freeze.mjs --frozen-on 2026-10-07 --pipeline-run-on 2026-10-06`.
3. Set `CONTENT_FROZEN = true` in `tests/lib/stage.mjs` and run `node --test`: expected 0 fail.
4. Commit as the G3 freeze, and record G3 in `gates.md`.
5. **You:** `git push origin main`; in the repository's Settings → Pages, check that Pages serves
   `main` from the root; open https://mackeyxxii.github.io/periscope/ once it has built (a minute
   or two) and walk brief → trend card → commit on your phone.

## 4. Red-team review

The Red-team Reviewer reviewed the content and the code on the evening of 6 October. **Its verdict
was a block, with three findings, all in content and labelling.** It found the code sound on the
invariants: the reveal file is imported only after the gut reading is recorded, commit is refused
three times over without a rationale, the readings share one template in random order, and there is
no network call or storage. It re-ran the tests on the frozen copy: 123 pass, 0 fail.

| Finding | What was wrong | What was done |
|---|---|---|
| B-1 | Tracewell was never shown as fictional on the brief or the trend card, although Level 2 F1 and architecture section 8 require it | The brief and every trend card now open with one content element labelled `fictional`: "Tracewell is a fictional four-person observability start-up in Linz, the founding team this demo is written for. The signals and their sources are real." The brief adds one line saying what to do next (N-3). Please confirm this satisfies the rule |
| B-2 | Two readings described Dynatrace in loaded terms ("buy their way in") | Reworded to the reviewer's neutral text, which the press release supports |
| B-3 | The NIS2 relevance note stated as fact that Tracewell's customers fall under the NISG 2026, leaning before the gut reading; the Dash0 note dropped the ingestion fee | Both rewritten to the reviewer's text |

Also applied: N-1 (brief notes no longer cite the internal scanning brief), N-2 (the runway figure
dropped from a reading set in autumn 2026), N-10 ("funded" dropped). The Verifier re-checked every
changed entity (pass 4, at the end of `verification-pass2.md`).

**Non-blocking points for you:**
- **N-4.** The entry screen is headed "Weekly brief" but covers July to September 2026. "Weekly"
  is Level 2's name for the screen; changing it is your call.
- **N-5.** The brief header shows the content's freeze date and the footer the freeze run's date
  (decision 3, item 5).
- **N-6.** The empty decision log still shows the full replay statement, including "some
  judgements did not hold", above "This build contains no replay entries." Hiding the log from the
  navigation, or a one-line statement, would be a Level 2 change. Proposed: hide the "Decision log"
  item for this release if you agree, or accept the screen as it is.
- **N-8.** The readiness screen shows the raw token `LEVEL_NAME_UNVERIFIED`. It is what CLAUDE.md
  mandates, but it looks unfinished to a cold viewer; decision 2's alternative would remove it.
- **N-11.** Ship `governance.json` only after your EUR-Lex check (route A); otherwise route B.


## 5. What is not in this release

- **The decision log (F4)** ships empty (`F4-S0`): your decision of 6 October. The replay material
  stays in `pipeline/output/` for a later release: clean replay readings and judgements for R1 to
  R5, written from the replay signals alone after the first set was discarded for contamination.
  R1 lost both its signals to the Verifier, and no outcomes have been attached.
- **Verified maturity (F3-S2v)**, unless you choose the alternative in decision 2.
- **Interactive F5** (decided 5 Oct), the role-aware model (R7) and own-data ingestion, as the
  governance screen states.
- **System tests in Firefox** and the G5 rehearsal with outside viewers.

## 6. Record of the run, 6 October 2026

- **Scout:** 16 signals, each date read from the page itself; 10 regulatory sources; 7 of 8 replay
  signals (CNBC unreachable). Five in-window sources were left out because they are replay outcomes.
- **Trend Analyst:** 4 trends; three signals cluster with none and appear only if a later pass
  adds them (Austrian fund of funds, Plug and Play Linz, Palo Alto Networks).
- **Rival Readers:** one agent per lens, so no reader saw another lens. Their first replay readings
  were discarded because they had read later signals first; fresh agents rewrote them from the
  replay signals alone.
- **Interrogator:** intuition prompts (one reworded on 6 Oct to avoid a six-word overlap with its
  readings) and 24 questions.
- **Brief Editor:** selection only, before the Verifier's final pass (F-2).
- **Architect:** the governance container and its source map.
- **Verifier:** three passes plus the governance check; p. 9 matched.
- **Orchestrator:** applied strikes by deletion and corrections in the Verifier's wording; added
  seven publishers to the scanning brief; a commit of 6 Oct (`006d341`) carried the M6 state files
  under a pipeline message by mistake.
