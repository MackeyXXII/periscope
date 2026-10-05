# Scanning brief for the Scout

Written by the Persona and Brief Researcher (Opus 5.5) on 5 October 2026, after G2. This is what
the Scout scans against in its one offline run before the G3 content freeze. Read `CLAUDE.md` and
`pipeline/briefs/persona-dossier.md` first.

## Whom the scan is for

The scan serves Tracewell, a fictional four-person observability start-up in Linz, Austria, described
in the persona dossier. The venture is invented; the signals must be real. Every signal the Scout
returns is a real, dated, linked publication. A fabricated signal is a project-ending defect, and a
short list of real signals is always preferable to a full list with one doubtful item.

## Time window

Window: 2026-07-01 to 2026-09-30

The weekly brief in the demo is frozen at G3 in early October 2026, so the Scout looks at the
quarter before the freeze. A source published outside the window may be used only where it is
needed to make sense of a signal inside it, and then carries a `windowNote` (M3-U3). This window
does not overlap the replay window (1 January to 31 March 2026), which belongs to the decision log
and is covered by `replay-candidates.md`, not by this scan.

## What to scan

The five areas below are listed in the order the briefs README names them. The order says nothing
about which area matters more, and the Scout returns signals without ordering, rating or
clustering them.

### 1. Incumbents and competitors

Watch the observability vendors that a Linz OpenTelemetry-native start-up shares a market with,
and describe each only in verifiable public fact, in neutral words.

- **Dynatrace.** Its own filings and press releases. Public facts to anchor on: corporate
  headquarters in Boston, primary research and development facility in Linz with an expansion
  planned for occupancy later in 2026, about 5,600 employees at 31 March 2026 (Form 10-K, filed
  2026-05-20). Its fiscal first quarter of 2027 ended on 30 June 2026 and was reported on
  2026-08-05. Dynatrace is portrayed factually and neutrally: no characterisation of its strategy,
  culture or prospects that its own or an independent dated source does not state.
- **The other vendors Dynatrace names as principal competitors:** Cisco (including AppDynamics and
  Splunk), Datadog, Elastic, Grafana Labs and New Relic.
- **Consolidation:** Palo Alto Networks completed its acquisition of Chronosphere on 2026-01-29;
  watch what follows from it inside the window.
- **OpenTelemetry-native start-ups**, such as Dash0, which announced a Series B on 2026-03-23.

### 2. Technology shifts

- **OpenTelemetry** after its CNCF graduation, announced on 2026-05-21: stability of signals and
  semantic conventions, the profiles signal (alpha at graduation), the Collector, and vendor
  adoption of OTLP as an ingest format.
- **Prometheus and OpenTelemetry interoperability**, which Grafana Labs' 2026 survey found most
  organisations invest in side by side.
- **AI in observability:** agentic incident response and remediation features announced by
  vendors, and observability of AI systems themselves.
- **Telemetry cost control:** sampling, pipelines and volume reduction, since cost was the most
  cited selection criterion in the same survey.

### 3. Regulation

Real EU and Austrian law, with dates. Prefer the official text or the institution's own page to a
commentary.

- **AI Act**, Regulation (EU) 2024/1689, and the **Digital Omnibus on AI**, Regulation (EU)
  2026/1744, published 2026-07-24, which moved the application dates for high-risk AI systems.
- **GDPR**, Regulation (EU) 2016/679, and the separate **Digital Omnibus** proposal of 19 November
  2025 that would amend it (procedure 2025/0360(COD)).
- **Cyber Resilience Act**, Regulation (EU) 2024/2847: reporting obligations for manufacturers
  apply from 11 September 2026, inside the window; ENISA's single reporting platform and the
  Commission's guidance are the sources to watch.
- **NIS2**, Directive (EU) 2022/2555, and its Austrian transposition, the **NISG 2026** (BGBl. I Nr.
  94/2025), which applies from 1 October 2026, the day after the window closes. Preparatory guidance
  published inside the window is in scope.
- **Data Act**, Regulation (EU) 2023/2854, applicable since 12 September 2025, for cloud switching and
  data access rules that touch a hosted telemetry service.

