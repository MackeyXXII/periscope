// Fictional test data for Periscope unit tests. Never imported by the page.
export default {
  "id": "readiness-fixture-team",
  "subject": "Fixture team (fictional test data)",
  "framework": {
    "name": "Fixture readiness framework",
    "citation": {
      "url": "https://example.org/fixture/readiness-framework",
      "publisher": "Example Journal",
      "publishedOn": "2021-01-15",
      "retrievedOn": "2026-10-01",
      "title": "Fixture framework paper"
    },
    "label": "real"
  },
  "categories": [
    {
      "key": "strategic-alignment",
      "name": "Strategic alignment",
      "answers": [
        {
          "question": "zebra-strategic-alignment-question: a synthetic dossier question?",
          "answer": "zebra-strategic-alignment-answer: a synthetic dossier answer."
        }
      ],
      "finding": "zebra-strategic-alignment-finding: a synthetic finding in prose."
    },
    {
      "key": "resources",
      "name": "Resources",
      "answers": [
        {
          "question": "zebra-resources-question: a synthetic dossier question?",
          "answer": "zebra-resources-answer: a synthetic dossier answer."
        }
      ],
      "finding": "zebra-resources-finding: a synthetic finding in prose."
    },
    {
      "key": "knowledge",
      "name": "Knowledge",
      "answers": [
        {
          "question": "zebra-knowledge-question: a synthetic dossier question?",
          "answer": "zebra-knowledge-answer: a synthetic dossier answer."
        }
      ],
      "finding": "zebra-knowledge-finding: a synthetic finding in prose."
    },
    {
      "key": "culture",
      "name": "Culture",
      "answers": [
        {
          "question": "zebra-culture-question: a synthetic dossier question?",
          "answer": "zebra-culture-answer: a synthetic dossier answer."
        }
      ],
      "finding": "zebra-culture-finding: a synthetic finding in prose."
    },
    {
      "key": "data",
      "name": "Data",
      "answers": [
        {
          "question": "zebra-data-question: a synthetic dossier question?",
          "answer": "zebra-data-answer: a synthetic dossier answer."
        }
      ],
      "finding": "zebra-data-finding: a synthetic finding in prose."
    }
  ],
  "label": "fictional",
  "provenance": {
    "sourceUrl": null,
    "publisher": null,
    "publishedOn": null,
    "retrievedOn": null,
    "producedBy": [
      "persona-researcher"
    ],
    "producedOn": "2026-10-04",
    "frozenOn": "2026-10-05"
  },
  "maturity": {
    "status": "verified",
    "report": {
      "url": "https://doi.org/10.1787/aa573076-en",
      "publisher": "Fixture report publisher",
      "title": "Fixture report title",
      "publishedOn": "2025-06-01",
      "retrievedOn": "2026-10-01"
    },
    "practices": [
      {
        "key": "scanning",
        "name": "Scanning",
        "levelName": "Fixture level one",
        "betweenLevels": {
          "lowerLevelName": "Fixture level one",
          "upperLevelName": "Fixture level two"
        },
        "explanation": {
          "text": "zebra-scanning-explanation: the synthetic account falls between two levels, so the lower level is assigned.",
          "citation": {
            "url": "https://doi.org/10.1787/aa573076-en",
            "publisher": "Fixture report publisher",
            "title": "Fixture report title",
            "publishedOn": "2025-06-01",
            "retrievedOn": "2026-10-01",
            "page": "9"
          }
        },
        "nextLevel": {
          "levelName": "Fixture level two",
          "description": {
            "text": "The report describes zebra-scanning-next-level as a synthetic second level for tests.",
            "label": "ai-generated"
          },
          "citation": {
            "url": "https://doi.org/10.1787/aa573076-en",
            "publisher": "Fixture report publisher",
            "title": "Fixture report title",
            "publishedOn": "2025-06-01",
            "retrievedOn": "2026-10-01",
            "page": "9"
          }
        }
      },
      {
        "key": "trend-analysis",
        "name": "Trend analysis",
        "levelName": "Fixture level two",
        "betweenLevels": null,
        "explanation": {
          "text": "zebra-trend-analysis-explanation: the synthetic account matches the second level.",
          "citation": {
            "url": "https://doi.org/10.1787/aa573076-en",
            "publisher": "Fixture report publisher",
            "title": "Fixture report title",
            "publishedOn": "2025-06-01",
            "retrievedOn": "2026-10-01",
            "page": "9"
          }
        },
        "nextLevel": {
          "levelName": "Fixture level three",
          "description": {
            "text": "The report describes zebra-trend-analysis-next-level as a synthetic third level for tests.",
            "label": "ai-generated"
          },
          "citation": {
            "url": "https://doi.org/10.1787/aa573076-en",
            "publisher": "Fixture report publisher",
            "title": "Fixture report title",
            "publishedOn": "2025-06-01",
            "retrievedOn": "2026-10-01",
            "page": "9-10"
          }
        }
      },
      {
        "key": "scenario-work",
        "name": "Scenario work",
        "levelName": "Fixture level three",
        "betweenLevels": null,
        "explanation": {
          "text": "zebra-scenario-work-explanation: the synthetic account matches the third level.",
          "citation": {
            "url": "https://doi.org/10.1787/aa573076-en",
            "publisher": "Fixture report publisher",
            "title": "Fixture report title",
            "publishedOn": "2025-06-01",
            "retrievedOn": "2026-10-01",
            "page": "10"
          }
        },
        "nextLevel": {
          "noLevelAboveCitation": {
            "url": "https://doi.org/10.1787/aa573076-en",
            "publisher": "Fixture report publisher",
            "title": "Fixture report title",
            "publishedOn": "2025-06-01",
            "retrievedOn": "2026-10-01",
            "page": "10"
          }
        }
      }
    ]
  }
};
