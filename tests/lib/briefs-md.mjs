// Test tooling for Periscope. Never imported by the page.
//
// A parser for the Markdown conventions of the Cowork briefs (docs/04-module-design.md, M2,
// "Markdown conventions the tests parse"), used by M2-U1 to M2-U5 and M3-U3:
//   - a section headed `## Named entities` with a table of columns Name, Kind, Source URL, Date;
//   - in the scanning brief, a line `Window: YYYY-MM-DD to YYYY-MM-DD`;
//   - in the replay candidates, each candidate a `###` heading followed by `Original: <url> (date)`
//     lines and one `Outcome: <url> (date)` line.
// Added by the Test Engineer on 5 October 2026. Reading the files is the caller's job (readText).

import { readText, repoPath } from './env.mjs';
import { Skip } from './skip.mjs';

export const ENTITY_COLUMNS = Object.freeze(['Name', 'Kind', 'Source URL', 'Date']);
export const ENTITY_KINDS = Object.freeze(['competitor', 'incumbent', 'technology', 'regulation', 'standard', 'publication']);
export const BRIEF_FILES = Object.freeze(['persona-dossier.md', 'scanning-brief.md', 'replay-candidates.md']);

/**
 * Reads a briefs file. In the browser it skips (readText's DM-11 reason); under Node a missing file
 * fails with a message naming it and the open dependency, so it is never mistaken for a defect.
 */
export async function readBrief(url, missingCause) {
  try {
    return await readText(url);
  } catch (error) {
    if (error instanceof Skip) throw error;
    if (error && error.code === 'ENOENT') {
      throw new Error(`${repoPath(url)} does not exist: ${missingCause}`);
    }
    throw error;
  }
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((c) => c.trim());
}

/** The URL written in a table cell or line: bare, in <angle brackets> or as [text](url). */
export function extractUrl(cell) {
  const s = String(cell).trim();
  let m = /^\[[^\]]*\]\((\S+?)\)$/.exec(s);
  if (m) return m[1];
  m = /^<(\S+)>$/.exec(s);
  if (m) return m[1];
  return s;
}

/**
 * Parses the "Named entities" section. Returns { found, table, rows, problems }: `found` is false if
 * there is no `## Named entities` heading; `table` is false if the section has no table whose header
 * holds the four columns. Each row is { Name, Kind, 'Source URL', Date, line }.
 */
export function namedEntities(markdown) {
  const lines = String(markdown).split(/\r?\n/);
  const start = lines.findIndex((l) => /^##\s+Named entities\s*$/i.test(l.trim()));
  if (start < 0) return { found: false, table: false, rows: [], problems: [] };
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^#{1,2}\s/.test(lines[i].trim())) {
      end = i;
      break;
    }
  }
  const section = lines.slice(start + 1, end);
  const headerAt = section.findIndex((l) => l.trim().startsWith('|'));
  if (headerAt < 0) return { found: true, table: false, rows: [], problems: [] };
  const header = splitRow(section[headerAt]);
  const index = {};
  for (const col of ENTITY_COLUMNS) index[col] = header.findIndex((h) => h.toLowerCase() === col.toLowerCase());
  if (ENTITY_COLUMNS.some((c) => index[c] < 0)) {
    return { found: true, table: false, rows: [], problems: [`table header ${JSON.stringify(header)} lacks one of ${ENTITY_COLUMNS.join(', ')}`] };
  }
  const rows = [];
  for (let i = headerAt + 1; i < section.length; i += 1) {
    const line = section[i].trim();
    if (!line.startsWith('|')) break;
    const cells = splitRow(line);
    if (cells.every((c) => /^:?-{3,}:?$/.test(c))) continue; // the delimiter row
    const row = { line: start + 2 + i };
    for (const col of ENTITY_COLUMNS) row[col] = cells[index[col]] === undefined ? '' : cells[index[col]];
    rows.push(row);
  }
  return { found: true, table: true, rows, problems: [] };
}

/** The `Window:` line's two dates, or null if there is no such line. */
export function windowLine(markdown) {
  const m = /^Window:[ \t]*(\S+)[ \t]+to[ \t]+(\S+)[ \t]*$/m.exec(String(markdown).replace(/\r\n/g, '\n'));
  return m ? { start: m[1], end: m[2] } : null;
}

/**
 * The replay candidates: one per `###` heading, as { heading, originals, outcomes, malformed }, where
 * originals and outcomes are [{ url, date, line }] and malformed lists `Original:`/`Outcome:` lines
 * that do not have the form `<label>: <url> (YYYY-MM-DD)`.
 */
export function replayCandidates(markdown) {
  const lines = String(markdown).split(/\r?\n/);
  const out = [];
  let current = null;
  for (const raw of lines) {
    const line = raw.trim();
    const h = /^###\s+(.+)$/.exec(line);
    if (h) {
      current = { heading: h[1].trim(), originals: [], outcomes: [], malformed: [] };
      out.push(current);
      continue;
    }
    if (/^#{1,2}\s/.test(line)) {
      current = null;
      continue;
    }
    if (!current) continue;
    const kind = /^(Original|Outcome):/.exec(line);
    if (!kind) continue;
    const m = /^(Original|Outcome):\s*(\S+)\s+\((\S+)\)\s*$/.exec(line);
    if (!m) {
      current.malformed.push(line);
      continue;
    }
    const item = { url: extractUrl(m[2]), date: m[3], line };
    (m[1] === 'Original' ? current.originals : current.outcomes).push(item);
  }
  return out;
}
