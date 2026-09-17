# Level 1 — User requirements

**Status: approved at Gate G1, 16 September 2026. Frozen. Do not edit without a new G1.**

Eight requirements define what the tool must do for a founding team. Each traces to the thesis
literature and carries its own acceptance test, verified by real viewers on the right arm of the V.

Primary user: a founding team of two to five people. Single-founder mode is the same system with
the roles collapsed.

| ID | Requirement | Traces to | Acceptance test |
|---|---|---|---|
| R1 | Frees founder attention: the weekly sensing brief reads in about 10 minutes and holds a small, fixed number of signals | Ocasio (1997); Baker and Nelson (2005) | A viewer finds the one signal worth discussing within the time budget |
| R2 | Augments the three foresight methods unevenly: scanning automated, trend analysis offered as rival readings, scenario work structured around the founder's own external conversations | Rohrbeck et al. (2015); Jarrahi (2018) | A viewer can say which steps the machine did and which the founder did |
| R3 | **Non-negotiable.** No ranked recommendations; every trend carries competing readings and the founder must commit a judgement with a rationale | Otis et al. (2023); Agrawal, Gans and Goldfarb (2019) | No screen shows a "best option"; a judgement cannot be committed without a rationale |
| R4 | Questioning habits built in for every user, whatever their expertise: intuition captured first, then provenance and disconfirmation checks, so founder cognition stays in the decision | Tankelevitch et al. (2024); Lebovitz et al. (2022), extended | The founder's gut reading is recorded before any AI reading appears |
| R5 | Accumulates capability: signals, readings, judgements and outcomes persist and are reviewed later | Vecchiato (2015); Zollo and Winter (2002) | A viewer sees a past judgement compared with what happened |
| R6 | Builds complements: readiness diagnostic across the five Jöhnk et al. categories, plus a maturity view on the OECD/WEF levels | Mikalef and Gupta (2021); Jöhnk et al. (2021) | A viewer sees why the team sits at its level and the next complement to build |
| R7 | Role-aware data model that collapses cleanly to a single founder. Designed for, not built | Miguel's decision | Documented in the architecture only |
| R8 | Open web by default; own-data ingestion depends on verified GDPR and EU compliance, and in the demo it is argued on a governance screen, not implemented | Miguel's decision | The governance screen states what is and is not implemented |

## Why this design, in one chain

Early-stage ventures are short of attention and have no slack to absorb a missed signal. Foresight
methods operationalise sensing, but AI augments them unevenly: scanning is a complexity problem the
machine handles well, while interpretation is equivocal and stays human. Evidence from
entrepreneurs shows that access to a generative assistant helped strong performers and harmed weak
ones, because the difference lay in which advice they selected. A founder short of attention is
exactly the person most likely to cede that selection to the machine. The tool therefore has to
keep the founder's cognition and intuition inside the decision.

## Assumptions accepted at G1

1. A fictional four-person observability start-up based in Linz (working name **Tracewell**),
   placed in a real, verifiable environment: real incumbents including Dynatrace, real open-source
   shifts such as OpenTelemetry, real EU regulation. Dynatrace is portrayed factually and neutrally.
2. Intuition-first capture: the founder records a gut reading before any AI reading is shown.
3. Real-signal replay for the decision log: real signals from about early 2026, reviewed against
   what actually happened by September, labelled as a retrospective replay.
4. Hosting on GitHub Pages, with the V-Model documents in `docs/` as part of the portfolio. A
   published claude.ai artifact link is the fallback.

## Open item carried forward

Confirm the OECD/WEF maturity level names against the report itself before they appear anywhere in
the UI (R6). Until confirmed, `LEVEL_NAME_UNVERIFIED` is used — never a guess.