Regulatory sources found here also feed the governance argument (Q-5), so record each with its
exact title, its date and the institution that published it.

### 4. Funding and talent

- **Austrian start-up funding:** EY's start-up barometers for Austria; the planned Austrian
  fund-of-funds for start-ups; the Austria Wirtschaftsservice (aws) pre-seed and seed programmes.
- **Upper Austria and Linz:** the tech2b incubator; graduates and programmes of Johannes Kepler
  University Linz and IT:U; hiring and site news from Dynatrace in Linz.
- **European observability funding rounds and acquisitions**, as context for how investors read
  the market.

### 5. Customer behaviour

- How engineering teams choose and pay for observability: surveys such as Grafana Labs' annual
  observability survey and the CNCF's own surveys.
- Whether buyers ask for EU hosting, data residency or open standards, and what they say about
  vendor lock-in and cost.
- What NIS2-affected Austrian companies ask of their software suppliers, as documented by the
  Austrian Economic Chamber (WKO) or comparable bodies.

## Sources worth watching

Each is listed with a URL in the Named entities table below. In short:

- **Official registers and institutions:** EUR-Lex; the Council of the European Union; the European
  Parliament's Legislative Train; the European Commission's digital strategy pages; ENISA; the
  EDPB; the Austrian legal information system RIS; WKO.
- **Open-source projects:** the OpenTelemetry blog and the CNCF announcements.
- **Company filings and press pages:** SEC EDGAR for Dynatrace and Datadog; the press pages of
  Grafana Labs, Palo Alto Networks and Dash0.
- **Funding and ecosystem:** EY Austria; Austria Wirtschaftsservice; tech2b.

## Rules the Scout follows (restated from `CLAUDE.md` and the Scout's instructions)

- Every signal carries a source URL, a publication date, a retrieval date, a paraphrased summary
  and a one-line relevance note tied to this brief. Quotes are at most 15 words.
- Use the **Name** column of the Named entities table below as the `publisher` string wherever the
  publisher is listed there, so that M2-U2 can match it. If a signal's publisher is not listed,
  report it so that this table can be extended before G3; do not invent a row.
- No ordering by importance, no scores, no "most important" flag, and no lens words (opportunity,
  threat, noise and their relatives) in relevance notes (M3-U6).
- Dynatrace and every other named company: verifiable public facts only, neutrally worded.

## Named entities

Date is the publication date of the cited source; for standing pages without one (the aws,
tech2b, JKU and IT:U pages) it is the retrieval date, 2026-10-05. Two sources returned an access
error when fetched and were confirmed only through a search index listing that showed their title,
URL and date: the Council of the European Union press release and the CNBC article. The Verifier
re-checks both.

