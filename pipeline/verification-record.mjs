// Orchestrator tooling, not shipped: builds pipeline/output/verification.json (F-3) from the
// Verifier's verdict files. The Verifier has no shell, so it records verdicts by entity id and
// this script adds each entity's canonical-JSON SHA-256 (tests/lib/canonical.mjs). It never edits
// an entity. An entity with no verdict, or a verdict other than pass, is written as `struck`.
//
//   node pipeline/verification-record.mjs <verdicts.json> [<verdicts.json> ...]
//
// Each verdicts file holds { entities: [{ type, id, verdict, note }] }; a later file overrides an
// earlier one for the same id.
import { readFile, writeFile } from 'node:fs/promises';
import { entityHash } from '../tests/lib/canonical.mjs';

const OUT = new URL('./output/', import.meta.url);
const TYPES = {
  'signals.json': 'signal', 'trends.json': 'trend', 'readings.json': 'reading',
  'interrogations.json': 'interrogation', 'conversations.json': 'conversation', 'log.json': 'log-entry',
  'brief.json': 'brief', 'readiness.json': 'readiness', 'governance.json': 'governance',
};
const verdicts = new Map();
for (const file of process.argv.slice(2)) {
  for (const v of JSON.parse(await readFile(file, 'utf8')).entities ?? []) verdicts.set(v.id, v);
}
const entities = [];
for (const [file, type] of Object.entries(TYPES)) {
  const value = JSON.parse(await readFile(new URL(file, OUT), 'utf8'));
  for (const entity of Array.isArray(value) ? value : [value]) {
    const v = verdicts.get(entity.id);
    entities.push({
      type, id: entity.id, hash: await entityHash(entity),
      verdict: v && v.verdict === 'pass' ? 'pass' : 'struck',
      note: v ? v.note || '' : 'No verdict recorded by the Verifier.',
    });
  }
}
await writeFile(new URL('verification.json', OUT), JSON.stringify({ entities }, null, 2) + '\n');
const struck = entities.filter((e) => e.verdict !== 'pass');
console.log(`${entities.length} entities, ${struck.length} not pass${struck.length ? ': ' + struck.map((e) => e.id).join(', ') : ''}`);
