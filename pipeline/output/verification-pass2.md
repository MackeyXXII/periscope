# Verification record, second pass (6 October 2026)

This is the Verifier's second pass over the core-loop content before the G3 content freeze. It covers
`signals.json`, `trends.json`, `readings.json`, `interrogations.json`, `brief.json` and
`readiness.json`. Every source named below as opened was fetched on 6 October 2026. No entity file
was edited. A struck item is reported, not repaired: where a correction is proposed, it rewords the
text to match the source already cited and brings in no new source. The Orchestrator decides what
to apply. Hashes are not computed here; the Orchestrator adds them after the last edit.

Verdicts are `pass` or `struck`. An entity is `struck` when any part of it, as the file stands now,
fails a check. The note says which part fails and whether the entity survives once that part is
removed or corrected. A `pass` with a correction means the claim is supported but its wording goes
slightly beyond the cited source, so it should be tightened before freeze.

## 1. Signals (`signals.json`, 16)

Twelve signals carry their pass-1 verdict of `pass` unchanged (see `verification-pass1.md`). The
four edited in commit e160766 were re-checked against their sources.

| Id | Part edited | Source opened | Verdict | Reason |
|---|---|---|---|---|
| sig-2026-07-08-edpb-anonymisation-guidelines | summary | EDPB news item, 8 Jul 2026 | pass | The summary now says only what the page says: adopted at the plenary, three criteria (no record isolation, no linkage, no inference), contextual or simplified approach, consultation until 30 Oct 2026. The guideline number and the 2014 opinion are gone. "July 2026 plenary" is a fair reading of "latest plenary" on a page dated 8 July. |
| sig-2026-08-13-dynatrace-to-acquire-arize | relevance note | scanning brief §2 | pass | The Linz R&D clause is gone. "Observability of AI systems" is a shift the brief lists ("observability of AI systems themselves"). Neutral and fact-only. |
| sig-2026-09-08-palo-alto-observability-arr | relevance note | scanning brief §1 | pass | "First reported figure" is gone. The brief does ask the Scout to watch what follows from the Chronosphere acquisition. |
| sig-2026-09-18-splunk-agent-observability | summary | Splunk blog, 18 Sep 2026 (Dayna Lord) | pass | Token and cost tracking is gone. The page says Agent Observability is available "on premises, or now in Splunk Observability Cloud and through Cisco Cloud Control" (current), describes "built-in support for distributed tracing and OpenTelemetry", and says Cisco completed the Galileo acquisition "earlier this year". The summary matches. |

The pass-1 flag on sig-2026-09-08-austria-nis2-implementation-starts stands: its relevance note
asserts that Tracewell's fictional customers fall under the NISG 2026, which is a fictional premise
and not a sourced fact (the dossier leaves the question open).

## 2. Trends (`trends.json`, 4)

Each summary was compared sentence by sentence with the summaries of its cited signals, and against
the source where the wording differs.

| Id | Verdict | Reason |
|---|---|---|
| trend-ai-agents-in-observability | pass (one correction) | Every figure and date matches its signal (27 Jul, 6 Aug, 13 Aug, 18 Sep, 22 Sep; 915 million; 2,575; a quarter). Grafana's release describes Assistant Investigations as forming hypotheses and chasing leads while engineers "stay in the driver's seat ... or step back", inside an "agentic operations" release, so "investigate incidents themselves" holds. Datadog "launched" an autonomous Bits AI at DASH 2026, so "shipped" holds. One looseness: "three observability vendors announced products", where Dynatrace announced an agreement to acquire a company, not a product of its own. Correction proposed. Lens-neutral. Prompt neutral, no hint. |
| trend-eu-austrian-data-and-security-dates | pass | All dates match the three signals (8 Jul, 30 Oct 2026; 27 Jul, 11 Sep 2026, 11 Dec 2027; 8 Sep, 1 Oct 2026, 1 Jan 2027). No fact beyond the signals. Lens-neutral. Prompt neutral. |
| trend-opentelemetry-default-collection | pass | Elastic 9.3, EDOT, unchanged configurations and OTLP; k8s attributes processor 1.0.0, stable criteria, June 2026 semantic conventions, breaking changes with migration guide; 81 users, 29 to 10 per cent, 49 and 65 per cent. All match. Lens-neutral. Prompt neutral. |
| trend-telemetry-reduction-before-storage | **struck** | The summary matches its two signals. The **intuition prompt** says "some bill only for the data they keep". Only one vendor (Dash0) changed its billing, and Dash0's page says "signals pay a small ingestion fee and storage prices apply only to what you keep", so it is neither "some" nor "only". The **title**, "pricing follows retained data", generalises the same single vendor to the market. Corrections proposed for both. The trend survives once they are applied. Note: Grafana's release does not say where in the pipeline its reduction happens. "Before it is stored" rests on the signal's "decides ... which to drop", which pass 1 accepted. |

