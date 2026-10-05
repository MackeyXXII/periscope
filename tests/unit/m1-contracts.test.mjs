// M1 Data contracts: unit tests M1-U1 to M1-U10, M1-U12, M1-U15 and M1-U17 to M1-U20.
// The freeze tests (M1-U11, M1-U13, M1-U14, M1-U16) are in m1-freeze.test.mjs.
// Written from docs/04-module-design.md (M1) before any M1 module exists (test-first rule).
//
// Status at G2: tests that depend only on tooling, fixtures and schemas/ (status T) should pass;
// every test that imports assets/js/contracts/* fails with "module under test could not be
// imported" until the Implementer builds M1; every data/ part is skipped with "needs data/ (G3)".
//
// ASSUMED CALL SIGNATURES. The module design fixes the argument lists of checkReadiness and
// checkScenarioRecord only. For the others these tests pass the context a check plausibly needs
// as an extra argument, which a one-argument implementation simply ignores:
//   checkTrend(trend, signals)          signals: the Signal array (to resolve signalIds)
//   checkRevealBundle(bundle, trend)    trend: the Trend whose reading references the bundle must match
//   checkConversation(set, trend)       trend: the Trend the set belongs to
//   checkSignal(signal), checkBrief(brief), checkGovernance(container), checkLogEntry(entry),
//   checkJudgement(judgement)
// Reported to the Orchestrator as a specification gap; change here, in one place, if the
// Architect fixes different signatures.

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { importUnderTest, importJson, readText, listFiles, repoUrl, IS_NODE } from '../lib/env.mjs';
import { SCHEMAS, SCHEMA_FILES, contractValidator, schemaForModule } from '../lib/schemas.mjs';
import { KEYWORDS, SchemaKeywordError, createValidator, collectKeywords } from '../lib/mini-schema.mjs';
import { loadContent, loadSession, clone, fixturePathFor } from '../lib/content.mjs';
import {
  bannedTokensIn, subschemas, allKeys, objectPaths, pathsOfKey, getAt, setAt, showPath,
} from '../lib/contract-rules.mjs';
import { CANDIDATE_LEVEL_NAMES, candidatesIn } from '../lib/candidate-level-names.mjs';
import { SHIPPED_FILES } from '../lib/files.mjs';
import { permutations } from '../lib/seeded-random.mjs';

const VOCABULARY = repoUrl('assets/js/contracts/vocabulary.js');
const CONSTANTS = repoUrl('assets/js/contracts/constants.js');
const VALIDATE = repoUrl('assets/js/contracts/validate.js');
const LOAD = repoUrl('assets/js/contracts/load.js');

const FIXTURE_LEVEL_NAMES = Object.freeze(['Fixture level one', 'Fixture level two', 'Fixture level three']);
const SIX_LABELS = ['real', 'ai-generated', 'frozen', 'fictional', 'replay', 'yours'];
const ALPHA = 'trend-fixture-alpha';

// ------------------------------------------------------------------------------------------ helpers

function schemaErrors(schemaFile, value, where) {
  const result = contractValidator().validate(schemaFile, value);
  if (result.ok) return [];
  return result.errors.map((e) => `${where} ${e.path} [${e.keyword}] ${e.message}`);
}

function moduleFileName(content, dataPath) {
  return content.from === 'fixtures' ? fixturePathFor(dataPath) : dataPath;
}

/** Calls a runtime check and classifies its verdict without ever letting it throw. */
function verdict(fn) {
  try {
    const r = fn();
    if (r && r.ok === true) return 'accepted';
    if (r && r.ok === false) return 'rejected';
    return `returned neither { ok: true } nor { ok: false } (${JSON.stringify(r)})`;
  } catch (error) {
    return `threw ${error && error.name}: ${error && error.message} (checks must never throw)`;
  }
}

function schemaVerdict(schemaFile, value) {
  return contractValidator().validate(schemaFile, value).ok ? 'accepted' : 'rejected';
}

// ------------------------------------------------------------------------------------------ M1-U1

function validateContentModules(content) {
  const problems = [];
  for (const [dataPath, value] of content.modules) {
    const file = moduleFileName(content, dataPath);
    const map = schemaForModule(dataPath);
    if (!map) {
      problems.push(`${file}: no schema is defined for this module`);
      continue;
    }
    if (map.each) {
      if (!Array.isArray(value)) {
        problems.push(`${file}: expected an array of entities`);
        continue;
      }
      value.forEach((item, i) => problems.push(...schemaErrors(map.schema, item, `${file} [${i}]`)));
    } else {
      problems.push(...schemaErrors(map.schema, value, file));
    }
  }
  return problems;
}

test('M1-U1 every synthetic content module and session sample validates against its schema', async () => {
  const content = await loadContent({ from: 'fixtures' });
  const problems = validateContentModules(content);
  problems.push(
    ...schemaErrors('readiness-profile.schema.json', content.readinessVerified, 'tests/fixtures/content/readiness-verified.js'),
  );
  const session = await loadSession();
  problems.push(...schemaErrors('judgement.schema.json', session.judgement, 'tests/fixtures/session/judgement.js'));
  problems.push(
    ...schemaErrors('scenario-record.schema.json', session.scenarioRecord, 'tests/fixtures/session/scenario-record.js'),
  );
  assert.ok(content.modules.size >= 9, 'the synthetic manifest lists the expected modules');
  assert.none(problems, 'schema violations');
});

test('M1-U1 every module in data/ validates against its schema', { needs: ['data'] }, async () => {
  const content = await loadContent({ from: 'data' });
  assert.none(validateContentModules(content), 'schema violations in data/');
});

// ------------------------------------------------------------------------------------------ M1-U2

