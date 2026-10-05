// Fictional test data for Periscope unit tests. Never imported by the page.
export default {
  "trendId": "trend-fixture-beta",
  "readings": [
    {
      "id": "reading-fixture-beta-opportunity",
      "trendId": "trend-fixture-beta",
      "lens": "opportunity",
      "text": "zebra-beta-opportunity-text: a synthetic rival reading written for the unit tests only.",
      "evidence": [
        {
          "claim": "zebra-beta-opportunity-evidence: a synthetic claim supporting this reading.",
          "source": {
            "url": "https://example.org/fixture/zebra-beta-opportunity-evidence",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-03-01",
            "retrievedOn": "2026-10-01",
            "title": "Fixture evidence source"
          },
          "signalId": "sig-2026-03-04-zebra-gamma"
        }
      ],
      "counterEvidence": [
        {
          "claim": "zebra-beta-opportunity-counter: a synthetic claim against this reading.",
          "source": {
            "url": "https://example.org/fixture/zebra-beta-opportunity-counter",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-03-02",
            "retrievedOn": "2026-10-01"
          }
        }
      ],
      "disconfirmingCondition": "zebra-beta-opportunity-disconfirm: a synthetic observable event that would contradict this reading.",
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
      "id": "reading-fixture-beta-threat",
      "trendId": "trend-fixture-beta",
      "lens": "threat",
      "text": "zebra-beta-threat-text: a synthetic rival reading written for the unit tests only.",
      "evidence": [
        {
          "claim": "zebra-beta-threat-evidence: a synthetic claim supporting this reading.",
          "source": {
            "url": "https://example.org/fixture/zebra-beta-threat-evidence",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-03-01",
            "retrievedOn": "2026-10-01",
            "title": "Fixture evidence source"
          },
          "signalId": "sig-2026-03-04-zebra-gamma"
        }
      ],
      "counterEvidence": [
        {
          "claim": "zebra-beta-threat-counter: a synthetic claim against this reading.",
          "source": {
            "url": "https://example.org/fixture/zebra-beta-threat-counter",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-03-02",
            "retrievedOn": "2026-10-01"
          }
        }
      ],
      "disconfirmingCondition": "zebra-beta-threat-disconfirm: a synthetic observable event that would contradict this reading.",
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
      "id": "reading-fixture-beta-noise",
      "trendId": "trend-fixture-beta",
      "lens": "noise",
      "text": "zebra-beta-noise-text: a synthetic rival reading written for the unit tests only.",
      "evidence": [
        {
          "claim": "zebra-beta-noise-evidence: a synthetic claim supporting this reading.",
          "source": {
            "url": "https://example.org/fixture/zebra-beta-noise-evidence",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-03-01",
            "retrievedOn": "2026-10-01",
            "title": "Fixture evidence source"
          },
          "signalId": "sig-2026-03-04-zebra-gamma"
        }
      ],
      "counterEvidence": [
        {
          "claim": "zebra-beta-noise-counter: a synthetic claim against this reading.",
          "source": {
            "url": "https://example.org/fixture/zebra-beta-noise-counter",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-03-02",
            "retrievedOn": "2026-10-01"
          }
        }
      ],
      "disconfirmingCondition": "zebra-beta-noise-disconfirm: a synthetic observable event that would contradict this reading.",
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
    "id": "interrogation-fixture-beta",
    "trendId": "trend-fixture-beta",
    "provenanceChecks": [
      {
        "id": "q-beta-provenance-one",
        "text": "zebra-beta-provenance-one: who published the synthetic source?"
      }
    ],
    "assumptionProbes": [
      {
        "id": "q-beta-assumption-one",
        "text": "zebra-beta-assumption-one: what is assumed about the example tools?"
      },
      {
        "id": "q-beta-assumption-two",
        "text": "zebra-beta-assumption-two: what would change if the dates were later?"
      }
    ],
    "preMortem": [
      {
        "id": "q-beta-premortem-one",
        "text": "zebra-beta-premortem-one: a year on, what went differently?"
      },
      {
        "id": "q-beta-premortem-two",
        "text": "zebra-beta-premortem-two: which synthetic event was missed?"
      },
      {
        "id": "q-beta-premortem-three",
        "text": "zebra-beta-premortem-three: what did the fixture team not ask?"
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
