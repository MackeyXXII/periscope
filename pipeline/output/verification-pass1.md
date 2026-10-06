# Verification record, first pass (6 October 2026)

This is the Verifier's first pass before the G3 content freeze. Every source below was fetched on
6 October 2026, apart from those marked as not opened by the tool. A struck item has been reported,
not repaired: no claim was rewritten and no substitute source was found for it. The Orchestrator
decides what happens to each struck item. The readings, the replay judgements and the replay
outcomes were outside the scope of this pass. No entity file in `pipeline/output/` was edited.

Verdicts are `pass`, `struck` or `not-opened-by-tool`. An item marked `not-opened-by-tool` needs
Miguel to open the source himself. If he does not, it must not ship as verified.

## Signals (`signals.json`, 16 signals)

| Id | Check made | Verdict | Reason |
|---|---|---|---|
| sig-2026-07-08-edpb-anonymisation-guidelines (summary) | Date, faithfulness | **struck** | Date 8 July 2026 is correct, and the three criteria, both approaches and the consultation deadline of 30 Oct 2026 are on the page. Two things are not: the number "Guidelines 02/2026", and the statement that the guidelines replace the 2014 Article 29 Working Party opinion. A targeted search of the page found neither. |
| sig-2026-07-08-edpb-anonymisation-guidelines (relevance) | Relevance note | pass | It claims nothing beyond the anonymisation test. |
| sig-2026-07-27-commission-cra-guidance | Date, faithfulness | pass | All points are on the page dated 27 July 2026, including the 67 practical examples and both application dates. |
| sig-2026-07-27-grafana-agentic-operations-tools | Date, faithfulness | pass | Dated 27 July 2026. All six tools are named as summarised, and Agent Observability is described as "OpenTelemetry-native". |
| sig-2026-08-04-grafana-adaptive-telemetry-profiles | Date, faithfulness, brief reference | pass | Dated 4 Aug 2026. The 30–50 per cent average cost reduction is attributed to the company, as the summary says. The survey reference matches the scanning brief. |
| sig-2026-08-06-datadog-second-quarter-results | Date, figures, competitor framing | pass | Dated 6 Aug 2026 and all figures match. The phrase "principal Dynatrace competitor" matches the competitor sentence in Dynatrace's FY2026 10-K. |
| sig-2026-08-13-austria-start-up-fund-of-funds | Date, faithfulness (German) | pass | Dated 13 Aug 2026. Zehetner spoke to the APA. The figures (100 + 400 million euros), the autumn tender and the Q1 2027 start all match. |
| sig-2026-08-13-dynatrace-to-acquire-arize (summary) | Date, figures, Dynatrace neutrality | pass | Dated 13 Aug 2026. The 915 and about 815 million US dollar figures, the closing window and the regulatory review all match, and the wording is neutral and factual. |
| sig-2026-08-13-dynatrace-to-acquire-arize (relevance) | Relevance note vs source | **struck** | The phrase "with its main R&D site in Linz" is not in the press release. The dossier cites the FY2026 10-K for it, but the tool received that filing truncated before Item 2 and could not confirm it. |
| sig-2026-08-17-elastic-agent-otel-collector | Date, faithfulness | pass | Dated 17 Aug 2026. Version 9.3, the EDOT Collector base, Beats inputs running as receivers and unchanged configurations all match. |
| sig-2026-09-07-dash0-signalcontrol | Date, faithfulness | pass | Dated 7 Sept 2026. Every account, RED metrics before sampling, cloud or edge deployment, and billing on ingestion plus retained storage all match. |
| sig-2026-09-08-austria-nis2-implementation-starts | Date, faithfulness (German) | pass | Dated 8 Sept 2026 and every point matches. One flag: the relevance note asserts that Tracewell's fictional customers fall under the NISG 2026. That is a fictional premise, not a sourced fact. |
| sig-2026-09-08-palo-alto-observability-arr (summary) | Call date, publication date, attribution | pass | The call was held on 1 Sept 2026 and the transcript published on 8 Sept 2026. Both the CEO and the CFO state the figure of more than 500 million US dollars, more than doubled since the close. The nine-figure LLM customer is the CFO's statement. |
| sig-2026-09-08-palo-alto-observability-arr (relevance) | Relevance note vs source | **struck** | The claim "This is the first reported figure on Chronosphere inside Palo Alto Networks" is not supported by the source and was not verified. |
| sig-2026-09-10-plug-and-play-linz-industrial-ai | Date, faithfulness | pass | Dated 10 Sept 2026. The first EU centre on the JKU campus, tech2b's role and all five anchor partners match. |
| sig-2026-09-16-otel-k8s-attributes-processor-v1 | Date re-check (GitHub), faithfulness | pass | The rendered page shows no date. The post's source file on GitHub has `date: 2026-09-16` and authors from Elastic and Datadog. The content matches. |
| sig-2026-09-18-splunk-agent-observability | Date, faithfulness | **struck** | The date of 18 Sept 2026 and the Galileo acquisition are confirmed. The summary, however, presents token and cost tracking across coding agents and LLM providers, and its availability on premises, in the cloud and in Cisco Cloud Control, as current. The source says the tokenomics feature arrives "later this month" and lists the coding-agent integrations as upcoming. |
| sig-2026-09-22-new-relic-observability-forecast | Date, figures | pass | Dated 22 Sept 2026 and all four figures match. |
| sig-2026-09-22-otel-prometheus-interoperability-survey | Date re-check (GitHub), figures | pass | The rendered page shows no date. The source file `.../2026/otel-prometheus-interoperability/index.md` has `date: 2026-09-22`. The 49 per cent is from the chart caption ("mix 49.4%"), and the other figures match. |

