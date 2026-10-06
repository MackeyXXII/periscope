# Verification record: governance container (6 October 2026)

This is the Verifier's sentence-level check of `pipeline/output/governance.json`, made on
6 October 2026 for the G3 content freeze. Every source named below as "opened" was fetched on that
day. No entity file was edited. Struck sentences are reported, not rewritten, and no substitute
source has been written into the content. The Orchestrator decides the edits; the only edits
proposed here are deletions.

Verdicts are `pass`, `struck` or `miguel-to-confirm`. EUR-Lex does not serve the fetch tool (the
GDPR ELI view came back empty again today; the Orchestrator's curl got HTTP 202, an empty body and a
bot challenge). A claim that rests only on EUR-Lex is recorded as **not opened by tool, Miguel to
confirm at G3**, with the article and the wording he should find. A claim is passed on a Commission,
EDPB or Parliament page only if that page was opened and carries a date.

## Sources opened today

| Source | Date on the page | Result |
|---|---|---|
| EDPB, "EDPB adopts pseudonymisation guidelines..." (news item) | 17 January 2025 | Opened. States that pseudonymised data "which could be attributed to an individual by the use of additional information ... is therefore still personal data"; that pseudonymisation can "make it easier to use legitimate interests as a legal basis (Art. 6(1)(f) GDPR)"; and that it helps meet obligations on "data protection by design and default (Art. 25 GDPR) and security (Art. 32 GDPR)". |
| European Commission, AI Act policy page | Last updated 3 August 2026 | Opened. States the Act "entered into force on 1 August 2024 and became applicable on 2 August 2026, with some exceptions"; prohibitions from 2 February 2025, including "emotion recognition in workplaces and education institutions"; "AI tools for employment, management of workers and access to self-employment" as high-risk; the AI Omnibus "entered into force on 27 July 2026", citing OJ:L_202601744; high-risk areas from 2 December 2027 and AI in products from 2 August 2028; names Regulation (EU) 2024/1689. |
| European Parliament, Legislative Train, Digital Omnibus 2025/0360(COD) | Last updated 20/09/2026 | Opened. COM(2025) 837 of 19 November 2025; status "Tabled"; amends the GDPR, including "Redefining 'personal data'"; still in parliamentary review and Council negotiation. |
| EDPB, "Digital Omnibus: EDPB and EDPS support simplification..." | 11 February 2026 | Opened. A "Joint Opinion on the Digital Omnibus Regulation proposal"; supports several simplifications; "strongly urge the co-legislators not to adopt the proposed changes to the definition of personal data"; changes "would result in significantly narrowing the concept of personal data". |
| Article 29 WP newsroom item 610169 (WP249) | 23/06/2017 | Item page and date opened. The opinion itself (PDF, document 45631) came back as compressed binary again and could not be read. Content unverified. |
| EUR-Lex, GDPR (2016/679) | — | Not opened by tool (empty body). |
| EUR-Lex, AI Act (2024/1689) and Regulation (EU) 2026/1744 | — | Not opened by tool (first pass; not retried). |

Undated official pages found in passing, which corroborate but **cannot** carry a pass because they
show no date: the EDPB SME guide, "Data protection basics" ("Personal data means any information
relating to an identified or identifiable individual") and "Process personal data lawfully" (six
circumstances under Art. 6, and that employees "will not be in a position to freely provide consent"
to their employer); the Commission's "Data protection explained" ("identified or identifiable living
individual"). The EDPB page for Guidelines 4/2019 (dated 20 October 2020) confirms only the title
"Article 25 Data Protection by Design and by Default"; pseudonymisation is not on that page. None of
these has been added to the content; they are listed so that Miguel can see what exists.

## Paragraph `personal-data-condition` — miguel-to-confirm

| # | Sentence (abridged) | Rests on | Verdict |
|---|---|---|---|
| 1 | "In this build, nothing a team owns enters the demo: there are no accounts, nothing the viewer types is stored or sent, and every screen reads only content frozen before release." | Build statement; lists `no-accounts-cookies-analytics`, `no-viewer-data-stored-or-sent`, `open-web-sources-frozen` | pass |
| 2 | "Ingesting a team's own data would change that, because it would bring an authenticated workspace and judgements kept across sessions and tied to named members of the team, none of which this build implements." | Build statement; `docs/03-architecture.md` section 11 (authenticated workspace, persistence, judgements tied to named roles) | pass |
| 3 | "The General Data Protection Regulation defines personal data as any information relating to an identified or identifiable natural person (Article 4(1))." | EUR-Lex only | **miguel-to-confirm**. Compare with GDPR Art. 4(1): "'personal data' means any information relating to an identified or identifiable natural person ('data subject')". Also confirm the source's `publishedOn` 2016-05-04 (OJ L 119, 4.5.2016). |
| 4 | "A judgement tied to a named member of a four-person team would meet that definition, so the Regulation's conditions would apply before such a feature could be built." | Application of sentence 3 | Stands or falls with sentence 3 |

