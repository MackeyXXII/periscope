// Fictional test data for Periscope unit tests. Never imported by the page.
// Invalid case for M8-U10: the log module is an object, not an array of entries, so the log as a whole fails validation (F4-E1).
export default {
  "id": "zebra-log-not-array",
  "entries": [
    {
      "id": "replay-2026-01-01-zebra-log-one",
      "originalSignals": [
        {
          "title": "Zebra replay one-a fixture headline",
          "summary": {
            "text": "zebra-replay-one-a-summary: a synthetic paraphrase for tests.",
            "label": "ai-generated"
          },
          "source": {
            "url": "https://example.org/fixture/replay-one-a",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-01-01",
            "retrievedOn": "2026-10-01"
          },
          "label": "real"
        },
        {
          "title": "Zebra replay one-b fixture headline",
          "summary": {
            "text": "zebra-replay-one-b-summary: a synthetic paraphrase for tests.",
            "label": "ai-generated"
          },
          "source": {
            "url": "https://example.org/fixture/replay-one-b",
            "publisher": "Example Fixture Publisher",
            "publishedOn": "2026-01-20",
            "retrievedOn": "2026-10-01"
          },
          "label": "real"
        }
      ],
      "pastJudgement": {
        "lens": "threat",
        "rationale": "zebra-replay-2026-01-01-zebra-log-one-rationale: a synthetic past judgement for tests.",
        "asOfDate": "2026-01-25",
        "authoredOn": "2026-10-03",
        "authoredBy": [
          "rival-reader",
          "interrogator"
        ],
        "label": "replay"
      },
      "outcome": {
        "summary": {
          "text": "zebra-replay-2026-01-01-zebra-log-one-outcome: a synthetic outcome paraphrase for tests.",
          "label": "ai-generated"
        },
        "source": {
          "url": "https://example.org/fixture/replay-2026-01-01-zebra-log-one-outcome",
          "publisher": "Example Fixture Publisher",
          "publishedOn": "2026-06-10",
          "retrievedOn": "2026-10-01"
        },
        "attachedOn": "2026-10-04",
        "label": "real"
      },
      "calibrationNote": {
        "text": "zebra-replay-2026-01-01-zebra-log-one-calibration: a synthetic qualitative note for tests.",
        "label": "ai-generated"
      },
      "label": "replay",
      "provenance": {
        "sourceUrl": null,
        "publisher": null,
        "publishedOn": null,
        "retrievedOn": null,
        "producedBy": [
          "rival-reader",
          "interrogator",
          "verifier"
        ],
        "producedOn": "2026-10-04",
        "frozenOn": "2026-10-05"
      }
    }
  ]
};
