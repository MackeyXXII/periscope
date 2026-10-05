// Test tooling for Periscope. Never imported by the page.
//
// The project's stage flag. CONTENT_FROZEN is false until the G3 freeze commit, in which the
// Orchestrator sets it to true together with committing pipeline/output/ and data/
// (docs/03-architecture.md, section 4). While false, tests read the synthetic fixtures and every
// part that asserts on data/ is skipped with "needs data/ (G3)". Once true, those parts run, and a
// missing or wrong data/ fails. No other file may hold this switch.

export const CONTENT_FROZEN = false;
