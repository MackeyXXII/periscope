// M4 Interpretation pipeline: unit tests M4-U1 to M4-U11.
// Written from docs/04-module-design.md (M4) before the pipeline has run (test-first rule).
//
// Every test is split as tests/lib/content.mjs recommends: a fixture part on the synthetic content
// and a data/ part with needs: ['data']. M4-U10 and M4-U11 test the conversation questions of the
// interactive F5 and are Deferred (F5 static, decision of 5 Oct 2026): both their parts carry
// needs: ['deferred'] and are skipped with exactly that reason for this release.
//
// Status at G2: every fixture part passes except M4-U8, which fails until
// assets/js/contracts/constants.js exists; every data/ part is skipped.
//
// INTERPRETATIONS, reported to the Orchestrator:
//   - M4-U2: a "full sourceRef" is the item's `source` with an https:// url, a non-empty publisher
//     and ISO publishedOn and retrievedOn (the four required fields of common.schema.json#sourceRef).
//   - M4-U4: "the Reading's frozenOn" is the Reading's provenance.frozenOn.
//   - M4-U6: "any text in its trend's readings" is every string value anywhere in the three Reading
//     objects (text, claims, source titles, disconfirming condition, and so on).
//   - M4-U6, M4-U11: words are case-folded and punctuation is removed (not replaced by a space)
//     before runs are compared, so "lens-neutral" is one word, "lensneutral".
//   - M4-U7: the cross-reference phrase is matched case-insensitively and may begin a longer word
//     ("threat readings" contains "threat reading").
//   - M4-U8, M4-U10: "ends with ?" ignores trailing whitespace, as the questionText pattern does.
//   - M4-U10: the "one to three" bound is the literal 3 of the specification; M4-U8 uses
//     QUESTIONS_PER_GROUP_MAX.

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { importUnderTest, repoUrl } from '../lib/env.mjs';
import { loadContent, clone } from '../lib/content.mjs';
import { allKeys, bannedTokensIn } from '../lib/contract-rules.mjs';
import {
  C6_TERMS, LENS_WORDS, ADVICE_WORDS, wholeWordHits, sharedRun, stringLeaves, isIsoDate,
} from '../lib/text-rules.mjs';

const CONSTANTS = repoUrl('assets/js/contracts/constants.js');
const LENSES = ['noise', 'opportunity', 'threat'];
const HTTPS = /^https:\/\/\S+$/;
const ALPHA = 'trend-fixture-alpha';

function nonEmpty(s) {
  return typeof s === 'string' && /\S/.test(s);
}

function endsWithQuestionMark(s) {
  return typeof s === 'string' && s.trimEnd().endsWith('?');
}

function sortedLenses(list) {
  return (list || []).map((r) => r && r.lens).slice().sort();
}

/** Every Reading in the content's reveal bundles, as [{ trendId, reading }]. */
function readingsOf(content) {
  const out = [];
  for (const [trendId, bundle] of Object.entries(content.reveal)) {
    for (const reading of (bundle && bundle.readings) || []) out.push({ trendId, reading });
  }
  return out;
}

/** The fixture part and the data/ part of a content test, registered together. */
// `guard` runs on the synthetic content only: it mutates copies of fixture items by identifier and
// proves that the check reports each planted defect, so that a check that cannot fail is caught.
function contentTest(id, sentence, { guard, check, deferred = false }) {
  test(`${id} ${sentence} (synthetic content)`, { needs: deferred ? ['deferred'] : [] }, async () => {
    const content = await loadContent({ from: 'fixtures' });
    await guard(content);
    await check(content);
  });
  test(`${id} ${sentence} (data/)`, { needs: deferred ? ['deferred', 'data'] : ['data'] }, async () => {
    const content = await loadContent({ from: 'data' });
    await check(content);
  });
}

// ------------------------------------------------------------------------------------------ M4-U1

function lensProblems(content) {
  const problems = [];
  for (const trend of content.trends) {
    const refs = sortedLenses(trend.readings);
    if (refs.length !== 3 || refs.join() !== LENSES.join()) problems.push(`${trend.id}: reading references have lenses [${refs.join(', ')}], expected exactly noise, opportunity, threat`);
    const bundle = content.reveal[trend.id];
    if (!bundle) {
      problems.push(`${trend.id}: no reveal bundle`);
      continue;
    }
    const lenses = sortedLenses(bundle.readings);
    if (lenses.length !== 3 || lenses.join() !== LENSES.join()) problems.push(`${trend.id}: reveal bundle readings have lenses [${lenses.join(', ')}], expected exactly noise, opportunity, threat`);
  }
  return problems;
}