## Paragraph `lawful-basis-and-design` — miguel-to-confirm

| # | Sentence (abridged) | Rests on | Verdict |
|---|---|---|---|
| 1 | "Before any processing began, the GDPR would require one of the six lawful bases it sets out in Article 6(1)." | EUR-Lex only | **miguel-to-confirm**. Compare with Art. 6(1): "Processing shall be lawful only if and to the extent that at least one of the following applies:", followed by points (a) to (f), six in all. Note for Miguel: "before any processing began" is the drafter's reading, since the article says "lawful only if"; it does not use the word "before". |
| 2 | "It also requires data protection by design and by default, and names pseudonymisation as one example of such a measure (Article 25)." | EUR-Lex; EDPB pseudonymisation item | First clause **pass** (EDPB item, 17 Jan 2025: "data protection by design and default (Art. 25 GDPR)"). Second clause **miguel-to-confirm**: compare with Art. 25(1), "appropriate technical and organisational measures, such as pseudonymisation, which are designed to implement data-protection principles". |
| 3 | "The European Data Protection Board states that pseudonymised data which could be attributed to a person by using additional information remains personal data, and that pseudonymisation can help a controller rely on legitimate interests and meet its data protection by design and security obligations." | EDPB pseudonymisation item, 17 Jan 2025 | **pass**. Faithful paraphrase of the three statements quoted above. |
| 4 | "Pseudonymising a team's judgements would therefore not take them outside the Regulation, though it would bear on the lawful basis and on the design conditions above." | Application of sentence 3 | **pass**, but its words "the lawful basis and ... the design conditions above" point back to sentences 1 and 2. If Miguel cannot confirm those, deleting them leaves this sentence pointing at nothing, and the paragraph should then be struck whole rather than reworded. |

## Paragraph `workplace-and-impact-assessment` — miguel-to-confirm, one sentence struck

| # | Sentence (abridged) | Rests on | Verdict |
|---|---|---|---|
| 1 | "Where processing is likely to result in a high risk to people's rights and freedoms, Article 35(1) of the GDPR requires a data protection impact assessment before it starts." | EUR-Lex only | **miguel-to-confirm**. Compare with Art. 35(1): "Where a type of processing ... is likely to result in a high risk to the rights and freedoms of natural persons, the controller shall, prior to the processing, carry out an assessment of the impact of the envisaged processing operations on the protection of personal data." |
| 2 | "Article 88 allows Member States to lay down more specific rules for processing in the employment context, including on monitoring systems at the workplace, so the conditions could differ with the country in which team members are employed." | EUR-Lex only | **miguel-to-confirm**. Compare with Art. 88(1): "Member States may, by law or by collective agreements, provide for more specific rules to ensure the protection of the rights and freedoms in respect of the processing of employees' personal data in the employment context"; and Art. 88(2), whose list ends "and monitoring systems at the work place". The workplace-monitoring words are in 88(2), not 88(1); the sentence cites "Article 88" as a whole, which is accurate if both are found. |
| 3 | "Where team members are employees, the Article 29 Working Party, the European Data Protection Board's predecessor, held in its 2017 opinion on data processing at work that consent is unlikely to be a valid legal basis, given the imbalance of power between employer and employee." | WP249 only | **struck**. The opinion could not be opened: the PDF returned compressed binary in both passes, and only the item page and its date were confirmed. A source that cannot be read does not support a claim. Not EUR-Lex, so the Miguel-to-confirm route does not apply. The undated EDPB SME guide says something similar about employee consent, but it does not state what the Working Party held and carries no date, so it was not used to repair the sentence. |

Required deletions for this paragraph: sentence 3, and the second entry of `sources` (the WP249 item),
since no remaining sentence rests on it. What remains rests on EUR-Lex alone.

## Paragraph `ai-act-conditions` — pass (text); two citations unopened

