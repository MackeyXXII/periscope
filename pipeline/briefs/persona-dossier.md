# Persona dossier: Tracewell

Written by the Persona and Brief Researcher (Opus 5.5) on 5 October 2026, after G2. Input to the
runtime pipeline and to the readiness profile (F3). Read `CLAUDE.md` first; its invariants govern
this file.

## How to read this dossier

Tracewell is a fictional company. It does not exist, and its founders, customers, numbers, answers
and findings below are invented for the Periscope demo and carry the label `fictional`. No real
venture's name is used. Everything around Tracewell is real: the incumbents, the open-source
projects, the EU and Austrian law, and the Austrian funding context are described from public
sources, each cited with a URL and a date in the text and in the Named entities table at the end.

Two kinds of statement therefore sit side by side, and the dossier keeps them apart:

- **Fictional** statements describe the team: who they are, what they build, what they answered
  and what the answers show. They are not sourced, because there is nothing to source.
- **Real** statements describe the world the team works in. Each is sourced. Where a real claim
  could not be verified it was left out rather than softened.

Nothing in this dossier ranks, scores or orders options. Where a list appears, its order is the
order of writing and says nothing about importance.

## The venture (fictional)

**Tracewell** is a fictional four-person observability start-up in Linz, Austria, as it stands in
early 2026. It sells an OpenTelemetry-native telemetry pipeline with an EU-hosted backend to
mid-sized software teams, many of them suppliers to Upper Austrian industry. The product takes
traces, metrics and logs that customers already emit through OpenTelemetry, removes or
pseudonymises personal data in the pipeline before storage, cuts volume by sampling and
aggregation, and stores the result in an EU data centre. A small assistant answers questions about
incidents over the stored telemetry; it is an add-on, not the core of the product.

**The founding team (fictional).** Four founders, each with one role. They are referred to by first
name only.

- **Anna**, CEO. Previously a product manager for an industrial automation software vendor. Owns
  customers, funding and the company's legal obligations.
- **Jakob**, CTO. Previously a site reliability engineer. Owns the pipeline, the backend and the
  OpenTelemetry Collector distribution the team ships to customers.
- **Selin**, data and AI engineer. Owns the incident assistant, the redaction rules and the team's
  own internal data.
- **Matthias**, field engineer and customer success. Installs pilots, writes documentation and
  hears most of what customers say.

**Stage and funding position (fictional).** Incorporated in 2025 and self-funded by the founders'
savings and two paid pilots. No outside investor. The team is preparing a pre-seed round and an
application to the public pre-seed grant described below, and has not yet submitted either. Runway
at the start of 2026 is about nine months at current salaries.

**Customers (fictional, unnamed).** Two paying pilots and one unpaid trial, all in Upper Austria: a
logistics software house, a supplier of machine-monitoring software to manufacturers, and a
municipal IT service provider (the unpaid trial). None of them is named, because none of them
exists.

## The real environment

Each statement in this section is real and sourced. The Named entities table repeats every source.