contentTest('M4-U1', 'every trend has exactly three reading references and three readings, one per lens', {
  guard(content) {
    // Guard: a duplicated lens, a missing reading and an extra reading are each caught.
    const g = clone({ trends: content.trends, reveal: content.reveal });
    g.trends[0].readings[1].lens = 'opportunity';
    g.reveal[g.trends[1].id].readings.pop();
    assert.equal(lensProblems(g).length, 2, 'guard');
    const g2 = clone({ trends: content.trends, reveal: content.reveal });
    g2.trends[0].readings.push(clone(g2.trends[0].readings[0]));
    assert.equal(lensProblems(g2).length, 1, 'guard: four references');
    assert.ok(content.trends.length > 0, 'there are trends');
  },
  check(content) {
    assert.none(lensProblems(content), 'lens defects');
  },
});

// ------------------------------------------------------------------------------------------ M4-U2

function sourceRefProblems(item, at) {
  const s = item && item.source;
  if (!s || typeof s !== 'object') return [`${at}: no source`];
  const problems = [];
  if (!(typeof s.url === 'string' && HTTPS.test(s.url))) problems.push(`${at}: source has no https:// url`);
  if (!nonEmpty(s.publisher)) problems.push(`${at}: source has no publisher`);
  if (!isIsoDate(s.publishedOn)) problems.push(`${at}: source has no publishedOn`);
  if (!isIsoDate(s.retrievedOn)) problems.push(`${at}: source has no retrievedOn`);
  return problems;
}

function readingProblems(content) {
  const problems = [];
  for (const { trendId, reading: r } of readingsOf(content)) {
    const at = `${trendId} ${r.id || r.lens}`;
    if (!nonEmpty(r.text)) problems.push(`${at}: empty text`);
    if (!Array.isArray(r.evidence) || r.evidence.length < 1) problems.push(`${at}: no evidence item`);
    if (!Array.isArray(r.counterEvidence) || r.counterEvidence.length < 1) problems.push(`${at}: no counter-evidence item`);
    (r.evidence || []).forEach((e, i) => problems.push(...sourceRefProblems(e, `${at} evidence[${i}]`)));
    (r.counterEvidence || []).forEach((e, i) => problems.push(...sourceRefProblems(e, `${at} counterEvidence[${i}]`)));
    if (!nonEmpty(r.disconfirmingCondition)) problems.push(`${at}: empty disconfirmingCondition`);
  }
  return problems;
}

contentTest('M4-U2', 'every reading has text, sourced evidence and counter-evidence, and a disconfirming condition', {
  guard(content) {
    const g = clone({ reveal: content.reveal });
    const r = g.reveal[ALPHA].readings[0];
    r.text = ' ';
    r.counterEvidence = [];
    delete r.evidence[0].source.publishedOn;
    r.disconfirmingCondition = '';
    assert.equal(readingProblems(g).length, 4, 'guard');
    assert.ok(readingsOf(content).length > 0, 'there are readings');
  },
  check(content) {
    assert.none(readingProblems(content), 'reading defects');
  },
});

// ------------------------------------------------------------------------------------------ M4-U3

const EXPLICIT = ['score', 'rank', 'confidence', 'priority'];

function bannedKeyProblems(content) {
  const problems = [];
  const parts = [['trends', content.trends]];
  for (const [id, b] of Object.entries(content.reveal)) parts.push([`reveal/${id}`, b]);
  for (const [id, c] of Object.entries(content.conversation)) parts.push([`conversation/${id}`, c]);
  for (const [where, value] of parts) {
    for (const { key, path } of allKeys(value)) {
      const hits = bannedTokensIn(key);
      if (EXPLICIT.includes(key) || hits.length) problems.push(`${where}${path}: banned key "${key}"${hits.length ? ` (${hits.join(', ')})` : ''}`);
    }
  }
  return problems;
}

contentTest('M4-U3', 'no score, rank, confidence or priority key, nor any banned token, exists in trends, reveal bundles or conversation modules', {
  guard(content) {
    const g = clone({ trends: content.trends, reveal: content.reveal, conversation: content.conversation });
    g.trends[0].readings[0].rank = 'x';
    g.reveal[ALPHA].interrogation.provenanceChecks[0].topPick = 'x';
    g.conversation[ALPHA] = { questions: [{ confidenceLevel: 'x' }] };
    assert.equal(bannedKeyProblems(g).length, 3, 'guard');
  },
  check(content) {
    assert.none(bannedKeyProblems(content), 'banned keys');
  },
});

