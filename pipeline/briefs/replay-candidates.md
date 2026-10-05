# Replay candidates for the decision log

Written by the Persona and Brief Researcher (Opus 5.5) on 5 October 2026, after G2. Input to the
decision log's retrospective replay (F4). Read `CLAUDE.md` and `docs/gates.md` (K-7) first.

## What this file is, and what it is not

Each candidate below is a real signal, or a small group of real signals, published between 1
January and 31 March 2026, that a four-person observability start-up in Linz would have faced. The
start-up is Tracewell, which is fictional; the signals and the outcomes are real, dated and linked.
Each candidate also records one later, real, dated source showing what had happened by September
2026.

This file contains **no judgements**. Under K-7, the past judgements are written later by the
Rival Readers and the Interrogator from the original signals only, with the outcomes withheld from
their inputs; the Verifier then attaches the outcomes. Nothing here says what the team should have
concluded, which reading was right, or which candidate matters more. The candidates are numbered
in the order they were researched, and the numbers carry no other meaning.

**Withholding the outcomes (K-7).** Every candidate has an `Outcome:` line and an "Outcome note"
paragraph. Whoever builds `pipeline/output/replay-signals.json` for the Rival Readers and the
Interrogator copies only the heading, the `Original:` lines and the "Signal note" paragraph, and
leaves out every `Outcome:` line and every "Outcome note". This file itself is not given to those
agents. The B5 limit still applies: the model's general knowledge extends to June 2026, so the
"Cutoff" sentence in each outcome note records whether events leading to the outcome were public
before then.

**Different directions.** The set is built so that its outcomes do not all point the same way: in
some candidates a change anticipated in early 2026 took place, in others it did not, and in others
the early-2026 picture reversed. This sentence describes the set, not any one candidate, and must
not be passed to the judging agents either.

## Candidates

### R1. The AI Act's application dates for high-risk systems were under negotiation

Original: https://epthinktank.eu/2026/02/12/digital-omnibus-on-ai-eu-legislation-in-progress/ (2026-02-12)
Original: https://www.consilium.europa.eu/en/press/press-releases/2026/03/13/council-agrees-position-to-streamline-rules-on-artificial-intelligence/ (2026-03-13)

*Signal note (pass to the judging agents).* In November 2025 the Commission proposed the Digital
Omnibus on AI, which among other things would adjust when the AI Act's rules for high-risk AI
systems start to apply, tying them to the availability of standards and support tools. The
European Parliamentary Research Service briefing of 12 February 2026 set out the proposal and the
state of the co-legislators' work. On 13 March 2026 the Council agreed its position on the
proposal. At the end of March 2026 the AI Act's original text still said it applies in general from
2 August 2026, and the amendment was not yet law. Relevance to Tracewell: the incident assistant
and any AI features sold to industrial customers would be assessed against whichever dates and
rules applied.

Outcome: https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng (2026-07-24)

*Outcome note (withhold from the judging agents).* Regulation (EU) 2026/1744, the Digital Omnibus
on AI, dated 8 July 2026, was published in the Official Journal on 24 July 2026 and entered into
force on the third day after publication. It sets 2 December 2027 for high-risk AI systems listed
in Annex III and 2 August 2028 for those under Annex I. Cutoff: the Council position (13 March
2026) and, according to the EPRS page as later updated, a provisional agreement on 7 May 2026
preceded June 2026; the adoption and publication came after it.

### R2. The GDPR changes proposed in the Digital Omnibus met opposition from the data-protection authorities

Original: https://www.edpb.europa.eu/news/news/2026/digital-omnibus-edpb-and-edps-support-simplification-and-competitiveness-while_en (2026-02-11)

*Signal note (pass to the judging agents).* The separate Digital Omnibus proposal of 19 November
2025 would, among other changes, amend the GDPR's definition of personal data, move cookie consent
rules into the GDPR and change data-breach notification. On 11 February 2026 the EDPB and the EDPS
published a joint opinion that supported several simplifications, such as common templates and a
higher threshold and longer deadline for breach notification, and urged the co-legislators not to
adopt the proposed change to the definition of personal data. Relevance to Tracewell: the product
removes or pseudonymises personal data in customer telemetry, so the definition of personal data
and the pseudonymisation rules bear directly on its design and its pitch.

