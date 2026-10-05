// Test tooling for Periscope. Never imported by the page.
//
// The file inventory (docs/04-module-design.md, M10-U9): every file under assets/ and schemas/,
// plus index.html, as repository-relative paths. Static audits that must also run in the browser
// runner iterate over this list, because the browser cannot list a directory. Whoever adds,
// renames or removes a file under assets/ or schemas/ updates this list in the same change;
// M10-U9 (Node) fails until they do. data/ files are listed by the freeze manifest instead.

export const SHIPPED_FILES = Object.freeze([
  'index.html',
  'assets/css/main.css',
  'assets/js/main.js',
]);

export const SCHEMA_FILES = Object.freeze([
  'schemas/brief.schema.json',
  'schemas/common.schema.json',
  'schemas/conversation-questions.schema.json',
  'schemas/freeze-manifest.schema.json',
  'schemas/governance.schema.json',
  'schemas/interrogation.schema.json',
  'schemas/judgement.schema.json',
  'schemas/log-entry.schema.json',
  'schemas/readiness-profile.schema.json',
  'schemas/reading.schema.json',
  'schemas/reveal-bundle.schema.json',
  'schemas/scenario-record.schema.json',
  'schemas/signal.schema.json',
  'schemas/trend.schema.json',
]);

export const FILES = Object.freeze([...SHIPPED_FILES, ...SCHEMA_FILES]);
