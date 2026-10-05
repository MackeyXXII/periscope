// M8 Decision log and replay: M8-U1, U2, U3, U7 and U8 (the parts that need no DOM).
// The screen tests M8-U4 to U6, U9 and U10 are in m8-log.browser.mjs.
// Written from docs/04-module-design.md (M8) and docs/02-system-requirements.md (F4) before
// assets/js/screens/log.js exists (test-first rule).
//
// Status at G2: the fixture parts of M8-U1, U7 and U8 depend only on fixtures and should pass;
// M8-U2 fails until constants.js exists, M8-U3 until screens/log.js exists; every data/ part is
// skipped with "needs data/ (G3)". The page-code part of M8-U8 reads raw file text, so in the
// browser runner it is skipped with "needs Node or DM-11".

import { test } from '../lib/harness.mjs';
import { assert } from '../lib/assert.mjs';
import { loadContent, clone } from '../lib/content.mjs';
import { readText, repoUrl } from '../lib/env.mjs';
import { SHIPPED_FILES } from '../lib/files.mjs';
import { seededRandom, permute } from '../lib/seeded-random.mjs';
import { load } from '../lib/screens.mjs';

const DATA = { needs: ['data'] };

function signalDates(entry) {
  return entry.originalSignals.map((s) => s.source && s.source.publishedOn);
}

// ------------------------------------------------------------------------------------------ M8-U1

function outcomeProblems(log) {
  const problems = [];
  for (const e of log) {
    const src = e.outcome && e.outcome.source;
    if (!src || typeof src.url !== 'string' || !src.url.startsWith('https://')) problems.push(`${e.id}: outcome source is not an https:// URL`);
    const when = src && src.publishedOn;
    if (typeof when !== 'string') {
      problems.push(`${e.id}: outcome source has no publishedOn`);
      continue;
    }
    for (const d of signalDates(e)) if (!(when > d)) problems.push(`${e.id}: outcome ${when} is not later than original signal ${d}`);
    if (!(when <= e.provenance.frozenOn)) problems.push(`${e.id}: outcome ${when} is after the entry's frozenOn ${e.provenance.frozenOn}`);
  }
  return problems;
}

test('M8-U1 every replay outcome has an https source dated after its signals and not after the freeze (fixtures)', async () => {
  const { log } = await loadContent({ from: 'fixtures' });
  assert.none(outcomeProblems(log), 'outcome source problems');
  // The rule bites: an outcome dated on its signal's day is caught.
  const bad = clone(log);
  bad[0].outcome.source.publishedOn = bad[0].originalSignals[0].source.publishedOn;
  assert.ok(outcomeProblems(bad).length > 0, 'an outcome not later than its signal is reported');
});

test('M8-U1 every replay outcome has an https source dated after its signals and not after the freeze (data/)', DATA, async () => {
  const { log } = await loadContent({ from: 'data' });
  assert.none(outcomeProblems(log), 'outcome source problems in data/log.js');
});

// ------------------------------------------------------------------------------------------ M8-U2

async function windowProblems(log) {
  const c = await load('constants');
  const problems = [];
  for (const e of log) {
    for (const d of signalDates(e)) {
      if (!(typeof d === 'string' && d >= c.REPLAY_WINDOW_START && d <= c.REPLAY_WINDOW_END)) {
        problems.push(`${e.id}: original signal dated ${d}, outside ${c.REPLAY_WINDOW_START} to ${c.REPLAY_WINDOW_END}`);
      }
    }
  }
  return { problems, c };
}

test('M8-U2 every original signal lies within the replay window, both boundary dates included (fixtures)', async () => {
  const { log } = await loadContent({ from: 'fixtures' });
  const { problems, c } = await windowProblems(log);
  assert.none(problems, 'original signals outside the replay window');
  const all = log.flatMap(signalDates);
  assert.includes(all, c.REPLAY_WINDOW_START, 'the fixture has a signal on the first day of the window');
  assert.includes(all, c.REPLAY_WINDOW_END, 'the fixture has a signal on the last day of the window');
});

test('M8-U2 every original signal lies within the replay window (data/)', DATA, async () => {
  const { log } = await loadContent({ from: 'data' });
  const { problems } = await windowProblems(log);
  assert.none(problems, 'original signals outside the replay window in data/log.js');
});

// ------------------------------------------------------------------------------------------ M8-U3

