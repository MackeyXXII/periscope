// Fictional test data for Periscope unit tests. Never imported by the page.
// M5-U5 (F2-W1): a brief of four signals, two of which fail the per-signal check: "zebra-withheld-one" has no provenance.publishedOn and "zebra-withheld-two" has no relevanceNote. Shape: { brief, signals }; the test serves each part to the loader as data/brief.js and data/signals.js.
export default {
  "brief": {
    "id": "brief-2026-06-19",
    "periodStart": "2026-06-13",
    "periodEnd": "2026-06-19",
    "signalIds": [
      "sig-2026-06-01-zebra-kept-one",
      "sig-2026-06-02-zebra-kept-two",
      "sig-2026-06-03-zebra-withheld-one",
      "sig-2026-06-04-zebra-withheld-two"
    ],
    "label": "frozen",
    "provenance": {
      "sourceUrl": null,
      "publisher": null,
      "publishedOn": null,
      "retrievedOn": null,
      "producedBy": [
        "brief-editor"
      ],
      "producedOn": "2026-10-04",
      "frozenOn": "2026-10-05"
    }
  },
  "signals": [
    {
      "id": "sig-2026-06-01-zebra-kept-one",
      "title": "Zebra zebra-kept-one fixture headline for the withheld-signal test",
      "sourceLanguage": "en",
      "summary": {
        "text": "zebra-kept-one-summary: a synthetic paraphrase used only by the unit tests.",
        "label": "ai-generated"
      },
      "relevanceNote": {
        "text": "zebra-kept-one-relevance: a synthetic note used only by the unit tests.",
        "label": "ai-generated"
      },
      "label": "real",
      "provenance": {
        "sourceUrl": "https://example.org/fixture/kept-one",
        "publisher": "Example Gazette",
        "publishedOn": "2026-06-01",
        "retrievedOn": "2026-10-01",
        "producedBy": [
          "scout"
        ],
        "producedOn": "2026-10-04",
        "frozenOn": "2026-10-05"
      }
    },
    {
      "id": "sig-2026-06-02-zebra-kept-two",
      "title": "Zebra zebra-kept-two fixture headline for the withheld-signal test",
      "sourceLanguage": "en",
      "summary": {
        "text": "zebra-kept-two-summary: a synthetic paraphrase used only by the unit tests.",
        "label": "ai-generated"
      },
      "relevanceNote": {
        "text": "zebra-kept-two-relevance: a synthetic note used only by the unit tests.",
        "label": "ai-generated"
      },
      "label": "real",
      "provenance": {
        "sourceUrl": "https://example.org/fixture/kept-two",
        "publisher": "Example Weekly",
        "publishedOn": "2026-06-02",
        "retrievedOn": "2026-10-01",
        "producedBy": [
          "scout"
        ],
        "producedOn": "2026-10-04",
        "frozenOn": "2026-10-05"
      }
    },
    {
      "id": "sig-2026-06-03-zebra-withheld-one",
      "title": "Zebra zebra-withheld-one fixture headline for the withheld-signal test",
      "sourceLanguage": "en",
      "summary": {
        "text": "zebra-withheld-one-summary: a synthetic paraphrase used only by the unit tests.",
        "label": "ai-generated"
      },
      "relevanceNote": {
        "text": "zebra-withheld-one-relevance: a synthetic note used only by the unit tests.",
        "label": "ai-generated"
      },
      "label": "real",
      "provenance": {
        "sourceUrl": "https://example.org/fixture/withheld-one",
        "publisher": "Example Withheld Press One",
        "retrievedOn": "2026-10-01",
        "producedBy": [
          "scout"
        ],
        "producedOn": "2026-10-04",
        "frozenOn": "2026-10-05"
      }
    },
    {
      "id": "sig-2026-06-04-zebra-withheld-two",
      "title": "Zebra zebra-withheld-two fixture headline for the withheld-signal test",
      "sourceLanguage": "en",
      "summary": {
        "text": "zebra-withheld-two-summary: a synthetic paraphrase used only by the unit tests.",
        "label": "ai-generated"
      },
      "label": "real",
      "provenance": {
        "sourceUrl": "https://example.org/fixture/withheld-two",
        "publisher": "Example Withheld Press Two",
        "publishedOn": "2026-06-04",
        "retrievedOn": "2026-10-01",
        "producedBy": [
          "scout"
        ],
        "producedOn": "2026-10-04",
        "frozenOn": "2026-10-05"
      }
    }
  ]
};
