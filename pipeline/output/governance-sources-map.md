# Governance argument: sentence-to-source map

Drafted by the Architect on 6 October 2026 for the G3 content run (Q-5 outcome, `docs/gates.md`).
The argument in `pipeline/output/governance.json` was drafted only from
`pipeline/output/regulatory-sources.json`. This map lists every sentence of every paragraph with the
source entry it rests on, so that the Verifier can check each claim and strike a paragraph whole if
any claim fails. Sources are named by their `title` in `regulatory-sources.json`. The Verifier
status shown is from its first pass (`verification-pass1.md`).

Two kinds of sentence occur. A **sourced claim** states a fact about EU law and rests on a listed
source. A **build statement** states a fact about this demo and rests on the architecture
(`docs/03-architecture.md` section 11) and on the tests named in the governance lists; it makes no
claim about the law. The Verifier checks build statements against the governance lists, not
against the web.

The `publisher` field is required by `sourceRef` but absent from `regulatory-sources.json`. It was
filled in from the host of each URL: EUR-Lex as "Publications Office of the European Union
(EUR-Lex)", `edpb.europa.eu` as "European Data Protection Board", the Article 29 newsroom item as
"Article 29 Data Protection Working Party", `digital-strategy.ec.europa.eu` as "European
Commission" and `europarl.europa.eu` as "European Parliament". Every other citation field is
copied exactly.

## Paragraph `personal-data-condition` (the Q-5 fallback)

This paragraph stands alone if every other paragraph is struck. It holds one sourced claim.

| Sentence | Kind | Rests on | First-pass status |
|---|---|---|---|
| "In this build, nothing a team owns enters the demo: there are no accounts, nothing the viewer types is stored or sent, and every screen reads only content frozen before release." | Build statement | Governance lists `no-accounts-cookies-analytics`, `no-viewer-data-stored-or-sent`, `open-web-sources-frozen` and their tests | Not a web claim |
| "Ingesting a team's own data would change that, because it would bring an authenticated workspace and judgements kept across sessions and tied to named members of the team, none of which this build implements." | Build statement | Architecture section 11 (authenticated workspace, persistence and account model listed as not implemented); governance lists `own-data-ingestion`, `cross-session-persistence`, `role-aware-model` | Not a web claim |
| "The General Data Protection Regulation defines personal data as any information relating to an identified or identifiable natural person (Article 4(1))." | Sourced claim | GDPR, Article 4(1) and 4(5) entry (EUR-Lex) | not-opened-by-tool. No Commission or EDPB page in the list states the Article 4(1) definition itself, so no second citation could be added. |
| "A judgement tied to a named member of a four-person team would meet that definition, so the Regulation's conditions would apply before such a feature could be built." | Application of the sourced claim to the build | GDPR Article 4(1) entry, applied to the design in architecture section 11 ("a small team's judgements, tied to named roles, are personal data") | Depends on the sentence above |

## Paragraph `lawful-basis-and-design`

| Sentence | Kind | Rests on | First-pass status |
|---|---|---|---|
| "Before any processing began, the GDPR would require one of the six lawful bases it sets out in Article 6(1)." | Sourced claim | GDPR, Articles 6, 25, 35 and 88 entry (EUR-Lex) | not-opened-by-tool |
| "It also requires data protection by design and by default, and names pseudonymisation as one example of such a measure (Article 25)." | Sourced claim | GDPR, Articles 6, 25, 35 and 88 entry (EUR-Lex); the EDPB pseudonymisation item corroborates that Article 25 obligations exist | not-opened-by-tool for EUR-Lex; EDPB item pass |
| "The European Data Protection Board states that pseudonymised data which could be attributed to a person by using additional information remains personal data, and that pseudonymisation can help a controller rely on legitimate interests and meet its data protection by design and security obligations." | Sourced claim | Guidelines 01/2025 on Pseudonymisation (EDPB news item on adoption) | pass |
| "Pseudonymising a team's judgements would therefore not take them outside the Regulation, though it would bear on the lawful basis and on the design conditions above." | Application of the EDPB statement to the build | Guidelines 01/2025 on Pseudonymisation (EDPB news item) | Depends on the sentence above |

## Paragraph `workplace-and-impact-assessment`