test('M8-U3 orderEntries sorts by earliest signal date, oldest first, ties by id, whatever the input order', async () => {
  const L = await load('log');
  const { log } = await loadContent({ from: 'fixtures' });
  // A tie on the earliest date, so that the id rule is exercised.
  const tie = clone(log[1]);
  tie.id = 'replay-2026-02-14-zebra-log-alpha';
  const entries = [...clone(log), tie];
  const earliest = (e) => signalDates(e).slice().sort()[0];
  const expected = entries
    .slice()
    .sort((a, b) => (earliest(a) < earliest(b) ? -1 : earliest(a) > earliest(b) ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((e) => e.id);
  const problems = [];
  for (let seed = 1; seed <= 10; seed += 1) {
    const input = permute(entries, seededRandom(seed));
    let got;
    try {
      got = Array.from(L.orderEntries(input)).map((e) => e.id);
    } catch (error) {
      problems.push(`seed ${seed}: threw ${error.message}`);
      continue;
    }
    if (JSON.stringify(got) !== JSON.stringify(expected)) problems.push(`seed ${seed}: got ${got.join(', ')}`);
  }
  assert.none(problems, `orderEntries errors (expected ${expected.join(', ')})`);
  for (const e of entries) {
    const m = /^replay-(\d{4}-\d{2}-\d{2})-/.exec(e.id);
    assert.ok(m && m[1] === earliest(e), `${e.id}: the date in the identifier equals its earliest signal's date (${earliest(e)})`);
  }
});

// ------------------------------------------------------------------------------------------ M8-U7

function k7Problems(log) {
  const problems = [];
  for (const e of log) {
    const j = e.pastJudgement;
    const latest = signalDates(e).slice().sort().pop();
    const outcome = e.outcome.source.publishedOn;
    if (!(j.asOfDate >= latest)) problems.push(`${e.id}: asOfDate ${j.asOfDate} is before the latest signal ${latest}`);
    if (!(j.asOfDate < outcome)) problems.push(`${e.id}: asOfDate ${j.asOfDate} is not before the outcome ${outcome}`);
    if (!(j.asOfDate <= j.authoredOn)) problems.push(`${e.id}: asOfDate ${j.asOfDate} is after authoredOn ${j.authoredOn}`);
    if (!(j.authoredOn <= e.outcome.attachedOn)) problems.push(`${e.id}: authoredOn ${j.authoredOn} is after outcome.attachedOn ${e.outcome.attachedOn}`);
    if (!(e.outcome.attachedOn <= e.provenance.frozenOn)) problems.push(`${e.id}: attachedOn ${e.outcome.attachedOn} is after frozenOn ${e.provenance.frozenOn}`);
  }
  return problems;
}

test('M8-U7 K-7 dates: as-of after the signals and before the outcome; written before the outcome was attached (fixtures)', async () => {
  const { log } = await loadContent({ from: 'fixtures' });
  assert.none(k7Problems(log), 'K-7 date problems');
  const bad = clone(log);
  bad[0].pastJudgement.authoredOn = '2026-10-05';
  assert.ok(k7Problems(bad).length > 0, 'a judgement written after its outcome was attached is reported');
});

test('M8-U7 K-7 dates (data/)', DATA, async () => {
  const { log } = await loadContent({ from: 'data' });
  assert.none(k7Problems(log), 'K-7 date problems in data/log.js');
});

// ------------------------------------------------------------------------------------------ M8-U8

test('M8-U8 R7 is designed, not built: no LogEntry in the fixtures has a role', async () => {
  const { log } = await loadContent({ from: 'fixtures' });
  assert.none(log.filter((e) => Object.prototype.hasOwnProperty.call(e, 'role')).map((e) => e.id), 'fixture entries with a role');
});

test('M8-U8 R7 is designed, not built: no LogEntry in data/ has a role', DATA, async () => {
  const { log } = await loadContent({ from: 'data' });
  assert.none(log.filter((e) => Object.prototype.hasOwnProperty.call(e, 'role')).map((e) => e.id), 'data/ entries with a role');
});

test('M8-U8 no page code other than contracts/validate.js reads .role or ["role"]', async () => {
  const files = SHIPPED_FILES.filter((f) => f.startsWith('assets/js/') && f !== 'assets/js/contracts/validate.js');
  const problems = [];
  for (const file of files) {
    const text = await readText(repoUrl(file));
    text.split('\n').forEach((line, i) => {
      if (/\.role\b/.test(line) || /\[\s*(["'`])role\1\s*\]/.test(line)) problems.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }
  assert.none(problems, 'reads of a role property in page code');
});
