# Gate log

Gates are decided by Miguel in claude.ai chat, in the Internships and Applications project. Agents
propose; the Red-team Reviewer may block; Miguel approves. Record every outcome here, with a date.

| Gate | Covers | Date | Outcome |
|---|---|---|---|
| G1 | Level 1 user requirements R1–R8 and the four working assumptions | 16 Sept 2026 | **Approved** |
| G2 | Level 2 system requirements, Level 3 architecture, Level 4 module design, test plan | 17 Sept 2026 | Open |
| G3 | Content freeze: runtime pipeline output verified and frozen | 18 Sept 2026 | Not started |
| G4 | System test pass | — | Not started |
| G5 | Acceptance by real viewers | — | Not started |

## Standing entry requirements for G2

- Every R has at least one F; every F has at least one module and one test.
- Data contracts exist as JSON Schema in `schemas/` and contain no ranking field.
- `traceability.md` is complete and matches the documents.
- Red-team Reviewer has signed off or recorded a blocking finding.