test('M1-U2 no property name or required entry in schemas/ contains a banned token', () => {
  // Guard: the tokeniser must find tokens inside compound names, or this test could not fail.
  assert.deepEqual(bannedTokensIn('isFeatured'), ['featured']);
  assert.deepEqual(bannedTokensIn('top-score'), ['top', 'score']);
  const problems = [];
  for (const file of SCHEMA_FILES) {
    for (const { node, at } of subschemas(SCHEMAS[file], `schemas/${file}#`)) {
      for (const name of Object.keys(node.properties || {})) {
        const hits = bannedTokensIn(name);
        if (hits.length) problems.push(`${at}/properties/${name}: ${hits.join(', ')}`);
      }
      for (const name of node.required || []) {
        const hits = bannedTokensIn(name);
        if (hits.length) problems.push(`${at}/required "${name}": ${hits.join(', ')}`);
      }
    }
  }
  assert.none(problems, 'banned names in schemas/');
});

function bannedKeysInContent(content) {
  const problems = [];
  for (const [dataPath, value] of content.modules) {
    for (const { key, path } of allKeys(value)) {
      const hits = bannedTokensIn(key);
      if (hits.length) problems.push(`${moduleFileName(content, dataPath)} ${path}: ${hits.join(', ')}`);
    }
  }
  return problems;
}

test('M1-U2 no key in any synthetic content module or session sample contains a banned token', async () => {
  const content = await loadContent({ from: 'fixtures' });
  const problems = bannedKeysInContent(content);
  const session = await loadSession();
  const extra = {
    'tests/fixtures/content/readiness-verified.js': content.readinessVerified,
    'tests/fixtures/session/judgement.js': session.judgement,
    'tests/fixtures/session/scenario-record.js': session.scenarioRecord,
  };
  for (const [file, value] of Object.entries(extra)) {
    for (const { key, path } of allKeys(value)) {
      const hits = bannedTokensIn(key);
      if (hits.length) problems.push(`${file} ${path}: ${hits.join(', ')}`);
    }
  }
  assert.none(problems, 'banned keys in fixtures');
});

test('M1-U2 no key in any module in data/ contains a banned token', { needs: ['data'] }, async () => {
  assert.none(bannedKeysInContent(await loadContent({ from: 'data' })), 'banned keys in data/');
});

// ------------------------------------------------------------------------------------------ M1-U3

test('M1-U3 no schema declares type number, integer or boolean at any depth', () => {
  const problems = [];
  for (const file of SCHEMA_FILES) {
    for (const { node, at } of subschemas(SCHEMAS[file], `schemas/${file}#`)) {
      if (!('type' in node)) continue;
      const types = Array.isArray(node.type) ? node.type : [node.type];
      const bad = types.filter((t) => t === 'number' || t === 'integer' || t === 'boolean');
      if (bad.length) problems.push(`${at}: type ${bad.join(', ')}`);
    }
  }
  assert.none(problems, 'numeric or boolean types');
});

// ------------------------------------------------------------------------------------------ M1-U4

test('M1-U4 every object subschema in schemas/ declares additionalProperties false', () => {
  const problems = [];
  let objects = 0;
  for (const file of SCHEMA_FILES) {
    for (const { node, at } of subschemas(SCHEMAS[file], `schemas/${file}#`)) {
      const types = 'type' in node ? (Array.isArray(node.type) ? node.type : [node.type]) : [];
      if (!types.includes('object')) continue;
      objects += 1;
      if (node.additionalProperties !== false) problems.push(`${at}: additionalProperties is not false`);
    }
  }
  assert.ok(objects > 20, 'the walker found the object subschemas');
  assert.none(problems, 'open objects');
});

// ------------------------------------------------------------------------------------------ M1-U5

function patternSource(p) {
  return p instanceof RegExp ? p.source : p;
}

