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
   `fictional`, `replay`, `yours` (text the viewer types; added by DM-1, 4 Oct 2026). The label
   states origin; `frozen` is carried demo-wide and used as an element label only for assembled
   containers; composite items carry per-part labels (DM-2). Viewers trigger no live AI calls at
   any point.

## Current V-Model state

| Level | Artefact | Status |
|---|---|---|
| L1 | User requirements R1–R8 | **Approved at G1, 16 Sept 2026** — frozen, do not edit |
| L2 | System requirements F1–F5, NF1–NF6 | **Approved at G2, 5 Oct 2026** (F5 ships static as `F5-ST`) |
| L3 | Architecture, data contracts | **Approved at G2, 5 Oct 2026** |
| L4 | Module design M1–M10, unit tests | **Approved at G2, 5 Oct 2026**; unit tests written (interactive-F5 tests deferred) |
| L5 | Implementation | Started 5 Oct 2026, tests first, alongside the G3 content run |

**Re-planned 4 Oct 2026. Hard deadline: demo live on GitHub Pages by the morning of 7 Oct 2026.**
**Re-planned again 6 Oct 2026** (the overnight run did not run): the remaining G3 content run is overnight from 03:00 on 7 Oct; a new deadline of the morning of 8 Oct is proposed and awaits Miguel.
**Next gate: G3** content freeze, 7 Oct morning; G4 system pass and deploy, 7 Oct. Decisions and the
proposed defaults are in `docs/gates.md`; the day-by-day plan is in `docs/00-operating-manual.md`.

Gate rule: no level starts before the level above it is approved by Miguel. Gates are decided by
Miguel in claude.ai chat, not by agents. Agents propose; the Red-team Reviewer may block; Miguel
approves. Record every gate outcome in `docs/gates.md`.

Test-first rule: for every module, the Test Engineer writes the paired test from the specification
**before** the Implementer opens that module.

## Stack constraints

- **Vanilla HTML, CSS and JavaScript. No build step, no bundler, no framework, no package manager.**
- **No CDN, no external fonts, no remote images, no analytics.** Everything is in the repository.
- **No `fetch()` and no XHR at runtime.** Frozen content ships as ES modules in `data/`
  (`export default { ... }`), imported as modules. The demo works from GitHub Pages or any local
  static server; from `file://` only in browsers that permit module scripts there (Firefox), and
  elsewhere it shows a clear message and stops (DM-6, 4 Oct 2026).
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
purchased**. From 4 October 2026 **every session and every subagent runs on Opus 5.5
(`claude-opus-5-5`) only**: the main session, all build agents and all runtime agents. No Fable,
no Sonnet, no Haiku, and no model that has to be paid for separately.

Use high effort for judgement-critical work (specification, architecture, rival readings,
interrogation, red-team review, verification) and medium effort for volume work (scanning, tests,
implementation against a written specification, brief editing) to save usage. Watch
Settings → Usage during long runs: when a usage limit is approaching, stop at an artefact boundary,
commit what is finished and resume in the next usage window. Never switch model and never buy
credits to finish an artefact.

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
