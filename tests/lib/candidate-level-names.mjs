// Test tooling for Periscope. Never imported by the page.
//
// The three candidate maturity level names, as the thesis quotes them from p. 9 of the WEF/OECD
// (2025) report (docs/gates.md, D-1). They are NOT verified: the Verifier re-opens p. 9 before G3
// and Miguel sets the status. Until then they may appear in the repository only here (and in the
// docs that record the decision), so that tests can prove they appear nowhere else (M1-U18) and
// never in the unverified page (M7-U2). Matching is case-insensitive.

export const CANDIDATE_LEVEL_NAMES = Object.freeze([
  'AI for analysis augmentation',
  'AI as creative sparring partner',
  'AI integrated and customized into workflow',
]);

/** The candidate names found in `text`, matched case-insensitively. */
export function candidatesIn(text) {
  const lower = String(text).toLowerCase();
  return CANDIDATE_LEVEL_NAMES.filter((name) => lower.includes(name.toLowerCase()));
}