test('M1-U5 every schema enumeration, identifier pattern and bound agrees with vocabulary.js and constants.js', async () => {
  const vocabulary = await importUnderTest(VOCABULARY);
  const constants = await importUnderTest(CONSTANTS);
  const lists = ['LABELS', 'LENSES', 'PRODUCERS', 'MATURITY_STATUSES', 'READINESS_CATEGORY_KEYS', 'PRACTICE_KEYS'];
  const problems = [];
  for (const name of lists) {
    if (!Array.isArray(vocabulary[name])) problems.push(`vocabulary.js does not export the array ${name}`);
  }
  assert.none(problems, 'missing allowlists');

  // Every enum is equal to, or a subset of, one allowlist.
  for (const file of SCHEMA_FILES) {
    for (const { node, at } of subschemas(SCHEMAS[file], `schemas/${file}#`)) {
      if (!('enum' in node)) continue;
      const fits = lists.some((name) => node.enum.every((v) => vocabulary[name].includes(v)));
      if (!fits) problems.push(`${at}: enum ${JSON.stringify(node.enum)} is not within any allowlist`);
    }
  }

  // The four shared enumerations equal their constants exactly (as sets of the same size).
  const common = SCHEMAS['common.schema.json'].$defs;
  const sameSet = (a, b) => a.length === b.length && a.every((v) => b.includes(v));
  for (const [def, name] of [['label', 'LABELS'], ['lens', 'LENSES'], ['producer', 'PRODUCERS'], ['practiceKey', 'PRACTICE_KEYS']]) {
    if (!sameSet(common[def].enum, vocabulary[name])) {
      problems.push(`common.schema.json $defs/${def} ${JSON.stringify(common[def].enum)} differs from ${name} ${JSON.stringify(vocabulary[name])}`);
    }
  }
  if (!sameSet(vocabulary.LABELS, SIX_LABELS)) problems.push(`LABELS is not the six values ${SIX_LABELS.join(', ')}`);

  // Identifier patterns: every $defs entry of common.schema.json whose name ends in "Id".
  const ids = vocabulary.ID_PATTERNS || {};
  for (const [def, schema] of Object.entries(common)) {
    if (!/Id$/.test(def) || typeof schema.pattern !== 'string') continue;
    if (!(def in ids)) problems.push(`ID_PATTERNS has no entry for ${def}`);
    else if (patternSource(ids[def]) !== schema.pattern) {
      problems.push(`ID_PATTERNS.${def} ${patternSource(ids[def])} differs from the schema pattern ${schema.pattern}`);
    }
  }

  // LABEL_DISPLAY has exactly the six keys.
  const display = vocabulary.LABEL_DISPLAY || {};
  if (!sameSet(Object.keys(display), SIX_LABELS)) {
    problems.push(`LABEL_DISPLAY keys ${JSON.stringify(Object.keys(display))} are not the six labels`);
  }

  // Bounds repeated in schemas equal the constants.
  const briefMax = SCHEMAS['brief.schema.json'].properties.signalIds.maxItems;
  if (briefMax !== constants.BRIEF_SIGNAL_CAP) {
    problems.push(`brief.schema.json signalIds.maxItems ${briefMax} differs from BRIEF_SIGNAL_CAP ${constants.BRIEF_SIGNAL_CAP}`);
  }
  const groups = [
    ['interrogation.schema.json', 'provenanceChecks'],
    ['interrogation.schema.json', 'assumptionProbes'],
    ['interrogation.schema.json', 'preMortem'],
    ['conversation-questions.schema.json', 'questions'],
  ];
  for (const [file, prop] of groups) {
    const max = SCHEMAS[file].properties[prop].maxItems;
    if (max !== constants.QUESTIONS_PER_GROUP_MAX) {
      problems.push(`${file} ${prop}.maxItems ${max} differs from QUESTIONS_PER_GROUP_MAX ${constants.QUESTIONS_PER_GROUP_MAX}`);
    }
  }
  assert.none(problems, 'disagreements between schemas and vocabulary/constants');
});

// ------------------------------------------------------------------------------------------ M1-U6

/** The valid samples of every entity and container, with the runtime check that matches each. */
async function mutationSamples() {
  const c = await loadContent({ from: 'fixtures' });
  const s = await loadSession();
  const alpha = c.trends.find((t) => t.id === ALPHA);
  return [
    { kind: 'Signal', schema: 'signal.schema.json', value: c.signals.find((x) => x.quote), check: (V, v) => V.checkSignal(v) },
    { kind: 'Trend', schema: 'trend.schema.json', value: alpha, check: (V, v) => V.checkTrend(v, c.signals) },
    { kind: 'RevealBundle', schema: 'reveal-bundle.schema.json', value: c.reveal[ALPHA], check: (V, v) => V.checkRevealBundle(v, alpha) },
    { kind: 'ConversationQuestions', schema: 'conversation-questions.schema.json', value: c.conversation[ALPHA], check: (V, v) => V.checkConversation(v, alpha) },
    { kind: 'Brief', schema: 'brief.schema.json', value: c.brief, check: (V, v) => V.checkBrief(v) },
    { kind: 'ReadinessProfile (unverified)', schema: 'readiness-profile.schema.json', value: c.readiness, check: (V, v) => V.checkReadiness(v, { levelNames: [] }) },
    { kind: 'ReadinessProfile (verified)', schema: 'readiness-profile.schema.json', value: c.readinessVerified, check: (V, v) => V.checkReadiness(v, { levelNames: FIXTURE_LEVEL_NAMES }) },
    { kind: 'Governance', schema: 'governance.schema.json', value: c.governance, check: (V, v) => V.checkGovernance(v) },
    { kind: 'LogEntry', schema: 'log-entry.schema.json', value: c.log.find((e) => e.originalSignals.length > 1), check: (V, v) => V.checkLogEntry(v) },
    { kind: 'Judgement', schema: 'judgement.schema.json', value: s.judgement, check: (V, v) => V.checkJudgement(v) },
    { kind: 'ScenarioRecord', schema: 'scenario-record.schema.json', value: s.scenarioRecord, check: (V, v) => V.checkScenarioRecord(v, s.judgement) },
    // validate.js names no check for the freeze manifest, so only the schema side applies to it.
    { kind: 'FreezeManifest', schema: 'freeze-manifest.schema.json', value: c.freeze, check: null },
  ];
}

function mutant(base, label, change) {
  const value = clone(base);
  change(value);
  return { label, value };
}

