# Periscope — Foresight Prototype

A clickable concept demo of a **judgement scaffold** for founding teams: a tool that automates
the scanning and spends the attention it saves on judging, rather than handing the founder a
ranked answer.

Built as a portfolio asset alongside a bachelor's thesis on AI-enabled sensing capabilities in
Austrian start-ups. The demo scenario — **Tracewell**, a fictional four-person observability
start-up in Linz — is set in a real, verifiable environment. No real venture's name is used.

## What makes it different from a signal digest

Every trend arrives with three rival readings — opportunity, threat, noise — each carrying
evidence, counter-evidence and a condition that would disconfirm it. Nothing is ranked. The
founder records a gut reading *before* seeing any AI reading, answers a short interrogation, and
commits a judgement with a rationale. Judgements are reviewed later against what actually
happened.

## How it is built

Specification-first, following the V-Model: each specification on the left arm is the literal
input the next agent executes, and its paired test is written before anything is built. The
V-Model documents live in [`docs/`](docs/) and are part of the portfolio, not a by-product.

- [`docs/01-user-requirements.md`](docs/01-user-requirements.md) — R1–R8, approved at G1
- [`docs/02-system-requirements.md`](docs/02-system-requirements.md) — F1–F4, NF1–NF6
- [`docs/03-architecture.md`](docs/03-architecture.md) — layers, agents, data contracts
- [`docs/04-module-design.md`](docs/04-module-design.md) — M1–M10
- [`docs/test-plan.md`](docs/test-plan.md) — unit through acceptance
- [`docs/traceability.md`](docs/traceability.md) — requirement → function → module → test
- [`docs/gates.md`](docs/gates.md) — gate log

## Running it

Open `index.html`. There is no build step, no dependency install and no network call at runtime —
all content is frozen into ES modules under `data/`.

## Honesty

The demo labels what is real, what is AI-generated, what is frozen, what is fictional and what is
a retrospective replay. Opening it triggers no AI calls.
