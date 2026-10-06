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
  'assets/js/contracts/constants.js',
  'assets/js/contracts/load.js',
  'assets/js/contracts/validate.js',
  'assets/js/contracts/vocabulary.js',
  'assets/js/honesty/labels.js',
  'assets/js/honesty/sources.js',
  'assets/js/honesty/statement.js',
  'assets/js/main.js',
  'assets/js/shell/nav.js',
  'assets/js/shell/router.js',
  'assets/js/shell/routes.js',
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
