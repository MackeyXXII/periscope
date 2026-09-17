# Operating manual

How this repository is worked. Read `CLAUDE.md` first — it holds the invariants that override
everything here.

## The V-Model as it runs here

Each specification on the left arm is the literal input the next agent executes, and its paired
test on the right arm is written before anything is built. Miguel approves each level at a gate.

```mermaid
flowchart LR
  R["L1 User requirements"] --> S["L2 System requirements"]
  S --> A["L3 Architecture"]
  A --> M["L4 Module design"]
  M --> I["L5 Implementation"]
  I --> UT["Unit tests"]
  UT --> IT["Integration test"]
  IT --> ST["System test"]
  ST --> AT["Acceptance test"]
```

## Who does what

| Agent | Layer | Surface | Model | Role |
|---|---|---|---|---|
| Orchestrator | Build | Claude Code main session | Fable 5.1, then Opus 5 | Holds V-Model state, dispatches subagents, enforces gates; writes no code itself |
| Requirements Engineer | Build | Subagent | Fable 5.1 | R-level into F-level specification and the traceability matrix |
| Architect | Build | Subagent | Fable 5.1 | Architecture, JSON data contracts, module specifications |
| Test Engineer | Build | Subagent | Sonnet 5 | Writes each paired test from its specification before implementation, then runs it |
| Implementer | Build | Subagent | Sonnet 5 (Opus 5 for complex modules) | Builds modules against their specifications |
| Red-team Reviewer | Build | Subagent | Fable 5.1, then Opus 5 | Enforces R3 and R4 invariants and honesty labels; can block a gate |
| Scout | Runtime | Subagent with web tools | Sonnet 5 | Horizon scanning against the scanning brief; signal cards with provenance |
| Trend Analyst | Runtime | Subagent | Opus 5 | Clusters signals into candidate trends with momentum notes |
| Rival Readers (three lenses) | Runtime | Subagents | Fable 5.1 | Opportunity, threat and noise readings, each with evidence, counter-evidence and a disconfirming condition |
| Interrogator | Runtime | Subagent | Fable 5.1 | Provenance checks, assumption probes, pre-mortem, intuition prompts |
| Verifier | Runtime | Subagent | Opus 5 | Checks every claim against its source, strikes the unverifiable, rejects any ranking |
| Brief Editor | Runtime | Subagent | Sonnet 5 | Compresses output to fit R1's attention budget |
| Persona and Brief Researcher | Support | Claude Cowork | Opus 5 | Persona dossier, scanning brief, replay candidates |
| Packager | Support | Claude Cowork | Opus 5 | Walkthrough script and a one-page outreach note |

Runtime agents run **once, offline**, before G3. Their output lands in `pipeline/output/`, is
verified, then frozen into `data/`. Nothing in that layer ever runs for a viewer.

## Session pattern

1. Open Claude Code in the repository root. The main session is the Orchestrator.
2. Orchestrator states the current level, the gate it is working towards and the entry criteria.
3. Orchestrator dispatches one subagent per artefact, with the specification as the literal input.
4. Test Engineer writes the paired test before the Implementer opens the module.
5. Red-team Reviewer audits against `CLAUDE.md` and either signs off or blocks.
6. Orchestrator reports to Miguel in claude.ai chat; Miguel decides the gate; the outcome is
   recorded in `docs/gates.md`.

## Schedule

| When | Work | Gate |
|---|---|---|
| 16 Sept | Requirements and assumptions approved | G1 (done) |
| 17 Sept | Repository and CLAUDE.md; Cowork builds persona and scanning brief in parallel; Requirements Engineer and Architect produce levels 2 to 4 and the test plan | G2 |
| 18 Sept | Runtime pipeline runs once: Scout and Trend Analyst on included models, Rival Readers and Interrogator on Fable, then Verifier | G3 content freeze |
| 19 Sept | Red-team review of frozen content and the core-loop specification; remaining credits on Fable review of the traceability matrix | — |
| From 20 Sept | Module-by-module build, tests first, then integration, system test and acceptance | G4, G5 |
| After thesis interviews | Anonymised insights, under the consent clause, feed a second pass starting again at Level 1 | New G1 |

## Risks held open

| Risk | Mitigation |
|---|---|
| Drift into ranked recommendations | Invariants in `CLAUDE.md`; Red-team Reviewer can block any gate |
| Fabricated or stale signals | Verifier checks every claim; NF2 provenance; dated real outcome sources in the replay |
| Credits exhausted mid-run | Opus 5 fallback; Fable output re-checked after 19 Sept |
| Demo reads as a thesis summary, not a product | Packager's walkthrough script; acceptance by real viewers |
| Unfair or inaccurate portrayal of Dynatrace | Persona brief limited to verifiable public facts; neutral framing reviewed at G3 |
| Copyright in sourced material | Short quotes only, paraphrase by default, links to originals |
| Build competes with Chapter 3 writing | From 20 Sept, work in scheduled five-hour blocks around thesis time |