| # | Sentence (abridged) | Rests on | Verdict |
|---|---|---|---|
| 1 | "If own-data ingestion used AI to analyse the team, Regulation (EU) 2024/1689, the AI Act, would also bear on it." | Commission AI Act page (names Regulation (EU) 2024/1689) | **pass**. A conditional, not advice. |
| 2 | "The European Commission states that the Act became applicable on 2 August 2026, that its prohibitions, including emotion recognition in workplaces, have applied since February 2025, and that AI tools for employment and the management of workers are high-risk." | Commission AI Act page, 3 Aug 2026 | **pass**. The page adds "with some exceptions" after the applicability date; the omission is cured by sentences 3 and 4, which state the deferred high-risk dates. |
| 3 | "Regulation (EU) 2026/1744, the Digital Omnibus on AI, is adopted law: it entered into force on 27 July 2026 and amends the AI Act, including the dates from which its high-risk rules apply." | Commission AI Act page | **pass**. The page gives entry into force on 27 July 2026, cites the act as OJ:L_202601744 (Regulation (EU) 2026/1744 in the Official Journal's act-by-act numbering) and attributes the changed dates to the AI Omnibus. The Parliament's Legislative Train names the file "Digital Omnibus on AI". |
| 4 | "According to the Commission, those obligations start on 2 December 2027 for the listed areas and on 2 August 2028 for AI embedded in products." | Commission AI Act page | **pass**. The page says "certain high-risk areas" and "systems integrated into products such as lifts or toys". |
| 5 | "Whether a feature that reads a founding team's judgements falls within the employment category is a condition to settle before it is built, and this demo does not settle it." | Open condition; no factual claim | **pass**. States a condition; no advice. |

Every sentence rests on the opened Commission page, so the text passes. However, the `sources` list
also carries the two EUR-Lex entries, which have never been opened. Their dates are therefore
unverified: `publishedOn` 2024-07-12 for 2024/1689 (consistent with the Commission's "entered into
force on 1 August 2024") and `publishedOn` 2026-07-24 for 2026/1744 (not confirmed by any opened
page). Either Miguel confirms both dates at G3, or the first and third `sources` entries are deleted,
leaving the Commission page, which carries every claim.

## Paragraph `pending-gdpr-amendment` — pass

| # | Sentence (abridged) | Rests on | Verdict |
|---|---|---|---|
| 1 | "These conditions rest on the GDPR's definition of personal data as it stands." | Link sentence | **pass** (no new claim) |
| 2 | "The Commission's Digital Omnibus proposal COM(2025) 837 of 19 November 2025 would amend the GDPR, including that definition; the European Parliament's Legislative Train, updated on 20 September 2026, lists it as tabled, so it is a proposal and not law." | EP Legislative Train, 20/09/2026 | **pass**. Number, date, GDPR amendment including "Redefining 'personal data'", the update date and "Tabled" are all on the page. "Not law" follows from that status and from the page's account of continuing Parliament and Council work. |
| 3 | "In a joint opinion on the proposal, the European Data Protection Board and the European Data Protection Supervisor supported several GDPR simplifications but opposed the change to the definition of personal data as significantly narrowing it." | EDPB news item, 11 Feb 2026 | **pass**. "Joint Opinion" is on the page; "opposed" is supported by "strongly urge the co-legislators not to adopt the proposed changes to the definition of personal data"; "significantly narrowing the concept of personal data" is on the page. |
| 4 | "A build of own-data ingestion would therefore be assessed against the GDPR in force when it is built, not against the proposal." | Consequence of sentence 2 | **pass** |

**Omnibus statuses.** The Data Omnibus (COM(2025) 837, 2025/0360(COD)) is stated as a tabled proposal,
not law: accurate as of the page's 20 September 2026 update. The AI Omnibus (Regulation (EU)
2026/1744) is stated as adopted law in force since 27 July 2026: accurate per the Commission page of
3 August 2026. The argument does not confuse the two.

## The two lists

Every `verifiedBy` identifier was found as a row in `docs/04-module-design.md` (M-rows) or in the
invariant audit of `docs/test-plan.md` (AUDIT-4, AUDIT-6). None is Deferred: M3-U1 (T, G3), M1-U16
(G3), M1-U13 (I, G3), M6-U9 (I), M6-U14 (I), M10-U1 (T), M10-U2 (T), M10-U4 (I), M8-U8 (T, I, G3).