| Name | Kind | Source URL | Date |
|---|---|---|---|
| Dynatrace | incumbent | https://www.sec.gov/Archives/edgar/data/0001773383/000177338326000019/dt-20260331.htm | 2026-05-20 |
| Datadog | incumbent | https://www.sec.gov/Archives/edgar/data/1561550/000162828026006645/ex-991x20251231x8k.htm | 2026-02-10 |
| Grafana Labs | incumbent | https://grafana.com/press/2026/02/03/grafana-labs-caps-a-breakout-year-of-growth-and-product-innovation/ | 2026-02-03 |
| Cisco | incumbent | https://www.sec.gov/Archives/edgar/data/0001773383/000177338326000019/dt-20260331.htm | 2026-05-20 |
| Elastic | incumbent | https://www.sec.gov/Archives/edgar/data/0001773383/000177338326000019/dt-20260331.htm | 2026-05-20 |
| New Relic | incumbent | https://www.sec.gov/Archives/edgar/data/0001773383/000177338326000019/dt-20260331.htm | 2026-05-20 |
| Palo Alto Networks | incumbent | https://www.paloaltonetworks.com/company/press/2026/palo-alto-networks-completes-chronosphere-acquisition--unifying-observability-and-security-for-the-ai-era | 2026-01-29 |
| Chronosphere | competitor | https://www.paloaltonetworks.com/company/press/2026/palo-alto-networks-completes-chronosphere-acquisition--unifying-observability-and-security-for-the-ai-era | 2026-01-29 |
| Dash0 | competitor | https://www.dash0.com/blog/dash0-raises-usd110m-series-b | 2026-03-23 |
| OpenTelemetry | standard | https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation-solidifying-status-as-the-de-facto-observability-standard/ | 2026-05-21 |
| Prometheus | technology | https://grafana.com/press/2026/03/18/grafana-labs-4th-annual-observability-survey-reveals-a-field-at-a-crossroads-ai-economics-complexity-and-the-enduring-power-of-open-source/ | 2026-03-18 |
| CNCF | publication | https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation-solidifying-status-as-the-de-facto-observability-standard/ | 2026-05-21 |
| AI Act | regulation | https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng | 2024-07-12 |
| Digital Omnibus on AI | regulation | https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng | 2026-07-24 |
| Digital Omnibus | regulation | https://www.europarl.europa.eu/legislative-train/theme-a-new-plan-for-europe-s-sustainable-prosperity-and-competitiveness/file-digital-package | 2026-09-20 |
| GDPR | regulation | https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng | 2016-05-04 |
| Cyber Resilience Act | regulation | https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng | 2024-11-20 |
| NIS2 Directive | regulation | https://eur-lex.europa.eu/eli/dir/2022/2555/oj/eng | 2022-12-27 |
| NISG 2026 | regulation | https://www.ris.bka.gv.at/eli/bgbl/I/2025/94 | 2025-12-23 |
| Data Act | regulation | https://eur-lex.europa.eu/eli/reg/2023/2854/oj/eng | 2023-12-22 |
| EUR-Lex | publication | https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng | 2026-07-24 |
| Council of the European Union | publication | https://www.consilium.europa.eu/en/press/press-releases/2026/03/13/council-agrees-position-to-streamline-rules-on-artificial-intelligence/ | 2026-03-13 |
| European Parliament | publication | https://www.europarl.europa.eu/legislative-train/theme-a-new-plan-for-europe-s-sustainable-prosperity-and-competitiveness/file-digital-package | 2026-09-20 |
| European Commission | publication | https://digital-strategy.ec.europa.eu/en/news/commission-publishes-feedback-draft-guidance-assist-companies-applying-cyber-resilience-act | 2026-03-03 |
| ENISA | publication | https://www.enisa.europa.eu/news/the-cra-single-reporting-platform-is-launched | 2026-09-11 |
| EDPB | publication | https://www.edpb.europa.eu/news/news/2026/digital-omnibus-edpb-and-edps-support-simplification-and-competitiveness-while_en | 2026-02-11 |
| RIS | publication | https://www.ris.bka.gv.at/eli/bgbl/I/2025/94 | 2025-12-23 |
| WKO | publication | https://www.wko.at/it-sicherheit/nis2-uebersicht | 2026-10-05 |
| SEC EDGAR | publication | https://www.sec.gov/Archives/edgar/data/0001773383/000177338326000019/dt-20260331.htm | 2026-05-20 |
| CNBC | publication | https://www.cnbc.com/2026/02/06/ai-anthropic-tools-saas-software-stocks-selloff.html | 2026-02-06 |
| EY Austria | publication | https://www.ey.com/de_at/newsroom/2026/07/start-up-barometer-h1-26 | 2026-07-08 |
| Austria Wirtschaftsservice | publication | https://www.aws.at/en/aws-preseed-innovative-solutions/ | 2026-10-05 |
| tech2b | publication | https://www.tech2b.at/ | 2026-10-05 |
| Johannes Kepler University Linz | publication | https://www.jku.at/en/degree-programs/types-of-degree-programs/bachelors-and-diploma-degree-programs/ba-artificial-intelligence/ | 2026-10-05 |
| IT:U Interdisciplinary Transformation University Austria | publication | https://it-u.at/en/digital-transformation-university/ | 2026-10-05 |