// ------------------------------------------------------------------------------------------ M4-U4

function evidenceDateProblems(content) {
  const problems = [];
  for (const { trendId, reading: r } of readingsOf(content)) {
    const frozen = r.provenance && r.provenance.frozenOn;
    const items = [
      ...(r.evidence || []).map((e, i) => [`evidence[${i}]`, e]),
      ...(r.counterEvidence || []).map((e, i) => [`counterEvidence[${i}]`, e]),
    ];
    for (const [name, item] of items) {
      const s = (item && item.source) || {};
      const at = `${trendId} ${r.id} ${name}`;
      if (![s.publishedOn, s.retrievedOn, frozen].every(isIsoDate)) {
        problems.push(`${at}: publishedOn ${s.publishedOn}, retrievedOn ${s.retrievedOn}, reading frozenOn ${frozen} are not all ISO dates`);
      } else if (!(s.publishedOn <= s.retrievedOn && s.retrievedOn <= frozen)) {
        problems.push(`${at}: publishedOn ${s.publishedOn}, retrievedOn ${s.retrievedOn}, reading frozenOn ${frozen} out of order`);
      }
    }
  }
  return problems;
}

contentTest('M4-U4', 'every evidence and counter-evidence source has publishedOn <= retrievedOn <= the reading frozenOn', {
  guard(content) {
    const g = clone({ reveal: content.reveal });
    g.reveal[ALPHA].readings[0].evidence[0].source.publishedOn = '2026-10-02';
    g.reveal[ALPHA].readings[1].counterEvidence[0].source.retrievedOn = '2026-10-06';
    assert.equal(evidenceDateProblems(g).length, 2, 'guard');
  },
  check(content) {
    assert.none(evidenceDateProblems(content), 'evidence dates out of order');
  },
});

// ------------------------------------------------------------------------------------------ M4-U5

function lensWordProblems(content) {
  const problems = [];
  for (const t of content.trends) {
    for (const field of ['title', 'summary', 'intuitionPrompt']) {
      const hits = wholeWordHits(t[field], LENS_WORDS);
      if (hits.length) problems.push(`${t.id} ${field}: ${hits.join(', ')}`);
    }
  }
  return problems;
}

contentTest('M4-U5', 'no trend title, summary or intuition prompt uses a lens word', {
  guard(content) {
    const g = clone({ trends: content.trends });
    g.trends[0].title = 'A Promising shift';
    g.trends[0].summary = 'Mostly hype.';
    g.trends[1].intuitionPrompt = 'Is it noisy? (not noisemaker)';
    assert.equal(lensWordProblems(g).length, 3, 'guard');
  },
  check(content) {
    assert.none(lensWordProblems(content), 'lens words before the gut reading');
  },
});

// ------------------------------------------------------------------------------------------ M4-U6

function promptRunProblems(content) {
  const problems = [];
  for (const t of content.trends) {
    const bundle = content.reveal[t.id];
    if (!bundle) {
      problems.push(`${t.id}: no reveal bundle to compare with`);
      continue;
    }
    for (const { text, path } of stringLeaves(bundle.readings, '/readings')) {
      const run = sharedRun(t.intuitionPrompt, text, 6);
      if (run) problems.push(`${t.id} intuitionPrompt shares "${run}" with reveal ${path}`);
    }
  }
  return problems;
}

contentTest('M4-U6', 'no intuition prompt shares a run of six words with its trend readings', {
  guard(content) {
    assert.equal(sharedRun('One, two three four five SIX!', 'one two three four five six seven'), 'one two three four five six', 'guard');
    assert.equal(sharedRun('one two three four five x six', 'one two three four five six'), null, 'guard: five words only');
    const g = clone({ trends: content.trends, reveal: content.reveal });
    g.trends[0].intuitionPrompt = `What do you think? ${g.reveal[ALPHA].readings[2].disconfirmingCondition}`;
    assert.ok(promptRunProblems(g).length >= 1, 'guard: a prompt that quotes a reading is caught');
  },
  check(content) {
    assert.none(promptRunProblems(content), 'intuition prompts that echo a reading');
  },
});

// ------------------------------------------------------------------------------------------ M4-U7