Outcome: https://www.europarl.europa.eu/legislative-train/theme-a-new-plan-for-europe-s-sustainable-prosperity-and-competitiveness/file-digital-package (2026-09-20)

*Outcome note (withhold from the judging agents).* The European Parliament's Legislative Train
page, last updated on 20 September 2026, lists the proposal as tabled. It records that the
co-rapporteurs published a draft report on 22 June 2026, that the joint LIBE and ITRE committees
discussed it on 13 July 2026 and that more than 1,750 amendments were then tabled, and that a
Council vote on a negotiating mandate scheduled for 26 June 2026 was cancelled because agreement
on open issues could not be found. No amendment to the GDPR had been adopted. Cutoff: the
cancelled Council vote and the draft report came at or after the end of June 2026. Note for the
Verifier: the Legislative Train is a page that is updated in place, so its content should be
archived on the day the outcome is attached.

### R3. The Cyber Resilience Act's reporting obligations had a fixed start date and draft guidance

Original: https://digital-strategy.ec.europa.eu/en/news/commission-publishes-feedback-draft-guidance-assist-companies-applying-cyber-resilience-act (2026-03-03)

*Signal note (pass to the judging agents).* On 3 March 2026 the Commission published draft
guidance on the Cyber Resilience Act for feedback until 31 March 2026. It covers remote data
processing solutions, free and open-source software, support periods and the interplay with other
EU law, and restates that reporting obligations apply from 11 September 2026 and the main
obligations from 11 December 2027. Relevance to Tracewell: the team ships a Collector distribution
to customers and runs a hosted backend, so whether and how the regulation applies to each part,
and whether reporting would be possible on 11 September 2026, were open questions.

Outcome: https://www.enisa.europa.eu/news/the-cra-single-reporting-platform-is-launched (2026-09-11)

