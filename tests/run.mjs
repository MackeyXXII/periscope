// Test tooling for Periscope. Never imported by the page.
//
// The dependency-free browser runner behind tests/run.html. It imports every test file listed in
// tests/unit/index.mjs, runs the registered tests in sequence through the harness, and prints one
// row per test (identifier, result, name, reason) and a summary line. A file that fails to load is
// shown as a failed row of its own, naming the file and the error.

import { importAll } from './unit/index.mjs';
import { runRegistered } from './lib/harness.mjs';

const notice = document.getElementById('static-notice');
const tbody = document.getElementById('results');
const summary = document.getElementById('summary');
const scratch = document.getElementById('scratch');
const filter = new URLSearchParams(location.search).get('filter') || '';

notice.textContent = 'Running…';
const counts = { pass: 0, fail: 0, skip: 0 };

function row({ id, status, name, reason }) {
  const tr = document.createElement('tr');
  tr.className = status;
  for (const [cls, text] of [['id', id], ['result', status], ['name', name], ['reason', reason || '']]) {
    const td = document.createElement('td');
    td.className = cls;
    td.textContent = text;
    tr.appendChild(td);
  }
  tbody.appendChild(tr);
  counts[status] += 1;
  summary.textContent = `${counts.pass} passed, ${counts.fail} failed, ${counts.skip} skipped`;
}

await importAll((file, error) => {
  row({ id: file, status: 'fail', name: `test file did not load: ${file}`, reason: String(error && error.message) });
});
await runRegistered({ filter, scratchHost: scratch, onResult: row });

notice.remove();
summary.textContent = `${counts.pass} passed, ${counts.fail} failed, ${counts.skip} skipped` +
  (filter ? ` (filter: ${filter})` : '') + '. Skips are not passes: each names its reason.';
