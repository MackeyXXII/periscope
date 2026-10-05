// Fictional test data for Periscope unit tests. Never imported by the page.
// Invalid case for M6-U11: the threat reading of trend-fixture-alpha has no counter-evidence, so checkRevealBundle fails (F1-E3).
export default {
  "trendId": "trend-fixture-alpha",
  "readings": [
    {
      "id": "reading-fixture-alpha-opportunity",
      "trendId": "trend-fixture-alpha",
      "lens": "opportunity",
      "text": "zebra-alpha-opportunity-text: a synthetic rival reading written for the unit tests only.",
      "evidence": [
        {
          "claim": "zebra-alpha-opportunity-evidence: a synthetic claim supporting this reading.",
          "source": {
            "url": "https://example.org/fixture/zebra-alpha-opportunity-evidence",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-03-01",
            "retrievedOn": "2026-10-01",
            "title": "Fixture evidence source"
          },
          "signalId": "sig-2026-02-10-zebra-alpha"
        }
      ],
      "counterEvidence": [
        {
          "claim": "zebra-alpha-opportunity-counter: a synthetic claim against this reading.",
          "source": {
            "url": "https://example.org/fixture/zebra-alpha-opportunity-counter",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-03-02",
            "retrievedOn": "2026-10-01"
          }
        }
      ],
      "disconfirmingCondition": "zebra-alpha-opportunity-disconfirm: a synthetic observable event that would contradict this reading.",
      "label": "ai-generated",
      "provenance": {
        "sourceUrl": null,
        "publisher": null,
        "publishedOn": null,
        "retrievedOn": null,
        "producedBy": [
          "rival-reader"
        ],
        "producedOn": "2026-10-04",
        "frozenOn": "2026-10-05"
      }
    },
    {
      "id": "reading-fixture-alpha-threat",
      "trendId": "trend-fixture-alpha",
      "lens": "threat",
      "text": "zebra-alpha-threat-text: a synthetic rival reading written for the unit tests only.",
      "evidence": [
        {
          "claim": "zebra-alpha-threat-evidence: a synthetic claim supporting this reading.",
          "source": {
            "url": "https://example.org/fixture/zebra-alpha-threat-evidence",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-03-01",
            "retrievedOn": "2026-10-01",
            "title": "Fixture evidence source"
          },
          "signalId": "sig-2026-02-10-zebra-alpha"
        }
      ],
      "counterEvidence": [],
      "disconfirmingCondition": "zebra-alpha-threat-disconfirm: a synthetic observable event that would contradict this reading.",
      "label": "ai-generated",
      "provenance": {
        "sourceUrl": null,
        "publisher": null,
        "publishedOn": null,
        "retrievedOn": null,
        "producedBy": [
          "rival-reader"
        ],
        "producedOn": "2026-10-04",
        "frozenOn": "2026-10-05"
      }
    },
    {
      "id": "reading-fixture-alpha-noise",
      "trendId": "trend-fixture-alpha",
      "lens": "noise",
      "text": "zebra-alpha-noise-text: a synthetic rival reading written for the unit tests only.",
      "evidence": [
        {
          "claim": "zebra-alpha-noise-evidence: a synthetic claim supporting this reading.",
          "source": {
            "url": "https://example.org/fixture/zebra-alpha-noise-evidence",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-03-01",
            "retrievedOn": "2026-10-01",
            "title": "Fixture evidence source"
          },
          "signalId": "sig-2026-02-10-zebra-alpha"
        }
      ],
      "counterEvidence": [
        {
          "claim": "zebra-alpha-noise-counter: a synthetic claim against this reading.",
          "source": {
            "url": "https://example.org/fixture/zebra-alpha-noise-counter",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-03-02",
            "retrievedOn": "2026-10-01"
          }
        }
      ],
      "disconfirmingCondition": "zebra-alpha-noise-disconfirm: a synthetic observable event that would contradict this reading.",
      "label": "ai-generated",
      "provenance": {
        "sourceUrl": null,
        "publisher": null,
        "publishedOn": null,
        "retrievedOn": null,
        "producedBy": [
          "rival-reader"
        ],
        "producedOn": "2026-10-04",
        "frozenOn": "2026-10-05"
      }
    }
  ],
  "interrogation": {
    "id": "interrogation-fixture-alpha",
    "trendId": "trend-fixture-alpha",
    "provenanceChecks": [
      {
        "id": "q-alpha-provenance-one",
        "text": "zebra-alpha-provenance-one: who published the synthetic source?"
      }
    ],
    "assumptionProbes": [
      {
        "id": "q-alpha-assumption-one",
        "text": "zebra-alpha-assumption-one: what is assumed about the example tools?"
      },
      {
        "id": "q-alpha-assumption-two",
        "text": "zebra-alpha-assumption-two: what would change if the dates were later?"
      }
    ],
    "preMortem": [
      {
        "id": "q-alpha-premortem-one",
        "text": "zebra-alpha-premortem-one: a year on, what went differently?"
      },
      {
        "id": "q-alpha-premortem-two",
        "text": "zebra-alpha-premortem-two: which synthetic event was missed?"
      },
      {
        "id": "q-alpha-premortem-three",
        "text": "zebra-alpha-premortem-three: what did the fixture team not ask?"
      }
    ],
    "label": "ai-generated",
    "provenance": {
      "sourceUrl": null,
      "publisher": null,
      "publishedOn": null,
      "retrievedOn": null,
      "producedBy": [
        "interrogator"
      ],
      "producedOn": "2026-10-04",
      "frozenOn": "2026-10-05"
    }
  }
};
