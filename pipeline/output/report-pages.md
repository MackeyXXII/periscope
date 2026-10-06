# Report pages for the Trend Analyst: WEF/OECD maturity levels

Prepared by the Verifier on 6 October 2026 for the Trend Analyst's maturity explanations and next-level descriptions (O-2). The Trend Analyst has no web tools. This file is the only report material it may draw on, together with the persona dossier. It contains no readiness content: no level is assigned here, nothing is said about Tracewell, and no entity file was edited. (Saved verbatim by the Orchestrator: the harness did not let the Verifier write report files.)

## How the report was opened

- **Document opened:** the WEF-hosted PDF at https://www3.weforum.org/docs/WEF_AI_in_Strategic_Foresight_2025.pdf, retrieved 6 October 2026. All 22 pages were read as text. Each page's printed number in the footer matches its PDF page number, so every page reference below means both.
- **DOI route:** https://doi.org/10.1787/aa573076-en redirects (302) to https://www.oecd.org/en/publications/ai-in-strategic-foresight_aa573076-en.html, which returned HTTP 403 again today. The WEF publication page (https://www.weforum.org/publications/ai-in-strategic-foresight-reshaping-anticipatory-governance/) also returned 403. The PDF does not print the DOI.
- **Exact date:** the PDF says only "November 2025" (cover; foreword, p. 3). The exact day comes from the DOI's Crossref registration record (https://api.crossref.org/works/10.1787/aa573076-en, retrieved 6 October 2026). Its `published`, `published-online` and `issued` fields all read 2025-11-19. Its title ("AI in Strategic Foresight", subtitle "Reshaping Anticipatory Governance") and its resource URL (the OECD page above) match the PDF.

## Citation fields (reportCitation, schemas/common.schema.json)

| Field | Value | Basis |
|---|---|---|
| `url` | `https://www3.weforum.org/docs/WEF_AI_in_Strategic_Foresight_2025.pdf` | Recommended; see below |
| `publisher` | `World Economic Forum and OECD` | The cover carries both logos. The p. 2 disclaimer says it is published by the World Economic Forum and "published under the responsibility of the Secretary-General of the OECD". The p. 3 foreword says it was "developed jointly". Crossref lists the publisher as "The World Economic Forum" only. |
| `title` | `AI in Strategic Foresight: Reshaping Anticipatory Governance` | Cover; running footer on every page |
| `publishedOn` | `2025-11-19` | Crossref DOI record. The document itself shows only November 2025. |
| `retrievedOn` | `2026-10-06` | The date the PDF was opened for this file |
| `page` | `9` for the three levels; other pages as given below | Printed and PDF page numbers agree |

**Recommended `url`: the WEF PDF.** It is the copy that was actually opened and read, and the page numbers cited are its own. The DOI is the more persistent identifier, but its landing page returned 403 every time, and no agent has opened the OECD-hosted copy or checked that its page numbers match. Citing the DOI with a page number would cite pages nobody has seen. If Miguel prefers the DOI, he should open the OECD copy and confirm that p. 9 carries the same three levels.

## Where the levels sit in the report

Section 2, "AI integration into strategic foresight", begins on p. 8. That page carries only the section heading, the subheading "AI tools are used as a supplement to human work, not a replacement." and Figure 2. All three levels are on p. 9. They are introduced by the sentence that practice varies "when it comes to the integration of AI into strategic foresight processes in general" (p. 9). They do not continue onto p. 10, where section 3, "Benefits and challenges", begins. The Conclusion (p. 18, "Moving beyond simple use cases") restates the progression without naming the levels; see below.

Each level on p. 9 has a body paragraph and an italic summary paragraph beneath it.

### Level one: AI for analysis augmentation (p. 9)

Paraphrase: practitioners who have not tried a range of tools, or who have no customised solutions, tend to use AI for simpler tasks in the research phase, such as synthesising data, initial scanning and sensemaking. The report says this describes the majority of the experts surveyed. At this level AI gathers, organises and synthesises large amounts of information case by case. That gives a base layer of insight, which human experts later deepen and put in context. The tools are seen as complementary but stand-alone, and they mainly contribute to human-centred workflows. The italic summary adds three points: the tools are purely supplemental, they speed the workflow by about 10-15 per cent, and they still require careful analysis and existing expertise.

Quotes (p. 9): "simpler tasks in the research phase"; "AI tools are purely supplemental".