## Regulatory sources (`regulatory-sources.json`, 10)

| Id / URL | Check made | Verdict | Reason |
|---|---|---|---|
| GDPR Art. 4(1), 4(5), 99: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng | Text, date | not-opened-by-tool | The ELI, TXT/HTML, TXT/PDF and ALL views all came back empty. |
| GDPR Arts. 6, 25, 35, 88 (same URL) | Text | not-opened-by-tool | Same failure as above. |
| EDPB Guidelines 01/2025 on Pseudonymisation news item | Date, note | pass | Dated 17 Jan 2025. The note matches, including legitimate interests, Art. 25 and security. |
| WP29 Opinion 2/2017 (WP249): https://ec.europa.eu/newsroom/article29/items/610169 | Date, note | not-opened-by-tool | The item page and its date of 23 June 2017 are confirmed. The PDF came back as unreadable binary, so the content of the note is unverified. |
| AI Act: https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng | Title, dates | not-opened-by-tool | Every EUR-Lex view came back empty. The Commission page separately confirms entry into force on 1 Aug 2024. |
| Commission AI Act policy page | Update date, note | pass | Last updated 3 Aug 2026. Every point matches, and the page explicitly attributes the 2027 and 2028 dates to the AI Omnibus. |
| Regulation (EU) 2026/1744: https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng | Dates | not-opened-by-tool | Every EUR-Lex view came back empty. The Commission page confirms the regulation number and entry into force on 27 July 2026. Adoption on 8 July and OJ publication on 24 July remain unconfirmed. |
| EDPB–EDPS Digital Omnibus joint opinion | Date, note | pass | Dated 11 Feb 2026. The note matches. |
| EP Legislative Train, 2025/0360(COD) | Update date, status | pass | Last updated 20/09/2026. COM(2025) 837 of 19 Nov 2025 is confirmed and the status is "Tabled". The note's "not adopted" is an inference from that status. |
| Commission Data Act policy page | Update date, note | pass | Last updated 2 July 2026. The dates and scope match. |

## Replay signals (`replay-signals.json`, 7 signals in 5 candidates)