/** Every mutant M1-U6 names, for one sample. */
function mutantsOf(sample) {
  const out = [];
  const v = sample.value;
  for (const key of SCHEMAS[sample.schema].required || []) {
    out.push(mutant(v, `required property "${key}" removed`, (m) => delete m[key]));
  }
  for (const path of objectPaths(v)) {
    out.push(mutant(v, `score: "x" added at ${showPath(path)}`, (m) => { getAt(m, path).score = 'x'; }));
  }
  for (const path of pathsOfKey(v, 'label')) {
    out.push(mutant(v, `label set to "verified" at ${showPath(path)}`, (m) => setAt(m, path, 'verified')));
  }
  const kind = sample.kind;
  if (kind === 'Trend' || kind === 'RevealBundle') {
    out.push(mutant(v, 'a reading lens duplicated', (m) => { m.readings[1].lens = m.readings[0].lens; }));
    out.push(mutant(v, 'a fourth reading added', (m) => { m.readings.push(clone(m.readings[2])); }));
    out.push(mutant(v, 'one reading removed', (m) => { m.readings.pop(); }));
  }
  if (kind === 'RevealBundle') {
    out.push(mutant(v, "an evidence item's publishedOn removed", (m) => { delete m.readings[0].evidence[0].source.publishedOn; }));
    out.push(mutant(v, 'four pre-mortem questions', (m) => {
      while (m.interrogation.preMortem.length < 4) {
        m.interrogation.preMortem.push({ id: `q-mutant-${'abcd'[m.interrogation.preMortem.length]}`, text: 'zebra-mutant question?' });
      }
    }));
  }
  if (kind === 'Judgement') {
    for (const r of ['', ' ', '\n\t']) out.push(mutant(v, `rationale ${JSON.stringify(r)}`, (m) => { m.rationale = r; }));
    out.push(mutant(v, 'intuition removed', (m) => { delete m.intuition; }));
    out.push(mutant(v, 'label "ai-generated"', (m) => { m.label = 'ai-generated'; }));
  }
  if (kind === 'Signal') {
    out.push(mutant(v, 'provenance.sourceUrl null', (m) => { m.provenance.sourceUrl = null; }));
    out.push(mutant(v, 'label "yours"', (m) => { m.label = 'yours'; }));
  }
  if (kind === 'Governance') {
    out.push(mutant(v, 'argument item label removed', (m) => { delete m.argument[0].label; }));
    out.push(mutant(v, 'argument item label "real"', (m) => { m.argument[0].label = 'real'; }));
  }
  if (kind === 'ConversationQuestions') {
    out.push(mutant(v, 'question text without "?"', (m) => { m.questions[0].text = 'zebra-mutant statement.'; }));
    out.push(mutant(v, 'four questions', (m) => {
      while (m.questions.length < 4) m.questions.push({ id: `q-mutant-${'abcd'[m.questions.length]}`, text: 'zebra-mutant question?' });
    }));
  }
  if (kind === 'ReadinessProfile (unverified)') {
    out.push(mutant(v, 'unverified practice with a level name other than the placeholder', (m) => {
      m.maturity.practices[0].levelName = FIXTURE_LEVEL_NAMES[0];
    }));
  }
  if (kind === 'ScenarioRecord') {
    out.push(mutant(v, 'whatWasHeard " "', (m) => { m.whatWasHeard = ' '; }));
  }
  return out;
}

test('M1-U6 mini-schema accepts every valid sample and rejects every mutant', async () => {
  const problems = [];
  let count = 0;
  for (const sample of await mutationSamples()) {
    if (schemaVerdict(sample.schema, sample.value) !== 'accepted') {
      problems.push(`${sample.kind}: the valid sample is rejected (${schemaErrors(sample.schema, sample.value, '').join('; ')})`);
    }
    for (const m of mutantsOf(sample)) {
      count += 1;
      if (schemaVerdict(sample.schema, m.value) !== 'rejected') problems.push(`${sample.kind}: mutant accepted: ${m.label}`);
    }
  }
  assert.ok(count > 150, `mutants were generated (${count})`);
  assert.none(problems, 'schema disagreements');
});

test('M1-U6 validate.js accepts every valid sample and rejects every mutant', async () => {
  const V = await importUnderTest(VALIDATE);
  const problems = [];
  for (const sample of await mutationSamples()) {
    if (!sample.check) continue;
    const ok = verdict(() => sample.check(V, sample.value));
    if (ok !== 'accepted') problems.push(`${sample.kind}: the valid sample is not accepted: ${ok}`);
    for (const m of mutantsOf(sample)) {
      const r = verdict(() => sample.check(V, m.value));
      if (r !== 'rejected') problems.push(`${sample.kind}: mutant ${m.label}: ${r}`);
    }
  }
  assert.none(problems, 'runtime-check disagreements');
});

// ------------------------------------------------------------------------------------------ M1-U7

test('M1-U7 mini-schema supports every keyword used in schemas/', () => {
  const problems = [];
  for (const file of SCHEMA_FILES) {
    for (const { keyword, at } of collectKeywords(SCHEMAS[file], `schemas/${file}#`)) {
      if (!KEYWORDS.includes(keyword)) problems.push(`${at}: ${keyword}`);
    }
  }
  assert.none(problems, 'unsupported keywords');
  createValidator(SCHEMAS); // throws on an unsupported keyword or a dangling $ref
});

test('M1-U7 mini-schema throws on a schema that uses a keyword outside its list', async () => {
  const bad = await importJson(repoUrl('tests/fixtures/invalid/bad-schema.json'));
  const error = assert.throws(() => createValidator([bad]), SchemaKeywordError);
  assert.equal(error.keyword, 'exclusiveMinimum');
});

test('M1-U7 the schemas loaded by the tests are exactly the files in schemas/', { needs: ['fs'] }, async () => {
  const onDisk = (await listFiles(repoUrl('schemas/'))).filter((f) => f.endsWith('.json'));
  assert.deepEqual(onDisk, [...SCHEMA_FILES].sort(), 'tests/lib/schemas.mjs against schemas/');
});