**Dynatrace.** Dynatrace, Inc. reports its corporate headquarters in Boston, Massachusetts, and its
primary research and development facility in Linz, Austria, with an expansion of that facility
planned for occupancy later in 2026 (Form 10-K for the fiscal year ended 31 March 2026, filed
2026-05-20, https://www.sec.gov/Archives/edgar/data/0001773383/000177338326000019/dt-20260331.htm).
The same filing reports about 5,600 employees at 31 March 2026, of whom about 28 per cent were in
Austria; annual recurring revenue of 2,054 million US dollars; and total fiscal-2026 revenue of
2,018 million US dollars. It describes its OpenPipeline ingest as taking data from sources such as
OpenTelemetry, and names Cisco (including AppDynamics and Splunk), Datadog, Elastic, Grafana and New
Relic as its principal competitors. Dynatrace's earlier registration statement records that its
chief technology officer co-founded dynaTrace Software GmbH in 2005
(https://www.sec.gov/Archives/edgar/data/1773383/000119312519189566/d668054ds1.htm, 2019). For a
Linz start-up, Dynatrace's main research site is in the same city and its platform serves the same
market. The dossier states this as context, not as a contest.

**Other vendors.** Datadog reported fiscal-2025 revenue of 3.43 billion US dollars, up 28 per cent,
on 2026-02-10 (https://www.sec.gov/Archives/edgar/data/1561550/000162828026006645/ex-991x20251231x8k.htm).
Grafana Labs reported annual recurring revenue above 400 million US dollars and more than 7,000
customers on 2026-02-03, and described itself as a large contributor to OpenTelemetry and
Prometheus (https://grafana.com/press/2026/02/03/grafana-labs-caps-a-breakout-year-of-growth-and-product-innovation/).
Palo Alto Networks completed its acquisition of the observability company Chronosphere on
2026-01-29 (https://www.paloaltonetworks.com/company/press/2026/palo-alto-networks-completes-chronosphere-acquisition--unifying-observability-and-security-for-the-ai-era).
Dash0, an observability start-up built natively on OpenTelemetry, founded in Germany in 2023 and now
headquartered in New York, announced a 110 million US dollar Series B on 2026-03-23
(https://www.dash0.com/blog/dash0-raises-usd110m-series-b).

**OpenTelemetry.** OpenTelemetry was formed in 2019 from the merger of OpenTracing and OpenCensus.
The Cloud Native Computing Foundation announced its graduation on 2026-05-21
(https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation-solidifying-status-as-the-de-facto-observability-standard/).
In early 2026, the period this dossier describes, the project was still incubating. Grafana Labs'
fourth observability survey (1,363 respondents, fieldwork 1 October 2025 to 6 January 2026,
published 2026-03-18) reported that 65 per cent of organisations invest in both Prometheus and
OpenTelemetry, and that respondents gave ease of adoption and freedom to switch vendors as their
reasons for adopting OpenTelemetry
(https://grafana.com/press/2026/03/18/grafana-labs-4th-annual-observability-survey-reveals-a-field-at-a-crossroads-ai-economics-complexity-and-the-enduring-power-of-open-source/).

**EU and Austrian law, as it stood in early 2026.**

- The AI Act, Regulation (EU) 2024/1689, was published on 2024-07-12. It applies in general from 2
  August 2026, with chapters I and II applying from 2 February 2025 and the general-purpose AI
  rules from 2 August 2025 (https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng).
- The GDPR, Regulation (EU) 2016/679, has applied since 25 May 2018
  (https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng, published 2016-05-04).
- The NIS2 Directive, (EU) 2022/2555, was to be transposed by 17 October 2024
  (https://eur-lex.europa.eu/eli/dir/2022/2555/oj/eng, published 2022-12-27). Austria transposed it
  as the NISG 2026, published in the Federal Law Gazette as BGBl. I Nr. 94/2025 on 2025-12-23
  (https://www.ris.bka.gv.at/eli/bgbl/I/2025/94). The Austrian Economic Chamber states that the
  NISG 2026 applies from 1 October 2026 and that affected entities register by 31 December 2026
  (https://www.wko.at/it-sicherheit/nis2-uebersicht, page dated 2026-10-05).
- The Cyber Resilience Act, Regulation (EU) 2024/2847, was published on 2024-11-20. Its reporting
  obligations for manufacturers apply from 11 September 2026 and its main obligations from 11
  December 2027 (https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng).
- The Data Act, Regulation (EU) 2023/2854, applies from 12 September 2025
  (https://eur-lex.europa.eu/eli/reg/2023/2854/oj/eng, published 2023-12-22).

**Austrian start-up and funding context.** EY reported on 2026-03-25 that start-ups in Austria raised
253 million euros in 2025, 56 per cent less than in 2024, across 148 rounds
(https://www.ey.com/de_at/newsroom/2026/03/european-start-up-barometer-25). The Austria
Wirtschaftsservice programme aws Preseed – Innovative Solutions offers grants of up to 89,000 euros
for a first proof of concept, to teams before incorporation or up to six months after registration
(https://www.aws.at/en/aws-preseed-innovative-solutions/, retrieved 2026-10-05). In Linz, tech2b is
the Upper Austrian start-up incubator (https://www.tech2b.at/, retrieved 2026-10-05); Johannes
Kepler University Linz offers a bachelor's programme in artificial intelligence taught in English
(https://www.jku.at/en/degree-programs/types-of-degree-programs/bachelors-and-diploma-degree-programs/ba-artificial-intelligence/,
retrieved 2026-10-05); and IT:U Interdisciplinary Transformation University Austria is a public
university in Linz dedicated to digital transformation
(https://it-u.at/en/digital-transformation-university/, retrieved 2026-10-05).

## Decisions the team faces in early 2026 (fictional)

These are the open questions on the founders' table in January to March 2026. They are written as
questions, in no particular order, and the dossier answers none of them.

- **How far to stay OpenTelemetry-only.** Whether to accept only OpenTelemetry data, or also to
  build proprietary agents for customers whose systems do not emit it.
- **What to do about the incident assistant.** Whether to grow the assistant into autonomous
  remediation, keep it as a question-answering add-on, or drop it, while larger vendors announce
  agentic features of their own.
- **How the regulations reach Tracewell.** Whether the Collector distribution the team ships is a
  product with digital elements under the Cyber Resilience Act and so falls under the reporting
  obligations from 11 September 2026; whether any part of the assistant touches AI Act obligations;
  and whether customers in NIS2 sectors will ask Tracewell for supply-chain assurances once the
  NISG 2026 applies. The founders have not yet taken legal advice on any of these.
- **How to fund the next twelve months.** Whether to raise a pre-seed round in a market that raised
  far less in 2025 than in 2024, to apply for the aws Preseed grant, to extend runway on pilot
  revenue, or to combine these.
- **Where to look for the next customers.** Whether to stay with Upper Austrian industrial
  suppliers, or move to software companies elsewhere in the EU that want EU-hosted telemetry.
- **Whom to hire, and against whom.** Whether a fifth person should be an engineer or a salesperson,
  given that Dynatrace's main research site is in Linz and that two Linz universities offer
  digital and AI programmes.

## Readiness profile (fictional answers and findings)

The five categories of AI readiness come from Jöhnk, Weißert and Wyrtki (2021), "Ready or Not, AI
Comes — An Interview Study of Organizational AI Readiness Factors", Business & Information Systems
Engineering 63(1), 5–20, https://doi.org/10.1007/s12599-020-00676-7, record retrieved 2026-10-05 from
https://aisel.aisnet.org/bise/vol63/iss1/2/. The project's thesis (Appendix A, adapted from Jöhnk et
al., 2021) names them strategic alignment, resources, knowledge, culture and data, and the schema
keys follow it (DM-8). The categories appear below in that source order, which is not an order of
importance.

The questions are the dossier's own prompts for each category; the answers are the founders'
fictional replies; the finding is a short prose reading of the answers. Answers and findings are
labelled `fictional` (Miguel's decision of 5 October 2026). No category carries a grade.

### Strategic alignment

- *Question:* What is AI for, in Tracewell's plan for 2026?
  *Answer:* Two things. Inside the product, the incident assistant. Inside the company, help with
  reading the market: summarising release notes, regulation and competitor news.
- *Question:* Does the plan say what the team would stop doing if AI did not deliver?
  *Answer:* No. Anna has a view, Jakob has a different one, and neither is written down.
- *Question:* Who decides when an AI feature ships?
  *Answer:* Jakob and Selin together, without a written rule.

*Finding.* The founders agree that AI matters to the product and to how they read the market, but
the reasons sit in conversations rather than in the plan. There is no written statement of what AI
is meant to change, and so no way to tell later whether it did.

### Resources

- *Question:* What budget and people go to AI work?
  *Answer:* About a third of Selin's time and a monthly spend on model APIs that the team does not
  track separately from cloud costs.
- *Question:* What compute and tooling do you have?
  *Answer:* Hosted model APIs and the team's own EU cloud account. No dedicated hardware.
- *Question:* How long could you fund AI work if revenue stalled?
  *Answer:* As long as the company itself, about nine months.

*Finding.* AI work depends on one person's part-time effort and on spending nobody separates from
the rest of the cloud bill. The resources exist, but they are not visible as AI resources, which
makes them hard to protect or to cut on purpose.

### Knowledge

- *Question:* Who on the team can build and evaluate AI features?
  *Answer:* Selin can build them. Jakob can judge whether they help in an incident. Nobody has
  evaluated model output systematically.
- *Question:* Who understands how the regulations apply to you?
  *Answer:* Anna has read summaries of the AI Act and the Cyber Resilience Act. Nobody has read the
  texts, and no lawyer has been asked.
- *Question:* Where does new knowledge come from?
  *Answer:* OpenTelemetry community calls, vendor blogs, and former colleagues in Linz.

*Finding.* Building skill is present; evaluation skill and regulatory knowledge are thin and rest
on summaries. What the team knows about the market comes mostly through personal networks, which
are rich in Linz but narrow.

### Culture

- *Question:* How does the team treat a failed experiment?
  *Answer:* It is discussed at the Friday retrospective and usually dropped without a note.
- *Question:* Do customers and founders trust AI output?
  *Answer:* Jakob does not trust the assistant during a live incident. Two pilot customers use it
  after incidents, for write-ups.
- *Question:* Who challenges a founder's reading of the market?
  *Answer:* Whoever disagrees, loudly, in the weekly meeting. Matthias often stays quiet.

*Finding.* The team is open to trying AI and argues freely, but experiments leave no trace and one
voice, the one closest to customers, is heard least. Trust in AI output differs by setting: it is
accepted for reflection after the fact and refused under time pressure.

### Data

- *Question:* What data could AI features use?
  *Answer:* Customer telemetry, after redaction, under each pilot contract; the team's own
  tickets and meeting notes.
- *Question:* What are you allowed to do with customer telemetry?
  *Answer:* The pilot contracts allow processing to run the service. Using it to improve the
  assistant is not mentioned in them.
- *Question:* How good is your own data?
  *Answer:* Tickets are tagged inconsistently and meeting notes are partial.

*Finding.* The data that matters most, customer telemetry, is available for running the service
but not clearly for improving AI features, and the team's own records are too uneven to learn
from. Data is present; the permission and the discipline to use it are not yet in place.

## Maturity per foresight practice (fictional level assignments)

The maturity framework is World Economic Forum and OECD (2025), *AI in strategic foresight:
Reshaping anticipatory governance*, https://doi.org/10.1787/aa573076-en (DOI checked as resolving to
the OECD publication page on 2026-10-05). **The names of its levels are not verified** until the
Verifier has re-opened p. 9 of the report (D-1). This dossier therefore refers to the levels only
as level 1, level 2 and level 3, and in data each level is written `LEVEL_NAME_UNVERIFIED`.

The assignments follow the thesis rule (D-1): one level per practice, and where Tracewell's account
of a practice falls between two levels, the lower level. They were made against the level
descriptions recorded in the project's D-1 entry (`docs/gates.md`), which are themselves pending
verification. If the Verifier finds that p. 9 describes the levels differently, these three
assignments must be redone, not adjusted. The assignments are `fictional`; the explanations and
next-level descriptions shown in F3 are written later by the Trend Analyst and labelled
`ai-generated` (O-2).

### Scanning

*Tracewell's account (fictional).* Selin set up a weekly routine: an AI assistant summarises new
releases of the OpenTelemetry Collector and SDKs, vendor blog posts and EU regulatory news that the
founders paste in. The founders read the summaries and decide what to discuss. The assistant is
not asked to challenge their reading, and the routine is not connected to any other tool.

*Assigned level:* level 1. Not between two levels.

### Trend analysis

*Tracewell's account (fictional).* Once a month the founders group what they have read into a few
themes and then ask an AI assistant to argue against each grouping and propose alternatives. They
have started to paste the assistant's counter-arguments into their planning document, but the step
is manual and depends on Selin remembering it.

*Assigned level:* level 2. Between level 2 and level 3; the lower level is assigned by the thesis
rule (betweenLevels: lower level 2, upper level 3).

### Scenario work

*Tracewell's account (fictional).* The founders sketched three futures for the business on a
whiteboard in January 2026. They used an AI assistant to summarise background reading before the
session and, once, asked it what they had missed, but did not use its answer.

*Assigned level:* level 1. Between level 1 and level 2; the lower level is assigned by the thesis
rule (betweenLevels: lower level 1, upper level 2).

## Named entities

Each row names a real entity this dossier mentions and the source it is cited to. Date is the
publication date of that source; for the five standing web pages without a publication date (the
aws, tech2b, JKU and IT:U pages and the Jöhnk et al. record) it is the retrieval date, 2026-10-05.

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
| GDPR | regulation | https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng | 2016-05-04 |
| NIS2 Directive | regulation | https://eur-lex.europa.eu/eli/dir/2022/2555/oj/eng | 2022-12-27 |
| NISG 2026 | regulation | https://www.ris.bka.gv.at/eli/bgbl/I/2025/94 | 2025-12-23 |
| Cyber Resilience Act | regulation | https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng | 2024-11-20 |
| Data Act | regulation | https://eur-lex.europa.eu/eli/reg/2023/2854/oj/eng | 2023-12-22 |
| WKO | publication | https://www.wko.at/it-sicherheit/nis2-uebersicht | 2026-10-05 |
| EY Austria | publication | https://www.ey.com/de_at/newsroom/2026/03/european-start-up-barometer-25 | 2026-03-25 |
| Austria Wirtschaftsservice | publication | https://www.aws.at/en/aws-preseed-innovative-solutions/ | 2026-10-05 |
| tech2b | publication | https://www.tech2b.at/ | 2026-10-05 |
| Johannes Kepler University Linz | publication | https://www.jku.at/en/degree-programs/types-of-degree-programs/bachelors-and-diploma-degree-programs/ba-artificial-intelligence/ | 2026-10-05 |
| IT:U Interdisciplinary Transformation University Austria | publication | https://it-u.at/en/digital-transformation-university/ | 2026-10-05 |
| Jöhnk et al. (2021) | publication | https://doi.org/10.1007/s12599-020-00676-7 | 2026-10-05 |