## 3. Readings (`readings.json`, 12)

For every evidence and counter-evidence item, the URL, publisher, title and `publishedOn` match the
cited signal, and the retrieval date is 6 Oct 2026. Where a claim went beyond the signal summary, the
source was opened again (Grafana 27 Jul and 4 Aug, Datadog 8-K exhibit, Splunk, USP, Dash0).
Fictional Tracewell facts were checked against `persona-dossier.md`. Every reading has two evidence
and two counter-evidence items, is of similar length (about 95 to 115 words), and is hedged in the
same way ("The signals do not show ..."). No reading is visibly stronger or better supported than its
rivals. Every disconfirming condition names an observable event and a date.

### trend-ai-agents-in-observability

| Reading | Item | Verdict | Reason |
|---|---|---|---|
| noise | ev 1 Dynatrace/Arize 915m, closing window, regulatory review | pass | Matches the signal. |
| noise | ev 2 New Relic quarter-without-monitoring, 2,575, vendor survey | pass | Matches the signal. |
| noise | ce 1 Grafana Assistant Investigations | pass | Matches the source. |
| noise | ce 2 Datadog autonomous Bits AI and Bring Your Own Cloud | pass | The source says "fully autonomous Bits AI for end-to-end incident detection, investigation, and remediation" and "Bring Your Own Cloud for deploying Datadog within customer environments". |
| noise | text | pass (one correction) | "As Dynatrace did with a deal" reads as a completed purchase. The source is an agreement, with closing still pending. Correction proposed. Fictional facts (pipeline as core, assistant an add-on, nine months of runway) match the dossier. |
| noise | disconfirming condition | pass | Observable: a written request from a pilot customer before 31 Mar 2027. |
| opportunity | ev 1 Grafana Agent Observability, OpenTelemetry-native, token usage and cost | pass | Source: "extends Grafana Cloud's OpenTelemetry-native monitoring to the AI systems". |
| opportunity | ev 2 New Relic quarter | pass | Matches. |
| opportunity | ce 1 Dynatrace/Arize 915m | pass | Fact matches. The inference is labelled as one ("so ..."). |
| opportunity | ce 2 Splunk Agent Observability on premises and in its own cloud, OpenTelemetry tracing | pass | Source: "on premises, or now in Splunk Observability Cloud and through Cisco Cloud Control"; "support for distributed tracing and OpenTelemetry". |
| opportunity | text | pass | "What the signals do not show these vendors offering: agent telemetry with personal data removed": neither the Grafana nor the Splunk page mentions removing personal data or EU hosting. Hedged. |
| opportunity | disconfirming condition | pass | Observable: a named vendor's announcement by 31 Mar 2027. |
| threat | ev 1 Grafana Assistant Investigations and Agent Observability | pass | Facts match. "Same ground" is the signal's relevance note, not a sourced claim. |
| threat | ev 2 Dynatrace/Arize 915m, about 815m in cash | pass | Matches. |
| threat | ce 1 New Relic quarter | pass | Matches. |
| threat | ce 2 Splunk OpenTelemetry tracing | pass | Matches the source. |
| threat | text | pass | "A third of one engineer's time" matches the dossier (a third of Selin's time). |
| threat | disconfirming condition | pass | Observable: renewal with the assistant in use by 31 Mar 2027. |

### trend-eu-austrian-data-and-security-dates

| Reading | Item | Verdict | Reason |
|---|---|---|---|
| noise | ev 1 CRA guidance non-binding, 11 Sep 2026, 11 Dec 2027 | pass | Matches. |
| noise | ev 2 EDPB consultation until 30 Oct 2026 | pass | Matches. |
| noise | ce 1 NISG 2026 dates, Federal Office | pass (one correction) | Dates and office match. The source (8 Sep) says the act "tritt am 1. Oktober 2026 in Kraft"; the claim says it "entered into force", which is past tense the source cannot attest. Correction proposed: restate it as the source does. |
| noise | ce 2 CRA guidance covers remote data processing and FOSS, reporting since 11 Sep | pass | Matches. "The two forms in which Tracewell delivers" is a fictional gloss consistent with the dossier. |
| noise | text | pass | "The third is a draft still open for comment" fits guidelines under public consultation. |
| noise | disconfirming condition | pass | Observable: a written request citing the NISG 2026 before 31 Jan 2027. |
| opportunity | ev 1 NISG dates | pass | Matches the source's wording ("enters into force"). |
| opportunity | ev 2 EDPB three criteria, consultation | pass | Matches. |
| opportunity | ce 1 CRA guidance, remote processing, FOSS, 11 Sep | pass | Matches. The inference is labelled ("may"). |
| opportunity | ce 2 USP warns of dubious NISG compliance analyses | pass | Source: "Vorsicht vor ... 'NISG-Betroffenheitsanalysen'". |
| opportunity | text | pass | Hedged on whether customers fall under the act. |
| opportunity | disconfirming condition | pass | Observable by 1 Jan 2027. |
| threat | ev 1 CRA scope, dates | pass | Matches. |
| threat | ev 2 EDPB three criteria | pass | Matches. |
| threat | ce 1 CRA non-binding, 67 examples, micro and SMEs | pass | Matches pass-1 check. |
| threat | ce 2 NISG duties on entities, no direct supplier duty "as summarised" | pass | Re-opened: the page names no duty on suppliers, supply chains or service providers. |
| threat | text | pass (one correction) | "Austria's NISG 2026 entered into force on 1 October" has the same tense issue as noise ce 1. Correction proposed. "No legal advice" matches the dossier. |
| threat | disconfirming condition | pass | Observable by 31 Mar 2027. |

### trend-opentelemetry-default-collection

| Reading | Item | Verdict | Reason |
|---|---|---|---|
| noise | ev 1 k8s processor 1.0.0, breaking changes, migration guide | pass | Matches. |
| noise | ev 2 survey 81, 29 to 10, 49 per cent | pass | Matches. |
| noise | ce 1 Elastic 9.3 on own Collector distribution, OTLP | pass | Matches. |
| noise | ce 2 65 per cent vanilla, without vendor distributions | pass | Matches. "Bears directly on the Collector distribution Tracewell ships" is correct, since Tracewell ships a vendor distribution. |
| noise | text, disconfirming condition | pass | "Jakob's upgrade routine" is fictional and consistent with the dossier. The condition (a pilot replaces the distribution before 31 Mar 2027) is observable. |
| opportunity | ev 1 k8s processor, June 2026 semantic conventions | pass | Matches. |
| opportunity | ev 2 survey 29 to 10, 49 | pass | Matches. |
| opportunity | ce 1 65 per cent vanilla | pass | Matches. |
| opportunity | ce 2 Elastic | pass | Matches. |
| opportunity | text, disconfirming condition | pass | The condition (a further breaking change by 30 Jun 2027) is observable. |
| threat | ev 1 Elastic 9.3, EDOT, receivers, OTLP | pass | Matches. |
| threat | **ev 2** survey, 65 per cent vanilla, "which is the form in which Tracewell packages its Collector" | **struck** | The survey figure is right. The relative clause attaches to "vanilla components without vendor distributions", which is false of Tracewell: the dossier says Tracewell ships its own OpenTelemetry Collector distribution, which is a vendor distribution. The reading text repeats the ambiguity ("... without vendor distributions, the kind of product Tracewell ships"). Corrections proposed for both. **The reading survives without this item:** ev 1 (Elastic) and both counter-evidence items remain. |
| threat | ce 1 k8s processor stable | pass | Matches. The inference is labelled. |
| threat | ce 2 Dash0 "an OpenTelemetry-native start-up", pre-storage pipeline, retained-data billing | pass | Pipeline and billing match the changelog. The changelog does not itself call Dash0 OpenTelemetry-native; that descriptor rests on the dossier's sourced Series B page (23 Mar 2026). Acceptable as context. |
| threat | disconfirming condition | pass | Observable: a new customer names the distribution as a reason, by 30 Jun 2027. |

### trend-telemetry-reduction-before-storage

| Reading | Item | Verdict | Reason |
|---|---|---|---|
| noise | ev 1 Grafana 30 to 50 per cent, own statement | pass | Matches pass-1 check. Re-opened: the figure is the company's claim about named customers. |
| noise | ev 2 Dash0 filters, samples, aggregates before storage | pass | Matches. |
| noise | ce 1 Dash0 small ingestion fee plus retained storage, customer Kubernetes | pass | Source: "signals pay a small ingestion fee and storage prices apply only to what you keep". |
| noise | ce 2 Grafana four signals | pass | Matches. |
| noise | text, disconfirming condition | pass | Observable before 31 Mar 2027. |
| opportunity | ev 1, ev 2, ce 1, ce 2 | pass | All match. "Funded" Dash0 rests on the dossier's sourced Series B. "Bills mainly for retained data" in the text is a fair reading of "a small ingestion fee". |
| opportunity | disconfirming condition | pass | Observable: Dash0 returns to ingest billing by 30 Jun 2027. |
| threat | ev 1 Grafana, ev 2 Dash0 | pass | Match. |
| threat | ce 1 EDPB criteria; neither announcement addresses removing personal data | pass | The EDPB part matches. Re-opened both vendor pages: neither mentions removing, masking or redacting personal data. Note: that second sentence is supported by the Grafana and Dash0 pages, not by the EDPB page the item cites. It is hedged "as summarised in the signals". |
| threat | ce 2 New Relic five vs four tools, half prefer one platform | pass | Matches. |
| threat | disconfirming condition | pass | Observable by 30 Jun 2027. |

### Reading verdicts

reading-opentelemetry-default-collection-threat: **struck** (ev 2 struck; it survives with one
evidence and two counter-evidence items once ev 2 is corrected or removed). The other 11 readings:
pass, with corrections proposed on reading-ai-agents-in-observability-noise (text),
reading-eu-austrian-data-and-security-dates-noise (ce 1) and
reading-eu-austrian-data-and-security-dates-threat (text).

## 4. Interrogations (`interrogations.json`, 4)

All 24 items are questions. None gives advice, none points towards a lens, and the pre-mortems are
symmetric ("your judgement ... turned out to be wrong").

| Id | Verdict | Reason |
|---|---|---|
| interrogation-ai-agents-in-observability | **struck** | provenance-one says "All five signals come from vendors describing their own products". New Relic's signal is a survey report, not a product description, and Dynatrace's is an acquisition agreement. The trend summary itself says only "all published by vendors". Correction proposed. The other five questions pass: the Arize closing question matches the signal's "closing expected", and the pilot-customer questions match the dossier. |
| interrogation-eu-austrian-data-and-security-dates | pass | "Open for comment until 30 October 2026" matches the signal. |
| interrogation-opentelemetry-default-collection | pass | "81 users" and "migration guide" match the signals. |
| interrogation-telemetry-reduction-before-storage | pass | "The 30 to 50 per cent saving is Grafana Labs' own statement" matches. The Dash0 page does refer to "the pricing page for rates", so the question is answerable. |

## 5. Brief (`brief.json`)

**pass.** All five ids exist in `signals.json`. There are no more than five, and there is no ranking
marker or score. The order is newest first, then by id within a date: 09-22 new-relic before 09-22
otel-prometheus, then 09-18, 09-08 and 09-07. The label `frozen` is used for an assembled container,
as DM-2 allows. Observation for the Orchestrator: the five are not simply the five newest signals,
because 09-16 (k8s processor), 09-10 (Plug and Play) and 09-08 (Palo Alto) are left out. The order is
by date, but the selection is the Brief Editor's own, and the record should say on what basis it was
made, so that a viewer does not read the selection as a ranking.

## 6. Readiness (`readiness.json`)

| Check | Verdict | Reason |
|---|---|---|
| 15 answers and 5 findings verbatim from `persona-dossier.md` | pass | Compared word for word, including the punctuation. |
| Label | pass | The container is `fictional`, and the framework citation is labelled `real`. The answers and findings carry no per-part label, so they take the `fictional` container label. That fits the dossier's decision of 5 Oct, but the UI must show it on each part. |
| No candidate level names | pass | All three `levelName` are `LEVEL_NAME_UNVERIFIED` and `maturity.status` is `unverified`. Not touched. |
| Jöhnk et al. citation date | **struck** | `publishedOn` is `2026-10-05`, which is the dossier's retrieval date. The DOI https://doi.org/10.1007/s12599-020-00676-7 resolves (302) to link.springer.com/article/10.1007/s12599-020-00676-7. The page, opened on 6 Oct 2026, gives the title "Ready or Not, AI Comes— An Interview Study of Organizational AI Readiness Factors", authors Jan Jöhnk, Malte Weißert and Katrin Wyrtki, journal *Business & Information Systems Engineering*, volume 63, issue 1, pages 5–20 (2021), publisher Springer Nature, **published online 22 December 2020**, open access. Correction proposed: `publishedOn` 2020-12-22, `publisher` Springer Nature. The "(2021)" in the framework name is the issue year and is correct as a citation year. |

The readiness entity is **struck** only because of the citation date. Everything else passes.

## 7. Ranking audit

A case-insensitive search of the six files for `score`, `rank`, `confiden`, `priorit`, `best`,
`most important`, `top` and `recommend` found no field and no wording of that kind. Its one hit was
"stop" in a readiness question, which is a false match. The readings are stored in the order of their
lens names and trends by id, the trend reading references follow the fixed schema order (opportunity,
threat, noise), and the brief is ordered by date. Nothing is ordered by importance.

## Summary

- Struck: trend-telemetry-reduction-before-storage (prompt and title),
  reading-opentelemetry-default-collection-threat (ev 2 and matching text),
  interrogation-ai-agents-in-observability (provenance-one), readiness-tracewell (citation date).
  Every one of them survives once the correction is applied or the struck part is dropped.
- Pass with a correction: trend-ai-agents-in-observability, reading-ai-agents-in-observability-noise,
  reading-eu-austrian-data-and-security-dates-noise, reading-eu-austrian-data-and-security-dates-threat.
- Pass: all 16 signals (the four edited ones now say only what their sources support), the other
  trends, readings and interrogations, and the brief.