test('M1-U7 mini-schema enforces each supported keyword', () => {
  const other = { $id: 'https://mini-schema.invalid/other.json', $defs: { word: { type: 'string', pattern: '^[a-z]+$' } } };
  const cases = [
    [{ type: 'string' }, 'a', 1],
    [{ type: ['string', 'null'] }, null, true],
    [{ type: 'object' }, {}, []],
    [{ enum: ['a', 'b'] }, 'b', 'c'],
    [{ const: 'yours' }, 'yours', 'Yours'],
    [{ required: ['a'] }, { a: 1 }, { b: 1 }],
    [{ properties: { a: { type: 'string' } } }, { a: 'x' }, { a: 2 }],
    [{ properties: { a: {} }, additionalProperties: false }, { a: 1 }, { a: 1, score: 'x' }],
    [{ items: { type: 'string' } }, ['a'], ['a', 2]],
    [{ minItems: 1 }, [1], []],
    [{ maxItems: 1 }, [1], [1, 2]],
    [{ uniqueItems: true }, [{ a: 1 }, { a: 2 }], [{ a: 1 }, { a: 1 }]],
    [{ contains: { const: 'x' } }, ['x'], ['y']],
    [{ contains: { const: 'x' }, minContains: 1, maxContains: 1 }, ['x', 'y'], ['x', 'x']],
    [{ pattern: '\\S' }, ' a ', ' \n\t'],
    [{ minLength: 2 }, 'ab', 'ä'],
    [{ maxLength: 2 }, 'äö', 'abc'],
    [{ allOf: [{ type: 'string' }, { minLength: 2 }] }, 'ab', 'a'],
    [{ oneOf: [{ type: 'string' }, { type: 'null' }] }, null, 1],
    [{ oneOf: [{ minLength: 1 }, { maxLength: 5 }] }, '', 'abc'],
    [{ not: { const: 'LEVEL_NAME_UNVERIFIED' } }, 'x', 'LEVEL_NAME_UNVERIFIED'],
    [{ if: { const: 'a' }, then: { minLength: 2 }, else: { const: 'b' } }, 'b', 'c'],
    [{ if: { const: 'a' }, then: { minLength: 2 } }, 'z', 'a'],
    [{ $defs: { w: { const: 'w' } }, $ref: '#/$defs/w' }, 'w', 'v'],
    [{ $ref: 'other.json#/$defs/word' }, 'abc', 'ABC'],
  ];
  const problems = [];
  cases.forEach(([schema, good, badValue], i) => {
    const s = { $id: `https://mini-schema.invalid/case-${i}.json`, ...schema };
    const v = createValidator([s, other]);
    if (!v.validate(s, good).ok) problems.push(`case ${i} ${JSON.stringify(schema)} rejects ${JSON.stringify(good)}`);
    if (v.validate(s, badValue).ok) problems.push(`case ${i} ${JSON.stringify(schema)} accepts ${JSON.stringify(badValue)}`);
  });
  assert.throws(() => createValidator([{ $id: 'https://mini-schema.invalid/x.json', $ref: 'missing.json' }]), /cannot resolve/);
  assert.throws(() => createValidator([{ items: [{ type: 'string' }] }]), SchemaKeywordError);
  assert.none(problems, 'interpreter errors');
});

// ------------------------------------------------------------------------------------------ M1-U8

async function readingReferenceCases() {
  const c = await loadContent({ from: 'fixtures' });
  const trend = c.trends.find((t) => t.id === ALPHA);
  const byLens = Object.fromEntries(trend.readings.map((r) => [r.lens, r]));
  const withRefs = (refs) => ({ ...clone(trend), readings: clone(refs) });
  const invalid = [
    ['[opportunity, opportunity, noise]', withRefs([byLens.opportunity, { ...byLens.threat, lens: 'opportunity' }, byLens.noise])],
    ['[opportunity, threat]', withRefs([byLens.opportunity, byLens.threat])],
    ['four references', withRefs([byLens.opportunity, byLens.threat, byLens.noise, byLens.noise])],
  ];
  const valid = permutations(trend.readings).map((order) => [order.map((r) => r.lens).join(', '), withRefs(order)]);
  return { invalid, valid, signals: c.signals };
}

test('M1-U8 the schema rejects invalid reading-reference sets and accepts all six orderings', async () => {
  const { invalid, valid } = await readingReferenceCases();
  assert.equal(valid.length, 6);
  const problems = [];
  for (const [label, t] of invalid) if (schemaVerdict('trend.schema.json', t) !== 'rejected') problems.push(`accepted ${label}`);
  for (const [label, t] of valid) if (schemaVerdict('trend.schema.json', t) !== 'accepted') problems.push(`rejected ordering ${label}`);
  assert.none(problems, 'schema errors');
});

test('M1-U8 checkTrend rejects invalid reading-reference sets and accepts all six orderings', async () => {
  const V = await importUnderTest(VALIDATE);
  const { invalid, valid, signals } = await readingReferenceCases();
  const problems = [];
  for (const [label, t] of invalid) {
    const r = verdict(() => V.checkTrend(t, signals));
    if (r !== 'rejected') problems.push(`${label}: ${r}`);
  }
  for (const [label, t] of valid) {
    const r = verdict(() => V.checkTrend(t, signals));
    if (r !== 'accepted') problems.push(`ordering ${label}: ${r}`);
  }
  assert.none(problems, 'checkTrend errors');
});

// ------------------------------------------------------------------------------------------ M1-U9