function crossReferenceProblems(content) {
  const problems = [];
  for (const { trendId, reading: r } of readingsOf(content)) {
    for (const other of LENSES.filter((l) => l !== r.lens)) {
      const phrase = new RegExp(`(?<![\\p{L}\\p{N}])${other}\\s+reading`, 'iu');
      for (const { text, path } of stringLeaves(r)) {
        if (phrase.test(text)) problems.push(`${trendId} ${r.id}${path}: refers to the ${other} reading`);
      }
    }
  }
  return problems;
}

contentTest('M4-U7', 'no reading refers to another lens reading', {
  guard(content) {
    const g = clone({ reveal: content.reveal });
    const opp = g.reveal[ALPHA].readings.find((r) => r.lens === 'opportunity');
    opp.text = 'Unlike the Threat Reading, this one holds.';
    const noise = g.reveal[ALPHA].readings.find((r) => r.lens === 'noise');
    noise.text = 'The noise reading itself may mention its own lens.';
    assert.equal(crossReferenceProblems(g).length, 1, 'guard');
  },
  check(content) {
    assert.none(crossReferenceProblems(content), 'cross-references between readings');
  },
});

// ------------------------------------------------------------------------------------------ M4-U8

const GROUPS = ['provenanceChecks', 'assumptionProbes', 'preMortem'];

function interrogationProblems(content, max) {
  const problems = [];
  const seen = new Map();
  const note = (id, where) => {
    if (seen.has(id)) problems.push(`question identifier ${id} repeated in ${seen.get(id)} and ${where}`);
    else seen.set(id, where);
  };
  for (const [trendId, bundle] of Object.entries(content.reveal)) {
    const it = bundle && bundle.interrogation;
    if (!it) {
      problems.push(`${trendId}: no interrogation`);
      continue;
    }
    for (const group of GROUPS) {
      const qs = it[group];
      if (!Array.isArray(qs) || qs.length < 1 || qs.length > max) {
        problems.push(`${trendId} ${group}: ${Array.isArray(qs) ? qs.length : 'no'} questions, expected 1 to ${max}`);
        continue;
      }
      for (const q of qs) {
        if (!endsWithQuestionMark(q.text)) problems.push(`${trendId} ${group} ${q.id}: does not end with "?"`);
        note(q.id, `reveal/${trendId} ${group}`);
      }
    }
  }
  for (const [trendId, set] of Object.entries(content.conversation)) {
    for (const q of (set && set.questions) || []) note(q.id, `conversation/${trendId}`);
  }
  return problems;
}

contentTest('M4-U8', 'every interrogation group has one to QUESTIONS_PER_GROUP_MAX questions ending in "?", with identifiers unique across interrogations and conversations', {
  async guard(content) {
    const { QUESTIONS_PER_GROUP_MAX: max } = await importUnderTest(CONSTANTS);
    assert.ok(Number.isInteger(max) && max > 0, 'QUESTIONS_PER_GROUP_MAX is a positive integer');
    const g = clone({ reveal: content.reveal, conversation: content.conversation });
    const it = g.reveal[ALPHA].interrogation;
    it.provenanceChecks = [];
    it.assumptionProbes[0].text = 'No question mark.';
    it.preMortem = Array.from({ length: max + 1 }, (_, i) => ({ id: `q-zebra-guard-${String.fromCharCode(97 + i)}`, text: 'Why?' }));
    const firstConversation = Object.values(g.conversation)[0];
    if (firstConversation) firstConversation.questions[0].id = it.assumptionProbes[1].id;
    assert.equal(interrogationProblems(g, max).length, 3 + (firstConversation ? 1 : 0), 'guard');
  },
  async check(content) {
    const { QUESTIONS_PER_GROUP_MAX: max } = await importUnderTest(CONSTANTS);
    assert.none(interrogationProblems(content, max), 'interrogation defects');
  },
});

// ------------------------------------------------------------------------------------------ M4-U9

function c6Problems(content) {
  const problems = [];
  const check = (text, at) => {
    const hits = wholeWordHits(text, C6_TERMS);
    if (hits.length) problems.push(`${at}: ${hits.join(', ')}`);
  };
  for (const { trendId, reading: r } of readingsOf(content)) {
    const at = `${trendId} ${r.id}`;
    check(r.text, `${at} text`);
    (r.evidence || []).forEach((e, i) => check(e.claim, `${at} evidence[${i}].claim`));
    (r.counterEvidence || []).forEach((e, i) => check(e.claim, `${at} counterEvidence[${i}].claim`));
    check(r.disconfirmingCondition, `${at} disconfirmingCondition`);
  }
  for (const [trendId, bundle] of Object.entries(content.reveal)) {
    const it = (bundle && bundle.interrogation) || {};
    for (const group of GROUPS) for (const q of it[group] || []) check(q.text, `${trendId} ${group} ${q.id}`);
  }
  return problems;
}

