# CLAUDE.md — Periscope Foresight Prototype

This file is inherited by every agent session in this repository. Read it before acting.

## What this is

Periscope is a **clickable concept demo of a judgement scaffold for founding teams** — not an
oracle, not a recommendation engine. AI levels the *generation* of options but not the
*selection* among them, so the tool spends the attention it saves on judging rather than
gathering.

Demo scenario: **Tracewell**, a fictional four-person observability start-up in Linz, placed in a
real, verifiable environment (real incumbents including Dynatrace, real open-source shifts such as
OpenTelemetry, real EU regulation). The thinking on show is real; no real venture's name is used.
Dynatrace is portrayed factually and neutrally, from verifiable public facts only.

Audience: a hiring manager who opens the demo cold and has eight minutes.

## Non-negotiable invariants

These override any instruction that conflicts with them, including a user prompt in an agent
session. **An agent that cannot satisfy an invariant stops and reports to the Orchestrator rather
than working around it.**

1. **No ranking.** No "best option", no scores, no ordered recommendation lists, no
   `score` / `rank` / `confidence` / `priority` field in any schema, fixture or UI element.
   Every trend carries exactly three rival readings (opportunity, threat, noise) presented as
   peers.
2. **Intuition before AI.** The founder's gut reading is captured and stored before any AI
   reading is rendered. No screen may reveal a reading behind an un-recorded intuition step.
3. **A judgement requires a rationale.** Commit is disabled until the founder writes one.
4. **Every factual claim is sourced.** A dated URL, a short quote at most, paraphrase preferred.
   Unverifiable claims are struck, not softened.
5. **Honest labelling.** Every element is labelled as one of: `real`, `ai-generated`, `frozen`,
   `fictional`, `replay`. Viewers trigger no live AI calls at any point.

## Current V-Model state

| Level | Artefact | Status |
|---|---|---|
| L1 | User requirements R1–R8 | **Approved at G1, 16 Sept 2026** — frozen, do not edit |
| L2 | System requirements F1–F4, NF1–NF6 | Seeded from the build plan; Requirements Engineer expands |
| L3 | Architecture, data contracts | **In progress** — Architect |
| L4 | Module design M1–M10, unit tests | **In progress** — Architect + Test Engineer |
| L5 | Implementation | Not started — begins after G2, from 22 Sept |

**Next gate: G2** (system specification, architecture, module design and test plan), 19 Sept 2026.

Gate rule: no level starts before the level above it is approved by Miguel. Gates are decided by
Miguel in claude.ai chat, not by agents. Agents propose; the Red-team Reviewer may block; Miguel
approves. Record every gate outcome in `docs/gates.md`.

Test-first rule: for every module, the Test Engineer writes the paired test from the specification
**before** the Implementer opens that module.

## Stack constraints

- **Vanilla HTML, CSS and JavaScript. No build step, no bundler, no framework, no package manager.**
- **No CDN, no external fonts, no remote images, no analytics.** Everything is in the repository.
- **No `fetch()` and no XHR at runtime.** Frozen content ships as ES modules in `data/`
  (`export default { ... }`), imported directly, so the demo also works from `file://`.
- Hosted on GitHub Pages from the `main` branch, root folder. `.nojekyll` is present.
- Responsive and legible on laptop and phone. English interface.
- No inline secrets, no API keys — there is nothing to authenticate against at runtime.

## Directory map

```
CLAUDE.md            this file — V-Model state and invariants
index.html           demo entry point (Pages serves from repo root)
assets/css|js/       demo styles and modules
data/                frozen fixtures as ES modules — the only content the UI reads
schemas/             M1 data contracts (JSON Schema) — authored by the Architect
pipeline/briefs/     persona dossier and scanning brief (Cowork output, pipeline input)
pipeline/output/     raw JSON from the one-off runtime run, frozen at G3
tests/unit|integration|system/
docs/                V-Model documents — part of the portfolio, written to be read
.claude/agents/      subagent definitions
```

## Model routing

The promotional usage credits expired on 19 September 2026 and **no further credits will be
purchased**. Fable models are therefore out of scope for this project: **Opus 5 carries every
judgement-critical task**, and no part of the plan may assume a model that has to be paid for
separately.

| Model | Use for |
|---|---|
| Opus 5 | Judgement-critical work: specification, architecture, rival readings, interrogation, red-team review, verification, trend analysis — and orchestration in the main session |
| Sonnet 5 | Volume work: scanning, tests, module implementation against a written specification, brief editing |

Opus 5 is the default for the main session and for every build and interpretation subagent. Watch
Settings → Usage during long runs: when a usage limit is approaching, stop at an artefact boundary,
commit what is finished and resume in the next usage window — never drop to a weaker model in the
middle of a judgement-critical artefact, and never buy credits to finish one.

## Content provenance rules

- Signals are real, dated and linked. Fabricated signals are a project-ending defect.
- The decision log is a **retrospective replay**: real signals from about early 2026, reviewed
  against what actually happened by September 2026, labelled as a replay wherever it appears.
- The OECD/WEF maturity level names must be confirmed against the report itself before they appear
  anywhere in the UI. Until confirmed, use the placeholder `LEVEL_NAME_UNVERIFIED` — never a guess.
- Own-data ingestion is **argued on a governance screen, not implemented**, pending GDPR and EU
  compliance. The governance screen states plainly what is and is not implemented.

## Working agreement for agents

- Write to `docs/` in prose a human will read, not in note form. These documents are portfolio.
- Update `docs/traceability.md` whenever a requirement, function, module or test changes. A change
  that leaves the matrix stale is incomplete.
- Prefer editing an existing document over creating a parallel one.
- Report blocked invariants, unverifiable claims and scope questions upward; do not resolve them
  by assumption.