function referentialProblems(content) {
  const problems = [];
  const signalIds = new Set(content.signals.map((s) => s.id));
  const trendIds = new Set(content.trends.map((t) => t.id));
  const slugOf = (trendId) => trendId.slice('trend-'.length);

  for (const t of content.trends) {
    for (const id of t.signalIds) if (!signalIds.has(id)) problems.push(`${t.id}: signalIds entry ${id} resolves to no Signal`);
    const bundle = content.reveal[t.id];
    if (!bundle) {
      problems.push(`${t.id}: no reveal bundle`);
      continue;
    }
    if (bundle.trendId !== t.id) problems.push(`reveal bundle for ${t.id} has trendId ${bundle.trendId}`);
    for (const r of bundle.readings) {
      const ref = t.readings.find((x) => x.lens === r.lens);
      if (r.trendId !== bundle.trendId) problems.push(`${r.id}: trendId ${r.trendId} differs from its bundle's ${bundle.trendId}`);
      if (!ref || ref.readingId !== r.id) problems.push(`${r.id}: the Trend holds ${ref && ref.readingId} for lens ${r.lens}`);
      const expected = `reading-${slugOf(t.id)}-${r.lens}`;
      if (r.id !== expected) problems.push(`${r.id}: expected identifier ${expected}`);
    }
    if (bundle.interrogation.trendId !== bundle.trendId) {
      problems.push(`${bundle.interrogation.id}: trendId ${bundle.interrogation.trendId} differs from its bundle's`);
    }
  }
  for (const key of Object.keys(content.reveal)) if (!trendIds.has(key)) problems.push(`reveal bundle for unknown trend ${key}`);

  const conversationKeys = Object.keys(content.conversation);
  if (conversationKeys.length > 0) {
    for (const t of content.trends) {
      const set = content.conversation[t.id];
      if (!set) {
        problems.push(`${t.id}: no conversation module, while others exist (a partial set)`);
        continue;
      }
      if (set.trendId !== t.id) problems.push(`conversation module for ${t.id} has trendId ${set.trendId}`);
      if (set.id !== `conversation-${slugOf(t.id)}`) problems.push(`${set.id}: expected conversation-${slugOf(t.id)}`);
    }
    for (const key of conversationKeys) if (!trendIds.has(key)) problems.push(`conversation module for unknown trend ${key}`);
  }

  for (const id of content.brief.signalIds) if (!signalIds.has(id)) problems.push(`brief: signalIds entry ${id} resolves to no Signal`);

  const seen = new Map();
  for (const s of content.signals) {
    const url = s.provenance.sourceUrl;
    if (seen.has(url)) problems.push(`${s.id} and ${seen.get(url)} share sourceUrl ${url}`);
    else seen.set(url, s.id);
  }
  return problems;
}

test('M1-U9 the synthetic content is referentially intact', async () => {
  const content = await loadContent({ from: 'fixtures' });
  assert.none(referentialProblems(content), 'dangling or disagreeing references');
  // Guard: the check must see a broken reference, or it could not fail.
  const broken = { ...content, trends: clone(content.trends) };
  broken.trends[0].signalIds = ['sig-2026-01-01-zebra-missing'];
  assert.ok(referentialProblems(broken).length > 0, 'a dangling signal reference is detected');
});

test('M1-U9 the content in data/ is referentially intact', { needs: ['data'] }, async () => {
  assert.none(referentialProblems(await loadContent({ from: 'data' })), 'dangling or disagreeing references in data/');
});

test('M1-U9 every trend in data/ has its conversation module', { needs: ['data', 'questions'] }, async () => {
  const content = await loadContent({ from: 'data' });
  const missing = content.trends.filter((t) => !content.conversation[t.id]).map((t) => t.id);
  assert.none(missing, 'trends without a conversation module while SCENARIO_FLOW is interactive');
});

// ------------------------------------------------------------------------------------------ M1-U10

test('M1-U10 checkJudgement accepts the valid Judgement and rejects each invalid one', async () => {
  const V = await importUnderTest(VALIDATE);
  const { judgement } = await loadSession();
  const cases = [
    mutant(judgement, 'no intuition', (m) => { delete m.intuition; }),
    mutant(judgement, 'rationale ""', (m) => { m.rationale = ''; }),
    mutant(judgement, 'rationale "   "', (m) => { m.rationale = '   '; }),
    mutant(judgement, 'rationale "\\n"', (m) => { m.rationale = '\n'; }),
    mutant(judgement, 'readingsRevealedAt earlier than intuition.recordedAt', (m) => { m.readingsRevealedAt = '2026-10-05T08:59:59.000Z'; }),
    mutant(judgement, 'committedAt earlier than readingsRevealedAt', (m) => { m.committedAt = '2026-10-05T09:00:00.500Z'; }),
    ...SIX_LABELS.filter((l) => l !== 'yours').map((l) => mutant(judgement, `label "${l}"`, (m) => { m.label = l; })),
  ];
  const problems = [];
  const ok = verdict(() => V.checkJudgement(clone(judgement)));
  if (ok !== 'accepted') problems.push(`valid Judgement: ${ok}`);
  for (const c of cases) {
    const r = verdict(() => V.checkJudgement(c.value));
    if (r !== 'rejected') problems.push(`${c.label}: ${r}`);
  }
  assert.none(problems, 'checkJudgement errors');
});

// ------------------------------------------------------------------------------------------ M1-U12

test('M1-U12 loadReveal and loadConversation refuse malformed and unknown identifiers without importing', async () => {
  const L = await importUnderTest(LOAD);
  const calls = [];
  const importer = async (path) => {
    calls.push(String(path));
    const m = /data\/(.+\.js)$/.exec(String(path));
    if (!m) throw new Error(`fixture importer: no fixture for ${path}`);
    return import(repoUrl(fixturePathFor(`data/${m[1]}`)).href);
  };
  const loader = L.createLoader({ importer });
  const allowed = (p) => /data\/(trends|freeze)\.js$/.test(p);
  const problems = [];
  for (const fn of ['loadReveal', 'loadConversation']) {
    for (const id of ['../x', 'trend-unknown', 'Trend-A']) {
      calls.length = 0;
      let result;
      try {
        result = await loader[fn](id);
      } catch (error) {
        problems.push(`${fn}(${JSON.stringify(id)}) threw: ${error && error.message}`);
        continue;
      }
      const forbidden = calls.filter((p) => !allowed(p));
      if (forbidden.length) problems.push(`${fn}(${JSON.stringify(id)}) called the importer with ${forbidden.join(', ')}`);
      if (!result || result.ok !== false) problems.push(`${fn}(${JSON.stringify(id)}) did not resolve to { ok: false }`);
    }
  }
  // Guard: with a known identifier the importer is reached, so the spy is wired correctly.
  calls.length = 0;
  await loader.loadReveal(ALPHA);
  if (!calls.some((p) => p.includes(`reveal/${ALPHA}.js`))) problems.push('loadReveal(trend-fixture-alpha) never reached the importer');
  assert.none(problems, 'loader guard failures');
});