| Item | Verdict | What the tests back, and gaps |
|---|---|---|
| `open-web-sources-frozen` | pass | M3-U1 backs "carries a dated link" (https URL, publisher, `publishedOn`); M1-U16 and AUDIT-4 back "every shipped item passed verification"; M1-U13 backs "regenerated byte for byte from that frozen output". "Public source on the open web" is backed by the Verifier's fetches, not by a test; "produced ... offline" means outside any viewer session, since the pipeline agents did use the web. Wording acceptable; noted for Red-team. |
| `no-viewer-data-stored-or-sent` | pass | M10-U2 (no storage or cookie code), M6-U9 (no storage access on a walk F1-S1 to F1-S4), M6-U14 (no typed text in the URL; trend screen, the only screen with text fields in this build since F5 is static), M10-U1 (no network code). |
| `no-live-ai` | pass | M10-U1 and AUDIT-6 (no network code or remote reference); M10-U4 (content loaded only through `contracts/load.js`, nothing from `pipeline/`). |
| `no-accounts-cookies-analytics` | pass | M10-U1 (no remote script, font or image; no request API); M10-U2 (no cookie). "No accounts" follows from the absence of any network call; no test names accounts directly. |
| `own-data-ingestion` | pass | M10-U1, M10-U4, M10-U2 back "makes no network requests and reads only the content frozen into this build". "It is argued below" is true only while at least one argument paragraph ships; if the argument freezes empty (F3-S3a), this phrase becomes false and must be deleted. |
| `cross-session-persistence` | pass | M10-U2 and M6-U9. |
| `role-aware-model` | pass | M8-U8: no LogEntry has a `role` (LogEntry is the only shipped content whose schema admits one; `pastJudgement` is closed without it) and no page code other than `contracts/validate.js` reads `.role`. Strictly, `validate.js` is page code and is exempted from the test; "no page code reads one" is accurate in substance (it validates the field and renders nothing from it). Architecture section 11 confirms "designed ... and not built". |

## Labels, ranking and language

- Container label `real`: correct under the M7-U5 design (the lists are statements of fact about the
  build). Each of the five argument paragraphs is labelled `ai-generated`: correct (Architect-drafted).
- No `score`, `rank`, `confidence` or `priority` field, and no ordering by importance.
- No C-6 term (checked against `C6_TERMS` in `tests/lib/text-rules.mjs`). No advice: no "should",
  "must", "recommend" or "advise"; the text states conditions.
- "high risk" (Art. 35) and "high-risk" (AI Act) are legal terms quoted from the law. "high" is not a
  C-6 term but is a relevance word in M3-U6; listed for Red-team review as C-6 requires for quoted
  source text (same point as item 5 of `docs/g3-decision-pack.md`).

## Container verdict: not pass as written

The container cannot pass as written because one sentence is struck and seven claims await
Miguel. Two routes, each made of deletions only:

**Route A: Miguel confirms the EUR-Lex wording at G3** (Art. 4(1), 6(1), 25(1), 35(1), 88(1)-(2),
and the GDPR `publishedOn` 2016-05-04). Delete:
1. sentence 3 of `workplace-and-impact-assessment` (the Article 29 Working Party sentence);
2. the WP249 entry in that paragraph's `sources`;
3. the EUR-Lex entries for 2024/1689 and 2026/1744 in `ai-act-conditions` `sources`, unless Miguel
   also confirms their `publishedOn` dates (2024-07-12, 2026-07-24).

The container then passes: five paragraphs and seven list items.

**Route B: Miguel does not confirm the EUR-Lex wording.** Delete:
1. paragraphs `personal-data-condition`, `lawful-basis-and-design` and
   `workplace-and-impact-assessment` whole. Each would otherwise keep sentences that rest on
   unopened law, or, for `lawful-basis-and-design`, a sentence 4 that points at deleted text;
2. the two EUR-Lex entries in `ai-act-conditions` `sources`.

`ai-act-conditions` and `pending-gdpr-amendment` remain and pass, so the argument does not go empty
and the screen ships as F3-S3, not F3-S3a. One caveat for the Orchestrator: the first sentence of
`pending-gdpr-amendment` ("These conditions rest on the GDPR's definition of personal data as it
stands") would then follow the AI Act paragraph rather than the definition paragraph. It still reads
as true, but whether it reads well is an editorial call, and the Orchestrator should make it.
