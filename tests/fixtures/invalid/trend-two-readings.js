// Fictional test data for Periscope unit tests. Never imported by the page.
// Invalid case for M6-U12: trend-fixture-alpha holds two reading references (opportunity, threat), so checkTrend fails (F1-E2); trend-fixture-beta is valid.
export default [
  {
    "id": "trend-fixture-alpha",
    "title": "Zebra alpha fixture movement in synthetic tooling",
    "summary": "zebra-alpha-trend-summary: synthetic signals describe a change in how example tools collect data over several months.",
    "intuitionPrompt": "zebra-alpha-intuition-prompt: before reading anything further, what is your gut reading of this movement?",
    "signalIds": [
      "sig-2026-02-10-zebra-alpha",
      "sig-2026-02-10-zebra-beta",
      "sig-2026-03-04-zebra-gamma"
    ],
    "readings": [
      {
        "lens": "opportunity",
        "readingId": "reading-fixture-alpha-opportunity"
      },
      {
        "lens": "threat",
        "readingId": "reading-fixture-alpha-threat"
      }
    ],
    "label": "ai-generated",
    "provenance": {
      "sourceUrl": null,
      "publisher": null,
      "publishedOn": null,
      "retrievedOn": null,
      "producedBy": [
        "trend-analyst",
        "interrogator"
      ],
      "producedOn": "2026-10-04",
      "frozenOn": "2026-10-05"
    }
  },
  {
    "id": "trend-fixture-beta",
    "title": "Zebra beta fixture movement in synthetic tooling",
    "summary": "zebra-beta-trend-summary: synthetic signals describe a change in how example tools collect data over several months.",
    "intuitionPrompt": "zebra-beta-intuition-prompt: before reading anything further, what is your gut reading of this movement?",
    "signalIds": [
      "sig-2026-03-04-zebra-gamma",
      "sig-2026-05-20-zebra-delta",
      "sig-2026-06-15-zebra-epsilon",
      "sig-2025-11-02-zebra-zeta"
    ],
    "readings": [
      {
        "lens": "opportunity",
        "readingId": "reading-fixture-beta-opportunity"
      },
      {
        "lens": "threat",
        "readingId": "reading-fixture-beta-threat"
      },
      {
        "lens": "noise",
        "readingId": "reading-fixture-beta-noise"
      }
    ],
    "label": "ai-generated",
    "provenance": {
      "sourceUrl": null,
      "publisher": null,
      "publishedOn": null,
      "retrievedOn": null,
      "producedBy": [
        "trend-analyst",
        "interrogator"
      ],
      "producedOn": "2026-10-04",
      "frozenOn": "2026-10-05"
    }
  }
];