// ------------------------------------------------------------------------------------------ M1-U15

test('M1-U15 constants.js holds the values fixed by DM-9 and a valid SCENARIO_FLOW', async () => {
  const c = await importUnderTest(CONSTANTS);
  const expected = {
    BRIEF_SIGNAL_CAP: 5,
    READING_WPM: 200,
    QUOTE_MAX_WORDS: 15,
    REPLAY_WINDOW_START: '2026-01-01',
    REPLAY_WINDOW_END: '2026-03-31',
    QUESTIONS_PER_GROUP_MAX: 3,
  };
  const problems = [];
  for (const [name, value] of Object.entries(expected)) {
    if (!Object.is(c[name], value)) problems.push(`${name} is ${JSON.stringify(c[name])}, expected ${JSON.stringify(value)}`);
  }
  if (c.SCENARIO_FLOW !== 'static' && c.SCENARIO_FLOW !== 'interactive') {
    problems.push(`SCENARIO_FLOW is ${JSON.stringify(c.SCENARIO_FLOW)}, expected 'static' or 'interactive'`);
  }
  assert.none(problems, 'constant mismatches');
});

// ------------------------------------------------------------------------------------------ M1-U17

function governanceLabelProblems(g, file) {
  const problems = [];
  if (g.label !== 'real') problems.push(`${file}: container label is ${JSON.stringify(g.label)}, expected "real"`);
  g.argument.forEach((item, i) => {
    if (item.label !== 'ai-generated') problems.push(`${file} /argument/${i}: label ${JSON.stringify(item.label)}, expected "ai-generated"`);
  });
  return problems;
}

function governanceMutants(g) {
  return [
    mutant(g, 'argument item with no label', (m) => { delete m.argument[0].label; }),
    mutant(g, 'argument item labelled "real"', (m) => { m.argument[0].label = 'real'; }),
    mutant(g, 'argument item labelled "yours"', (m) => { m.argument[0].label = 'yours'; }),
  ];
}

test('M1-U17 every synthetic governance argument item is ai-generated and the container real', async () => {
  const c = await loadContent({ from: 'fixtures' });
  assert.none(governanceLabelProblems(c.governance, 'tests/fixtures/content/governance.js'), 'label errors');
});

test('M1-U17 every governance argument item in data/ is ai-generated and the container real', { needs: ['data'] }, async () => {
  const c = await loadContent({ from: 'data' });
  assert.none(governanceLabelProblems(c.governance, 'data/governance.js'), 'label errors');
});

test('M1-U17 the governance schema rejects argument items with no label, "real" or "yours"', async () => {
  const c = await loadContent({ from: 'fixtures' });
  const problems = governanceMutants(c.governance)
    .filter((m) => schemaVerdict('governance.schema.json', m.value) !== 'rejected')
    .map((m) => `accepted: ${m.label}`);
  assert.none(problems, 'schema errors');
});

test('M1-U17 checkGovernance accepts the valid container and rejects argument items with no label, "real" or "yours"', async () => {
  const V = await importUnderTest(VALIDATE);
  const c = await loadContent({ from: 'fixtures' });
  const problems = [];
  const ok = verdict(() => V.checkGovernance(clone(c.governance)));
  if (ok !== 'accepted') problems.push(`valid container: ${ok}`);
  for (const m of governanceMutants(c.governance)) {
    const r = verdict(() => V.checkGovernance(m.value));
    if (r !== 'rejected') problems.push(`${m.label}: ${r}`);
  }
  assert.none(problems, 'checkGovernance errors');
});

// ------------------------------------------------------------------------------------------ M1-U18

test('M1-U18 no candidate level name appears in schemas/', () => {
  const problems = [];
  for (const file of SCHEMA_FILES) {
    const hits = candidatesIn(JSON.stringify(SCHEMAS[file]));
    if (hits.length) problems.push(`schemas/${file}: ${hits.join('; ')}`);
  }
  assert.equal(CANDIDATE_LEVEL_NAMES.length, 3);
  assert.none(problems, 'candidate level names in schemas/');
});

async function shippedCodeFiles() {
  // Under Node the real listing is used, so a file missing from tests/lib/files.mjs is still read.
  if (IS_NODE) {
    const assets = (await listFiles(repoUrl('assets/'))).map((f) => `assets/${f}`);
    return ['index.html', ...assets];
  }
  return [...SHIPPED_FILES];
}

test('M1-U18 in index.html and assets/, level names and the placeholder appear only in vocabulary.js', async () => {
  const content = await loadContent();
  const unverified = content.readiness.maturity.status !== 'verified';
  const problems = [];
  for (const file of await shippedCodeFiles()) {
    const text = await readText(repoUrl(file));
    const isVocabulary = file === 'assets/js/contracts/vocabulary.js';
    const hits = candidatesIn(text);
    if (hits.length && (!isVocabulary || unverified)) {
      problems.push(`${file}: ${hits.join('; ')}${isVocabulary ? ' (readiness content is unverified)' : ''}`);
    }
    if (file.startsWith('assets/') && !isVocabulary && text.includes('LEVEL_NAME_UNVERIFIED')) {
      problems.push(`${file}: contains the literal LEVEL_NAME_UNVERIFIED`);
    }
  }
  assert.none(problems, 'level names outside their one home');
});