### Level two: AI as creative sparring partner (p. 9)

Paraphrase: the report calls this "the next reported level of maturity". At this level AI is used as a sparring partner and idea generator. It wind-tunnels ideas and stress-tests content that people have written. The tools also do the following:
- systematise and summarise signals
- offer ideas for the structure of a study
- suggest scenarios from uploaded data
- compare collected signals with other factual data
- speed up the search for relevant information

Respondents reported direct efficiency and productivity gains: more scenarios developed, wider wind-tunnelling and outputs that scale further. The italic summary says AI supports horizon and environmental scanning, megatrend analysis and simulation, speculating about futures, and preparing visualisations for leadership at short notice. It adds that AI must be treated as a complement to human expertise and experience, not a substitute.

Quotes (p. 9): "using AI as a sparring partner and idea generator"; "a complement to human expertise and experience, not as a substitute".

### Level three: AI integrated and customized into workflow (p. 9)

Paraphrase: the report says this level is currently very rare. It denotes AI integrated into the whole strategic foresight process. Fit-for-purpose tools are developed for horizon scanning, for options and combinations of methods, and for scoping a research question, testing it and communicating it externally. More tailored tools are used, for example for complexity mapping and pattern detection. Practitioners experiment continuously with AI applications, including AI agents. They actively automate parts of the process:
- signal detection
- trends analysis
- scenario development
- simulations and stress testing
- visualisation of alternative futures and other outputs

The italic summary says AI is a significant component of the foresight process. Experiments enable capabilities previously infeasible: automated document and signal collection, and automatic analysis of documents as inputs to scenario development and other outputs.

Quotes (p. 9): "The third level is currently very rare"; "integration of AI into the entire strategic foresight process".

## Is anything described above level three? (for `noLevelAboveCitation`)

**No.** Page 9 describes exactly three levels and nothing after the third, and it calls the third "currently very rare". The Conclusion (p. 18) names as the aim "a level of maturity where AI is integrated into the entire strategic foresight process". That is the level-three description, not a further level. No page from 1 to 22 mentions a fourth level or anything beyond level three.

Recommended `noLevelAboveCitation.page`: `9`. Page 18 corroborates this but does not name the levels.

## How the report relates the levels to practices

**The levels are not defined per practice.** They are introduced for AI integration into foresight processes "in general" (p. 9). The report never assigns a level to horizon scanning, trend analysis or scenario development separately. Assigning a level per practice is the thesis's rule (D-1), not the report's, and an explanation must not attribute per-practice levels to the report.

**Practices do appear inside the level descriptions (p. 9).** They are described as activities within each level, not as separate per-practice scales:
- Level one mentions "initial scanning" and data synthesis in the research phase.
- Level two mentions summarising signals, suggesting scenarios, horizon and environmental scanning, and megatrend analysis.
- Level three mentions fit-for-purpose tools for horizon scanning, and automating signal detection, trends analysis and scenario development.

**Practices as AI uses (p. 7 and Figure 2, p. 8).** Respondents use AI mainly for "trend analysis or clustering" (69 per cent), "scenario development" (63 per cent) and "horizon scanning" (60 per cent). Figure 2 glosses horizon scanning as "e.g. identifying emerging issues or weak signals". These figures are not linked to the levels.

**Foreword (p. 3).** AI offers "new capabilities for scanning, analysis and scenario development". This is not linked to the levels either.

**Conclusion (p. 18), "Moving beyond simple use cases".** The paragraph follows the same progression in three steps:
- Most practitioners use AI for simpler tasks such as synthesising data, initial scanning and sensemaking (level-one wording).
- Practitioners should invest in using AI as a sparring partner and idea generator, and to systematise and summarise signals, suggest scenarios and compare collected data (level-two wording).
- The aim is integration across the whole process, with tailored tools for complexity mapping, pattern detection and communicating findings (level-three wording).

This paragraph is written as the report's recommendation ("Practitioners should invest time..."). A next-level description must stay a description of what the report says the level is, never advice (K-2).

## What could not be confirmed

- The exact day, 19 November 2025, is not printed in the document. It rests on the Crossref DOI record, because the OECD and WEF landing pages both returned 403.
- No agent has opened the OECD-hosted copy behind the DOI, so its page numbers are unconfirmed.
- The sources name the publisher differently: the document credits both organisations, Crossref names the World Economic Forum alone.