| Sentence | Kind | Rests on | First-pass status |
|---|---|---|---|
| "Where processing is likely to result in a high risk to people's rights and freedoms, Article 35(1) of the GDPR requires a data protection impact assessment before it starts." | Sourced claim | GDPR, Articles 6, 25, 35 and 88 entry (EUR-Lex) | not-opened-by-tool |
| "Article 88 allows Member States to lay down more specific rules for processing in the employment context, including on monitoring systems at the workplace, so the conditions could differ with the country in which team members are employed." | Sourced claim, with its direct consequence | GDPR, Articles 6, 25, 35 and 88 entry (EUR-Lex) | not-opened-by-tool |
| "Where team members are employees, the Article 29 Working Party, the European Data Protection Board's predecessor, held in its 2017 opinion on data processing at work that consent is unlikely to be a valid legal basis, given the imbalance of power between employer and employee." | Sourced claim | Opinion 2/2017 on data processing at work (WP249) | not-opened-by-tool: item page and date confirmed, PDF unreadable, content unverified. This sentence is the most exposed in the argument; if the Verifier cannot open the opinion, cutting this sentence leaves a paragraph that still stands on the GDPR entry alone. |

## Paragraph `ai-act-conditions`

| Sentence | Kind | Rests on | First-pass status |
|---|---|---|---|
| "If own-data ingestion used AI to analyse the team, Regulation (EU) 2024/1689, the AI Act, would also bear on it." | Sourced claim (the Regulation's number and name), framed as a condition | Regulation (EU) 2024/1689 (Artificial Intelligence Act) entry (EUR-Lex); the Commission AI Act page names the Act | not-opened-by-tool for EUR-Lex; Commission page pass |
| "The European Commission states that the Act became applicable on 2 August 2026, that its prohibitions, including emotion recognition in workplaces, have applied since February 2025, and that AI tools for employment and the management of workers are high-risk." | Sourced claim | AI Act: regulatory framework for AI (European Commission policy page) | pass |
| "Regulation (EU) 2026/1744, the Digital Omnibus on AI, is adopted law: it entered into force on 27 July 2026 and amends the AI Act, including the dates from which its high-risk rules apply." | Sourced claim | Regulation (EU) 2026/1744 entry (EUR-Lex); also the Commission AI Act page, which the Verifier's first pass records as confirming the regulation number and entry into force on 27 July 2026, and whose note attributes the changed dates to the Digital Omnibus on AI. The adoption date (8 July) and Official Journal date (24 July) were left out because the first pass could not confirm them. | not-opened-by-tool for EUR-Lex; number and entry into force confirmed via the Commission page |
| "According to the Commission, those obligations start on 2 December 2027 for the listed areas and on 2 August 2028 for AI embedded in products." | Sourced claim | AI Act: regulatory framework for AI (European Commission policy page) | pass |
| "Whether a feature that reads a founding team's judgements falls within the employment category is a condition to settle before it is built, and this demo does not settle it." | Statement of an open condition; no factual claim | Follows from the Commission page's high-risk category above | Not a web claim |

## Paragraph `pending-gdpr-amendment`

| Sentence | Kind | Rests on | First-pass status |
|---|---|---|---|
| "These conditions rest on the GDPR's definition of personal data as it stands." | Link sentence; no new claim | Refers to the fallback paragraph's Article 4(1) claim | Not a web claim |
| "The Commission's Digital Omnibus proposal COM(2025) 837 of 19 November 2025 would amend the GDPR, including that definition; the European Parliament's Legislative Train, updated on 20 September 2026, lists it as tabled, so it is a proposal and not law." | Sourced claim | The Digital Omnibus Regulation Proposal, 2025/0360(COD) (European Parliament Legislative Train) | pass ("Tabled" confirmed; "not law" is the same inference from that status that the first pass noted for "not adopted") |
| "In a joint opinion on the proposal, the European Data Protection Board and the European Data Protection Supervisor supported several GDPR simplifications but opposed the change to the definition of personal data as significantly narrowing it." | Sourced claim | Digital Omnibus: EDPB and EDPS support simplification and competitiveness while raising key concerns | pass |
| "A build of own-data ingestion would therefore be assessed against the GDPR in force when it is built, not against the proposal." | Consequence of the proposal's status | The Legislative Train entry | Depends on the second sentence |

## Sources in the list not used

- Data Act, Regulation (EU) 2023/2854 (European Commission policy page): its scope as stated in the
  note, data generated by connected products, does not bear on a team's own judgements, so no
  sentence was tied to it.