test('M1-U18 while the readiness content is unverified, MATURITY_LEVEL_NAMES is an empty frozen array', async () => {
  const content = await loadContent();
  const vocabulary = await importUnderTest(VOCABULARY);
  assert.equal(vocabulary.LEVEL_NAME_PLACEHOLDER, 'LEVEL_NAME_UNVERIFIED');
  assert.ok(Array.isArray(vocabulary.MATURITY_LEVEL_NAMES), 'MATURITY_LEVEL_NAMES is an array');
  if (content.readiness.maturity.status !== 'verified') {
    assert.equal(vocabulary.MATURITY_LEVEL_NAMES.length, 0, `content source "${content.from}" is unverified`);
    assert.ok(Object.isFrozen(vocabulary.MATURITY_LEVEL_NAMES), 'MATURITY_LEVEL_NAMES is frozen');
  }
});

test('M1-U18 while the readiness content is unverified, no candidate level name appears in data/', { needs: ['data'] }, async () => {
  const content = await loadContent({ from: 'data' });
  if (content.readiness.maturity.status === 'verified') return;
  const problems = [];
  for (const [dataPath, value] of content.modules) {
    const hits = candidatesIn(JSON.stringify(value));
    if (hits.length) problems.push(`${dataPath}: ${hits.join('; ')}`);
  }
  assert.none(problems, 'candidate level names in unverified data/');
});

// ------------------------------------------------------------------------------------------ M1-U19

test('M1-U19 checkScenarioRecord accepts the valid pair and rejects each invalid record', async () => {
  const V = await importUnderTest(VALIDATE);
  const { judgement, scenarioRecord: rec } = await loadSession();
  const cases = [];
  for (const field of ['whatWasHeard', 'howItCouldPlayOut']) {
    for (const blank of ['', ' ', '\n\t']) {
      cases.push(mutant(rec, `${field} ${JSON.stringify(blank)}`, (m) => { m[field] = blank; }));
    }
  }
  cases.push(mutant(rec, "recordedAt equal to the Judgement's committedAt", (m) => { m.recordedAt = judgement.committedAt; }));
  cases.push(mutant(rec, "recordedAt earlier than the Judgement's committedAt", (m) => { m.recordedAt = '2026-10-05T09:04:59.000Z'; }));
  cases.push(mutant(rec, "trendId different from the Judgement's", (m) => { m.trendId = 'trend-fixture-beta'; }));
  for (const l of SIX_LABELS.filter((x) => x !== 'yours')) cases.push(mutant(rec, `label "${l}"`, (m) => { m.label = l; }));
  cases.push(mutant(rec, 'producedBy ["scout"]', (m) => { m.provenance.producedBy = ['scout']; }));
  cases.push(mutant(rec, 'producedBy ["viewer", "interrogator"]', (m) => { m.provenance.producedBy = ['viewer', 'interrogator']; }));
  cases.push(mutant(rec, 'a note equal to ""', (m) => { m.questionNotes[0].note = ''; }));
  const problems = [];
  const ok = verdict(() => V.checkScenarioRecord(clone(rec), clone(judgement)));
  if (ok !== 'accepted') problems.push(`valid pair: ${ok}`);
  for (const c of cases) {
    const r = verdict(() => V.checkScenarioRecord(c.value, clone(judgement)));
    if (r !== 'rejected') problems.push(`${c.label}: ${r}`);
  }
  assert.none(problems, 'checkScenarioRecord errors');
});

// ------------------------------------------------------------------------------------------ M1-U20

test('M1-U20 checkReadiness accepts both fixtures and rejects each broken level structure', async () => {
  const V = await importUnderTest(VALIDATE);
  const c = await loadContent({ from: 'fixtures' });
  const unverified = c.readiness;
  const verified = c.readinessVerified;
  const names = { levelNames: FIXTURE_LEVEL_NAMES };
  const problems = [];

  const okU = verdict(() => V.checkReadiness(clone(unverified)));
  if (okU !== 'accepted') problems.push(`readiness-unverified.js: ${okU}`);
  const okV = verdict(() => V.checkReadiness(clone(verified), names));
  if (okV !== 'accepted') problems.push(`readiness-verified.js with fixture names: ${okV}`);

  // In the verified fixture: practices[0] sits at level one between one and two; practices[1] at
  // level two; practices[2] at level three, the last, with noLevelAboveCitation.
  const p = (m, i) => m.maturity.practices[i];
  const cases = [
    [mutant(verified, 'levelName not in the list', (m) => { p(m, 1).levelName = 'Fixture level four'; }), names],
    [mutant(verified, 'nextLevel.levelName not the successor', (m) => { p(m, 1).nextLevel.levelName = 'Fixture level one'; }), names],
    [mutant(verified, 'last level with a described next level', (m) => { p(m, 2).nextLevel = clone(p(verified, 1).nextLevel); }), names],
    [mutant(verified, 'below the last level with noLevelAboveCitation', (m) => {
      p(m, 1).nextLevel = { noLevelAboveCitation: clone(p(verified, 1).nextLevel.citation) };
    }), names],
    [mutant(verified, 'betweenLevels.lowerLevelName different from levelName', (m) => { p(m, 0).betweenLevels.lowerLevelName = 'Fixture level two'; }), names],
    [mutant(verified, 'betweenLevels.upperLevelName not the successor', (m) => { p(m, 0).betweenLevels.upperLevelName = 'Fixture level three'; }), names],
    [mutant(verified, 'verified profile checked with an empty list', () => {}), { levelNames: [] }],
    [mutant(unverified, 'unverified profile with a non-null explanation', (m) => { p(m, 0).explanation = clone(p(verified, 0).explanation); }), names],
    [mutant(verified, 'a profile with two practices', (m) => { m.maturity.practices.pop(); }), names],
  ];
  for (const [c2, options] of cases) {
    const r = verdict(() => V.checkReadiness(c2.value, options));
    if (r !== 'rejected') problems.push(`${c2.label}: ${r}`);
  }
  assert.none(problems, 'checkReadiness errors');
});
