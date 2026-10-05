// M1 Data contracts: the freeze driver, the only freeze path (docs/03-architecture.md, section 4).
//
// Usage, from the repository root, once, at G3 (Node 22.7 or later):
//
//   node pipeline/freeze.mjs [--frozen-on YYYY-MM-DD] [--pipeline-run-on YYYY-MM-DD]
//
// Reads pipeline/output/ and schemas/, calls the freeze core, and writes data/ only if the core
// succeeded. On a refusal it writes nothing, prints every error (each naming the entity) and exits
// non-zero. Without the flags, frozenOn is the current UTC date and pipelineRunOn is the latest
// provenance.producedOn among the input entities; at G3 the Orchestrator passes both flags, so a
// later re-run with the same flags reproduces data/ byte for byte.
//
// On success data/ holds exactly the files the core produced: a module file the new manifest does
// not list is removed, so that the manifest tells the truth (M1-U14). Paths with a segment that
// begins with a dot (data/.gitkeep) are housekeeping and are never touched.

import { readFile, readdir, writeFile, rename, rm, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { freeze, INPUT_FILES } from './freeze-core.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUTPUT_DIR = join(ROOT, 'pipeline', 'output');
const SCHEMA_DIR = join(ROOT, 'schemas');
const DATA_DIR = join(ROOT, 'data');
const DATE = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
const USAGE = 'usage: node pipeline/freeze.mjs [--frozen-on YYYY-MM-DD] [--pipeline-run-on YYYY-MM-DD]';

function parseArgs(argv) {
  const flags = { '--frozen-on': 'frozenOn', '--pipeline-run-on': 'pipelineRunOn' };
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const name = flags[argv[i]];
    if (!name) throw new Error(`unknown argument ${JSON.stringify(argv[i])}`);
    const value = argv[i + 1];
    if (typeof value !== 'string' || !DATE.test(value)) throw new Error(`${argv[i]} needs a date YYYY-MM-DD`);
    out[name] = value;
    i += 1;
  }
  return out;
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    throw new Error(`${path}: ${error.message}`);
  }
}

/** Every file under a directory, as forward-slash paths relative to it; [] if it does not exist. */
async function listFiles(dir, prefix = '') {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const out = [];
  for (const e of entries) {
    if (e.isDirectory()) out.push(...(await listFiles(join(dir, e.name), `${prefix}${e.name}/`)));
    else out.push(`${prefix}${e.name}`);
  }
  return out.sort();
}

/** The latest provenance.producedOn among the input entities. */
function latestProducedOn(inputs) {
  let latest = null;
  for (const value of Object.values(inputs)) {
    for (const entity of Array.isArray(value) ? value : [value]) {
      const d = entity && entity.provenance && entity.provenance.producedOn;
      if (typeof d === 'string' && DATE.test(d) && (latest === null || d > latest)) latest = d;
    }
  }
  return latest;
}

/** Writes every file next to its target first, then moves each into place, then removes stale modules. */
async function writeData(files) {
  const staged = [];
  try {
    for (const [repoPath, text] of files) {
      const target = join(ROOT, ...repoPath.split('/'));
      await mkdir(dirname(target), { recursive: true });
      const temp = `${target}.freeze-tmp`;
      await writeFile(temp, text, 'utf8');
      staged.push([temp, target]);
    }
  } catch (error) {
    for (const [temp] of staged) await rm(temp, { force: true });
    throw new Error(`writing data/ failed before any file was replaced: ${error.message}`);
  }
  for (const [temp, target] of staged) await rename(temp, target);

  const removed = [];
  for (const rel of await listFiles(DATA_DIR)) {
    if (rel.split('/').some((segment) => segment.startsWith('.'))) continue;
    if (!files.has(`data/${rel}`)) {
      await rm(join(DATA_DIR, ...rel.split('/')), { force: true });
      removed.push(`data/${rel}`);
    }
  }
  return removed;
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`freeze: ${error.message}\n${USAGE}`);
    return 2;
  }

  const inputs = {};
  for (const file of INPUT_FILES) inputs[file] = await readJson(join(OUTPUT_DIR, file));
  const verification = await readJson(join(OUTPUT_DIR, 'verification.json'));
  const schemas = {};
  for (const file of (await listFiles(SCHEMA_DIR)).filter((f) => f.endsWith('.json') && !f.includes('/'))) {
    schemas[file] = await readJson(join(SCHEMA_DIR, file));
  }

  const frozenOn = args.frozenOn || new Date().toISOString().slice(0, 10);
  const pipelineRunOn = args.pipelineRunOn || latestProducedOn(inputs);
  const result = await freeze({ inputs, verification, schemas, frozenOn, pipelineRunOn });

  if (!result.ok) {
    console.error(`freeze: refused; data/ was not written. ${result.errors.length} error(s):`);
    for (const message of result.errors) console.error(`  ${message}`);
    return 1;
  }

  const removed = await writeData(result.files);
  console.log(`freeze: wrote ${result.files.size} module(s) to data/ (frozen on ${frozenOn}, pipeline run on ${pipelineRunOn}):`);
  for (const path of result.files.keys()) console.log(`  ${path}`);
  for (const path of removed) console.log(`  removed ${path} (not in the new manifest)`);
  return 0;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error(`freeze: ${error && error.message}`);
    process.exitCode = 1;
  },
);
