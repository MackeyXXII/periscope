// Test tooling for Periscope. Never imported by the page.
//
// The comment-stripping scanner of the static audits M10-U1, M10-U2 and M10-U4
// (docs/04-module-design.md, M10, "How the static audits treat comments"). A comment executes
// nothing, so it can neither make a network call nor hide one; before matching, each file is
// reduced to its code:
//
//   - JavaScript: `//` line comments and `/* */` block comments are removed, skipping over '…',
//     "…" and `…` literals, so that "https://…" inside a string is not mistaken for a comment.
//   - CSS: `/* */` comments are removed, skipping over '…' and "…" literals.
//   - HTML: `<!-- -->` comments are removed.
//
// Everything else is kept, string literals included, because an import specifier, a src or a
// url() is a string. A comment that is not terminated is kept as code to the end of the file, so a
// stray `/*` or `<!--` cannot blind an audit.
//
// Limits, stated so nobody relies on more: the scanner does not parse regular-expression literals
// or nested `${…}` template expressions; a regex literal containing a quote or `//`, or a template
// literal whose `${…}` contains a backtick, may be mis-scanned. Page code that needs either can
// write the pattern with new RegExp('…') instead.
//
// Shared in tests/lib/ (not inside the M10 test) because AUDIT-6 in tests/system/ applies the same
// rule to the same files. M1-U18's level-name search deliberately does NOT use it: names must not
// appear anywhere in shipped files, comments included.

/** 'js' | 'css' | 'html', or null for a file kind the scanner does not know (audited unchanged). */
export function kindOf(path) {
  if (/\.(m?js)$/i.test(path)) return 'js';
  if (/\.css$/i.test(path)) return 'css';
  if (/\.html?$/i.test(path)) return 'html';
  return null;
}

/** The code of a file: its text with the comments of its kind removed. */
export function codeOf(path, text) {
  const kind = kindOf(path);
  if (kind === 'js') return stripScriptComments(text, { lineComments: true, quotes: ['"', "'", '`'] });
  if (kind === 'css') return stripScriptComments(text, { lineComments: false, quotes: ['"', "'"] });
  if (kind === 'html') return stripHtmlComments(text);
  return text;
}

export function stripJsComments(text) {
  return codeOf('x.js', text);
}

export function stripCssComments(text) {
  return codeOf('x.css', text);
}

function stripScriptComments(src, { lineComments, quotes }) {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (quotes.includes(c)) {
      let j = i + 1;
      while (j < n && src[j] !== c) {
        if (src[j] === '\\') j += 2;
        else if (c !== '`' && src[j] === '\n') break; // an unterminated '…' or "…" ends at the line
        else j += 1;
      }
      j = Math.min(j + 1, n);
      out += src.slice(i, j);
      i = j;
      continue;
    }
    if (lineComments && c === '/' && d === '/') {
      const end = src.indexOf('\n', i);
      i = end < 0 ? n : end; // the newline itself is kept
      continue;
    }
    if (c === '/' && d === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end < 0) {
        out += src.slice(i); // unterminated: kept as code to the end of the file
        break;
      }
      out += ' ';
      i = end + 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

export function stripHtmlComments(src) {
  let out = '';
  let i = 0;
  for (;;) {
    const start = src.indexOf('<!--', i);
    if (start < 0) {
      out += src.slice(i);
      break;
    }
    const end = src.indexOf('-->', start + 4);
    if (end < 0) {
      out += src.slice(i); // unterminated: kept as code
      break;
    }
    out += `${src.slice(i, start)} `;
    i = end + 3;
  }
  return out;
}