*Outcome note (withhold from the judging agents).* On 11 September 2026 ENISA announced that the
CRA Single Reporting Platform was live, and that manufacturers report actively exploited
vulnerabilities and severe incidents through it from that day; open-source software stewards
follow from 11 December 2027. The Commission's news item of the same day confirms that the
reporting obligations apply
(https://commission.europa.eu/news-and-media/news/safer-and-more-secure-digital-products-2026-09-11_en).
The obligations started on the date set in the regulation. Cutoff: the launch came after June 2026;
a public page of June 2026 reported that the platform was not yet operational at that time.

### R4. Software stocks fell on fears of AI agents while observability vendors reported growth

Original: https://www.cnbc.com/2026/02/06/ai-anthropic-tools-saas-software-stocks-selloff.html (2026-02-06)
Original: https://www.sec.gov/Archives/edgar/data/1773383/000177338326000006/q3fy26-earningsreleaseex99.htm (2026-02-09)
Original: https://www.sec.gov/Archives/edgar/data/1561550/000162828026006645/ex-991x20251231x8k.htm (2026-02-10)

*Signal note (pass to the judging agents).* In early February 2026, CNBC reported a sell-off in
software stocks driven by fears that new AI agent tools, including Anthropic's, could displace
software products. In the same week two observability vendors reported results. Dynatrace, on 9
February 2026, reported annual recurring revenue of 1,972 million US dollars, up 20 per cent, raised
its full-year guidance, and introduced "Dynatrace Intelligence", which it described as an agentic
AI operations system. Datadog, on 10 February 2026, reported fiscal-2025 revenue of 3.43 billion US
dollars, up 28 per cent, and guided 2026 revenue of 4.06 to 4.10 billion US dollars. Relevance to
Tracewell: whether general-purpose AI agents would reduce demand for observability tools, or raise
it, bore on the incident assistant, on fundraising and on the team's market. The CNBC article was
confirmed through a search index listing only, because it returned an access error when fetched;
the Verifier re-checks it.

Outcome: https://www.sec.gov/Archives/edgar/data/1773383/000177338326000049/q1fy27-earningsreleaseex99.htm (2026-08-05)

*Outcome note (withhold from the judging agents).* On 5 August 2026 Dynatrace reported, for the
quarter ended 30 June 2026, annual recurring revenue of 2,136 million US dollars, up 17 per cent,
total revenue of 555 million US dollars, up 16 per cent, and organic net new ARR growth of 41 per
cent. It lowered its full-year ARR guidance by 23 million US dollars at the midpoint, citing
foreign-exchange headwinds, and left its constant-currency guidance unchanged. Cutoff: the result
was published after June 2026; Dynatrace's 10-K of 20 May 2026, before the cutoff, already named
"non-specialist solutions relying on generic LLMs" among its competitive risks.

### R5. Austrian start-up funding had fallen sharply in 2025

Original: https://www.ey.com/de_at/newsroom/2026/03/european-start-up-barometer-25 (2026-03-25)

*Signal note (pass to the judging agents).* On 25 March 2026 EY reported that start-ups in Austria
raised 253 million euros in 2025, 56 per cent less than in 2024, across 148 rounds, with an average
round of about 2 million euros. The same release reported
that about 200 million euros had been invested in the first two months of 2026. Relevance to
Tracewell: the team was preparing a pre-seed round and weighing it against grants and pilot
revenue.

Outcome: https://www.ey.com/de_at/newsroom/2026/07/start-up-barometer-h1-26 (2026-07-08)

*Outcome note (withhold from the judging agents).* On 8 July 2026 EY reported that Austrian
start-ups raised 472 million euros in the first half of 2026, 329 per cent more than in the first
half of 2025, across 97 rounds, a half-year record, with the average round at 6.3 million euros. A
related EY release reported that purely international investor groups provided 64 per cent of the
volume, against 27 per cent a year earlier, and that AI start-ups raised 93 million euros across 30
rounds (https://www.ey.com/de_at/newsroom/2026/07/ey-start-up-investment-barometer-h1-2026).
Cutoff: the first-half figures were published after June 2026; the strong first two months were
already public in March 2026.

## Named entities

Date is the publication date of the cited source. The Council of the European Union press release
and the CNBC article returned an access error when fetched and were confirmed through a search
index listing that showed their title, URL and date; the Verifier re-checks both.

| Name | Kind | Source URL | Date |
|---|---|---|---|
| European Parliamentary Research Service | publication | https://epthinktank.eu/2026/02/12/digital-omnibus-on-ai-eu-legislation-in-progress/ | 2026-02-12 |
| Council of the European Union | publication | https://www.consilium.europa.eu/en/press/press-releases/2026/03/13/council-agrees-position-to-streamline-rules-on-artificial-intelligence/ | 2026-03-13 |
| AI Act | regulation | https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng | 2024-07-12 |
| Digital Omnibus on AI | regulation | https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng | 2026-07-24 |
| EUR-Lex | publication | https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng | 2026-07-24 |
| EDPB | publication | https://www.edpb.europa.eu/news/news/2026/digital-omnibus-edpb-and-edps-support-simplification-and-competitiveness-while_en | 2026-02-11 |
| GDPR | regulation | https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng | 2016-05-04 |
| Digital Omnibus | regulation | https://www.europarl.europa.eu/legislative-train/theme-a-new-plan-for-europe-s-sustainable-prosperity-and-competitiveness/file-digital-package | 2026-09-20 |
| European Parliament | publication | https://www.europarl.europa.eu/legislative-train/theme-a-new-plan-for-europe-s-sustainable-prosperity-and-competitiveness/file-digital-package | 2026-09-20 |
| Cyber Resilience Act | regulation | https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng | 2024-11-20 |
| European Commission | publication | https://digital-strategy.ec.europa.eu/en/news/commission-publishes-feedback-draft-guidance-assist-companies-applying-cyber-resilience-act | 2026-03-03 |
| ENISA | publication | https://www.enisa.europa.eu/news/the-cra-single-reporting-platform-is-launched | 2026-09-11 |
| CNBC | publication | https://www.cnbc.com/2026/02/06/ai-anthropic-tools-saas-software-stocks-selloff.html | 2026-02-06 |
| Dynatrace | incumbent | https://www.sec.gov/Archives/edgar/data/1773383/000177338326000006/q3fy26-earningsreleaseex99.htm | 2026-02-09 |
| Datadog | incumbent | https://www.sec.gov/Archives/edgar/data/1561550/000162828026006645/ex-991x20251231x8k.htm | 2026-02-10 |
| SEC EDGAR | publication | https://www.sec.gov/Archives/edgar/data/1773383/000177338326000049/q1fy27-earningsreleaseex99.htm | 2026-08-05 |
| EY Austria | publication | https://www.ey.com/de_at/newsroom/2026/03/european-start-up-barometer-25 | 2026-03-25 |