contentTest('M4-U9', 'no reading text, claim, disconfirming condition or interrogation question uses a C-6 term', {
  guard(content) {
    const g = clone({ reveal: content.reveal });
    g.reveal[ALPHA].readings[0].text = 'The best case.';
    g.reveal[ALPHA].readings[1].counterEvidence[0].claim = 'A key   signal.';
    g.reveal[ALPHA].interrogation.preMortem[0].text = 'Who was the winner?';
    assert.equal(c6Problems(g).length, 3, 'guard');
  },
  check(content) {
    assert.none(c6Problems(content), 'C-6 terms');
  },
});

// ------------------------------------------------------------------------------------------ M4-U10

function conversationProblems(content) {
  const problems = [];
  const trendIds = new Set(content.trends.map((t) => t.id));
  for (const [file, set] of Object.entries(content.conversation)) {
    const at = `conversation/${file}`;
    if (!trendIds.has(set.trendId)) problems.push(`${at}: trendId ${set.trendId} resolves to no Trend`);
    const qs = set.questions;
    if (!Array.isArray(qs) || qs.length < 1 || qs.length > 3) {
      problems.push(`${at}: ${Array.isArray(qs) ? qs.length : 'no'} questions, expected one to three`);
      continue;
    }
    for (const q of qs) {
      if (!endsWithQuestionMark(q.text)) problems.push(`${at} ${q.id}: does not end with "?"`);
      const hits = wholeWordHits(q.text, [...C6_TERMS, ...LENS_WORDS, ...ADVICE_WORDS]);
      if (hits.length) problems.push(`${at} ${q.id}: ${hits.join(', ')}`);
    }
  }
  return problems;
}

contentTest('M4-U10', 'conversation questions are one to three lens-free questions, not advice, of a known trend', {
  deferred: true,
  guard(content) {
    assert.ok(Object.keys(content.conversation).length >= 2, 'the fixture has two conversation modules');
    const g = clone({ trends: content.trends, conversation: content.conversation });
    const [a, b] = Object.keys(g.conversation);
    g.conversation[a].questions[0].text = 'You need to talk to a customer about the risk.';
    g.conversation[b].trendId = 'trend-zebra-unknown';
    g.conversation[b].questions = Array.from({ length: 4 }, () => clone(g.conversation[b].questions[0]));
    // a: no "?", "need to", "risk" -> 2 problems; b: unknown trend, four questions -> 2 problems.
    assert.equal(conversationProblems(g).length, 4, 'guard');
  },
  check(content) {
    assert.none(conversationProblems(content), 'conversation question defects');
  },
});

// ------------------------------------------------------------------------------------------ M4-U11

function conversationRunProblems(content) {
  const problems = [];
  for (const [file, set] of Object.entries(content.conversation)) {
    const bundle = content.reveal[set.trendId];
    if (!bundle) {
      problems.push(`conversation/${file}: no reveal bundle for ${set.trendId}`);
      continue;
    }
    for (const q of set.questions || []) {
      for (const r of bundle.readings || []) {
        for (const [name, text] of [['text', r.text], ['disconfirmingCondition', r.disconfirmingCondition]]) {
          const run = sharedRun(q.text, text, 6);
          if (run) problems.push(`conversation/${file} ${q.id} shares "${run}" with ${r.id} ${name}`);
        }
      }
    }
  }
  return problems;
}

contentTest('M4-U11', 'no conversation question shares a run of six words with its trend reading texts or disconfirming conditions', {
  deferred: true,
  guard(content) {
    const g = clone({ reveal: content.reveal, conversation: content.conversation });
    const set = Object.values(g.conversation)[0];
    assert.ok(set, 'the fixture has a conversation module');
    const r = g.reveal[set.trendId].readings[1];
    r.text = 'zebra unique words one two three four five six seven for the guard.';
    set.questions[0].text = 'Whom could you ask about zebra unique words one two three four?';
    assert.equal(conversationRunProblems(g).length, 1, 'guard');
  },
  check(content) {
    assert.none(conversationRunProblems(content), 'conversation questions that echo a reading');
  },
});