Outcomes were not attached in this pass, as instructed.

| Candidate / signal | Check made | Verdict | Reason |
|---|---|---|---|
| R1 EPRS briefing, 12 Feb 2026 | Date in window, summary describes only the signal then | **struck** | The clause "including by adjusting when the rules for high-risk AI systems start to apply" is not in the text. In addition, the page as served today has been edited to record events up to 16 June 2026 (Parliament's position on 26 Mar, trilogue agreement on 7 May, Parliament's approval on 16 June). It is therefore no longer the 12 Feb text, and it reveals the outcome. |
| R1 Council press release, 13 Mar 2026 | Opened? | **struck** | It returned HTTP 403 twice in this pass, and per `replay-candidates.md` it has never been opened by any agent. Its detailed summary therefore rests on no opened page. Miguel may reinstate it only after opening it himself. |
| R2 EDPB–EDPS joint opinion, 11 Feb 2026 | Date, faithfulness | pass | The summary matches the page. |
| R3 Commission CRA draft guidance, 3 Mar 2026 | Date, faithfulness | pass | The feedback deadline, topics and dates all match. |
| R4 Dynatrace Q3 FY2026 results, 9 Feb 2026 | Date, figures, neutrality | pass | All figures match, and Dynatrace Intelligence is described in the company's own terms. |
| R4 Datadog Q4/FY2025 results, 10 Feb 2026 | Date, figures | pass | All figures match. |
| R4 CNBC, https://www.cnbc.com/2026/02/06/ai-anthropic-tools-saas-software-stocks-selloff.html | Re-try | not-opened-by-tool | Both the article and https://www.cnbc.com/ return HTTP 403 to the tool. It stays excluded. |
| R4 candidate title | Supported by remaining signals? | **struck** | The first half, "Software stocks fell on fears of AI agents", rested only on CNBC. The growth half is supported. |
| R5 EY Start-up-Barometer, 25 Mar 2026 | Date, figures (German) | pass | All figures match. |

The consequence for the replay set is that **R1 has no passing signal** after this pass.

## D-1: maturity level names (p. 9)

- **Report opened:** *AI in Strategic Foresight: Reshaping Anticipatory Governance*, White Paper,
  November 2025, OECD and World Economic Forum, from
  https://www3.weforum.org/docs/WEF_AI_in_Strategic_Foresight_2025.pdf. Page 9 was read, with the
  printed page number and the PDF page number both 9.
- **Route:** the DOI https://doi.org/10.1787/aa573076-en redirects to
  https://www.oecd.org/en/publications/ai-in-strategic-foresight_aa573076-en.html, which returned
  HTTP 403, as did the WEF publication page. The PDF does not print the DOI. The title, date and
  joint OECD/WEF authorship match the report the DOI identifies.
- **Result: match, word for word.** Page 9 reads "Level one: AI for analysis augmentation", "Level
  two: AI as creative sparring partner" and "Level three: AI integrated and customized into
  workflow".
- The report presents these three levels under the heading "the integration of AI into strategic
  foresight processes in general", not one level per practice. Assigning a level per practice is
  the thesis's rule.
- **O-3:** the report names the practices "horizon scanning", "trend analysis or clustering" and
  "scenario development" (Figure 2, p. 8), and these are its three most-cited AI uses (60, 69 and
  63 per cent). The foreword (p. 3) speaks of "scanning, analysis and scenario development". R2's
  three practices therefore match in substance. The only difference is that the report says
  "scenario development" where R2 says "scenario work".
- `maturity.status` was not changed. Miguel sets it at G3.

## Other checks

- No `score`, `rank`, `confidence` or `priority` field, and no ordering by importance, was found in
  the three files.
- Signals are labelled `real`, and their summaries and relevance notes `ai-generated`. The entries
  in `regulatory-sources.json` carry no label field. Replay signals are labelled `real` (their
  origin), and must still appear under a `replay` label in the decision log.
