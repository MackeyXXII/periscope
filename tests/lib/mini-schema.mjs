// Test tooling for Periscope. Never imported by the page.
//
// mini-schema: a dependency-free interpreter for the subset of JSON Schema (draft 2020-12) that the
// contracts in schemas/ use (docs/03-architecture.md, section 6.2). It is used by the M1 tests and
// by the freeze core (pipeline/freeze-core.mjs), in Node and in the browser alike. It never ships
// to the page.
//
// It throws a SchemaKeywordError, when the validator is created, on any keyword outside KEYWORDS,
// at any depth, so that a schema can never quietly rely on a rule nothing enforces (M1-U7).
//
// API
//   createValidator(schemas)      schemas: an array of schema objects, or an object whose values
//                                 are schema objects (for example SCHEMAS from tests/lib/schemas.mjs).
//                                 Every schema should carry a $id; one without gets a private base.
//                                 Throws SchemaKeywordError on an unsupported keyword and Error on a
//                                 $ref that cannot be resolved. Returns { validate, ids }.
//   validator.validate(which, value)
//                                 which: a $id, a file name such as 'trend.schema.json', or a schema
//                                 object already registered. Returns { ok: true } or
//                                 { ok: false, errors: [{ path, keyword, message }] }; never throws
//                                 for an invalid value.
//   validate(schema, value, others = [])
//                                 One-shot convenience: registers `schema` (and `others`) and validates.
//   KEYWORDS                      The supported keywords (M1-U7 compares schemas/ against it).
//   collectKeywords(schema)       Every keyword used anywhere in a schema, as [{ keyword, at }].
//   walkSchema(schema, at, visit) Calls visit(subschema, location) for every subschema.
//   same(a, b), typeOf(value)     JSON equality and JSON type, as the interpreter uses them.
//
// Semantics, deliberately narrow:
//   - `items` is the 2020-12 single-schema form only; the tuple (array) form is rejected as a
//     keyword error.
//   - `contains` counts matching elements; `minContains` defaults to 1, `maxContains` to unbounded.
//   - `pattern` uses ECMAScript regular expressions with the `u` flag; `minLength` and `maxLength`
//     count code points, as JSON Schema requires.
//   - `$ref` may have sibling keywords (2020-12); both apply. Relative references resolve against
//     the enclosing document's $id; fragments are JSON pointers.
//   - `additionalProperties` sees only the `properties` of the same schema object, as in the
//     standard; `patternProperties` is not supported.
//   - Annotations ($schema, $id, title, description) are accepted and ignored.

export const KEYWORDS = Object.freeze([
  // annotations and structure
  '$schema', '$id', 'title', 'description', '$defs', '$ref',
  // any type
  'type', 'enum', 'const',
  // objects
  'properties', 'required', 'additionalProperties',
  // arrays
  'items', 'minItems', 'maxItems', 'uniqueItems', 'contains', 'minContains', 'maxContains',
  // strings
  'pattern', 'minLength', 'maxLength',
  // combinators
  'allOf', 'oneOf', 'not', 'if', 'then', 'else',
]);

const KEYWORD_SET = new Set(KEYWORDS);
const TYPES = new Set(['null', 'boolean', 'object', 'array', 'number', 'integer', 'string']);
const SCHEMA_VALUED = new Set(['items', 'contains', 'not', 'if', 'then', 'else', 'additionalProperties']);
const SCHEMA_MAP_VALUED = new Set(['properties', '$defs']);
const SCHEMA_ARRAY_VALUED = new Set(['allOf', 'oneOf']);

export class SchemaKeywordError extends Error {
  constructor(keyword, where) {
    super(`mini-schema does not support the keyword "${keyword}" (at ${where})`);
    this.name = 'SchemaKeywordError';
    this.keyword = keyword;
    this.where = where;
  }
}

/** Every keyword used anywhere in a schema, with its location. Exposed for tests. */
export function collectKeywords(schema, where = '#') {
  const found = [];
  walk(schema, where, (sub, at) => {
    for (const k of Object.keys(sub)) found.push({ keyword: k, at });
  });
  return found;
}

/** Calls visit(subschema, location) for the schema and every subschema in it. */
export function walkSchema(schema, where, visit) {
  walk(schema, where, visit);
}

function walk(schema, where, visit) {
  if (typeof schema === 'boolean') return;
  if (schema === null || typeof schema !== 'object' || Array.isArray(schema)) {
    throw new Error(`not a schema at ${where}`);
  }
  visit(schema, where);
  for (const [k, v] of Object.entries(schema)) {
    if (SCHEMA_VALUED.has(k)) {
      if (k === 'items' && Array.isArray(v)) continue; // reported by checkKeywords
      walk(v, `${where}/${k}`, visit);
    } else if (SCHEMA_MAP_VALUED.has(k)) {
      for (const [name, sub] of Object.entries(v)) walk(sub, `${where}/${k}/${name}`, visit);
    } else if (SCHEMA_ARRAY_VALUED.has(k)) {
      v.forEach((sub, i) => walk(sub, `${where}/${k}/${i}`, visit));
    }
  }
}

function checkKeywords(schema, where) {
  walk(schema, where, (sub, at) => {
    for (const k of Object.keys(sub)) {
      if (!KEYWORD_SET.has(k)) throw new SchemaKeywordError(k, at);
    }
    if (Array.isArray(sub.items)) throw new SchemaKeywordError('items (array form)', at);
    if ('type' in sub) {
      const types = Array.isArray(sub.type) ? sub.type : [sub.type];
      for (const t of types) if (!TYPES.has(t)) throw new SchemaKeywordError(`type "${t}"`, at);
    }
  });
}

let anonymous = 0;

export function createValidator(schemas) {
  const list = Array.isArray(schemas) ? schemas : Object.values(schemas);
  const docs = new Map(); // $id (no fragment) -> schema
  const idOf = new Map(); // schema object -> $id
  for (const schema of list) {
    const id = typeof schema.$id === 'string' ? stripFragment(schema.$id) : `urn:mini-schema:anonymous-${++anonymous}`;
    checkKeywords(schema, id);
    docs.set(id, schema);
    idOf.set(schema, id);
  }
  // Resolve every $ref once, up front, so that a dangling reference fails at creation.
  for (const [id, schema] of docs) {
    walk(schema, id, (sub) => {
      if (typeof sub.$ref === 'string') resolve(sub.$ref, id);
    });
  }

  function resolve(ref, base) {
    const url = new URL(ref, base.startsWith('urn:') ? 'https://mini-schema.invalid/' : base);
    const hashAt = url.href.indexOf('#');
    let docId = hashAt >= 0 ? url.href.slice(0, hashAt) : url.href;
    const fragment = hashAt >= 0 ? decodeURIComponent(url.href.slice(hashAt + 1)) : '';
    if (ref.startsWith('#')) docId = base;
    const doc = docs.get(docId);
    if (!doc) throw new Error(`mini-schema cannot resolve $ref "${ref}" from ${base}`);
    let node = doc;
    if (fragment) {
      if (!fragment.startsWith('/')) throw new Error(`mini-schema supports only JSON-pointer fragments: "${ref}"`);
      for (const raw of fragment.slice(1).split('/')) {
        const part = raw.replace(/~1/g, '/').replace(/~0/g, '~');
        if (node === null || typeof node !== 'object' || !(part in node)) {
          throw new Error(`mini-schema cannot resolve $ref "${ref}" from ${base}`);
        }
        node = node[part];
      }
    }
    return { schema: node, base: docId };
  }

  function find(which) {
    if (typeof which === 'object' && which !== null) {
      const id = idOf.get(which);
      if (!id) throw new Error('mini-schema: schema object not registered');
      return { schema: which, base: id };
    }
    if (docs.has(which)) return { schema: docs.get(which), base: which };
    for (const [id, schema] of docs) {
      if (id.endsWith(`/${which}`)) return { schema, base: id };
    }
    throw new Error(`mini-schema: no registered schema matches "${which}"`);
  }

  function validate(which, value) {
    const { schema, base } = find(which);
    const errors = [];
    check(schema, value, base, '', errors);
    return errors.length === 0 ? { ok: true } : { ok: false, errors };
  }

  function passes(schema, value, base) {
    const errors = [];
    check(schema, value, base, '', errors);
    return errors.length === 0;
  }

  function check(schema, value, base, path, errors) {
    if (schema === true) return;
    if (schema === false) {
      errors.push(err(path, 'false', 'no value is allowed here'));
      return;
    }
    const t = typeOf(value);

    if (typeof schema.$ref === 'string') {
      const target = resolve(schema.$ref, base);
      check(target.schema, value, target.base, path, errors);
    }

    if ('type' in schema) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];
      const ok = types.some((want) => want === t || (want === 'integer' && t === 'number' && Number.isInteger(value)));
      if (!ok) errors.push(err(path, 'type', `expected ${types.join(' or ')}, got ${t}`));
    }
    if ('enum' in schema && !schema.enum.some((e) => same(e, value))) {
      errors.push(err(path, 'enum', `${show(value)} is not one of ${show(schema.enum)}`));
    }
    if ('const' in schema && !same(schema.const, value)) {
      errors.push(err(path, 'const', `expected ${show(schema.const)}, got ${show(value)}`));
    }

    if (t === 'string') {
      const length = Array.from(value).length;
      if ('minLength' in schema && length < schema.minLength) {
        errors.push(err(path, 'minLength', `shorter than ${schema.minLength}`));
      }
      if ('maxLength' in schema && length > schema.maxLength) {
        errors.push(err(path, 'maxLength', `longer than ${schema.maxLength}`));
      }
      if ('pattern' in schema && !regex(schema.pattern).test(value)) {
        errors.push(err(path, 'pattern', `${show(value)} does not match ${schema.pattern}`));
      }
    }

    if (t === 'object') {
      const props = schema.properties || {};
      for (const key of schema.required || []) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
          errors.push(err(`${path}/${key}`, 'required', 'required property is missing'));
        }
      }
      for (const [key, sub] of Object.entries(props)) {
        if (Object.prototype.hasOwnProperty.call(value, key)) check(sub, value[key], base, `${path}/${key}`, errors);
      }
      if ('additionalProperties' in schema) {
        for (const key of Object.keys(value)) {
          if (Object.prototype.hasOwnProperty.call(props, key)) continue;
          if (schema.additionalProperties === false) {
            errors.push(err(`${path}/${key}`, 'additionalProperties', 'property is not allowed'));
          } else {
            check(schema.additionalProperties, value[key], base, `${path}/${key}`, errors);
          }
        }
      }
    }

    if (t === 'array') {
      if ('minItems' in schema && value.length < schema.minItems) {
        errors.push(err(path, 'minItems', `fewer than ${schema.minItems} items`));
      }
      if ('maxItems' in schema && value.length > schema.maxItems) {
        errors.push(err(path, 'maxItems', `more than ${schema.maxItems} items`));
      }
      if (schema.uniqueItems === true) {
        for (let i = 0; i < value.length; i += 1) {
          for (let j = i + 1; j < value.length; j += 1) {
            if (same(value[i], value[j])) errors.push(err(path, 'uniqueItems', `items ${i} and ${j} are equal`));
          }
        }
      }
      if ('items' in schema) {
        value.forEach((item, i) => check(schema.items, item, base, `${path}/${i}`, errors));
      }
      if ('contains' in schema) {
        const count = value.filter((item) => passes(schema.contains, item, base)).length;
        const min = 'minContains' in schema ? schema.minContains : 1;
        if (count < min) errors.push(err(path, 'minContains', `${count} matching items, at least ${min} required`));
        if ('maxContains' in schema && count > schema.maxContains) {
          errors.push(err(path, 'maxContains', `${count} matching items, at most ${schema.maxContains} allowed`));
        }
      }
    }

    if (Array.isArray(schema.allOf)) {
      for (const sub of schema.allOf) check(sub, value, base, path, errors);
    }
    if (Array.isArray(schema.oneOf)) {
      const matching = schema.oneOf.filter((sub) => passes(sub, value, base)).length;
      if (matching !== 1) errors.push(err(path, 'oneOf', `${matching} alternatives match, exactly one required`));
    }
    if ('not' in schema && passes(schema.not, value, base)) {
      errors.push(err(path, 'not', 'value matches a schema it must not match'));
    }
    if ('if' in schema) {
      if (passes(schema.if, value, base)) {
        if ('then' in schema) check(schema.then, value, base, path, errors);
      } else if ('else' in schema) {
        check(schema.else, value, base, path, errors);
      }
    }
  }

  return { validate, ids: Array.from(docs.keys()) };
}

export function validate(schema, value, others = []) {
  return createValidator([schema, ...others]).validate(schema, value);
}

// ---------------------------------------------------------------- helpers

function stripFragment(id) {
  const i = id.indexOf('#');
  return i >= 0 ? id.slice(0, i) : id;
}

const regexCache = new Map();
function regex(source) {
  if (!regexCache.has(source)) regexCache.set(source, new RegExp(source, 'u'));
  return regexCache.get(source);
}

export function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  const t = typeof value;
  if (t === 'number') return Number.isFinite(value) ? 'number' : 'non-finite number';
  if (t === 'string' || t === 'boolean' || t === 'object') return t;
  return t; // 'undefined', 'function', … never valid JSON
}

/** JSON equality: same type and same value, object key order ignored. */
export function same(a, b) {
  const ta = typeOf(a);
  if (ta !== typeOf(b)) return false;
  if (ta === 'array') return a.length === b.length && a.every((v, i) => same(v, b[i]));
  if (ta === 'object') {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && same(a[k], b[k]));
  }
  return a === b;
}

function err(path, keyword, message) {
  return { path: path || '/', keyword, message };
}

function show(value) {
  const s = JSON.stringify(value);
  return s && s.length > 80 ? `${s.slice(0, 80)}…` : String(s);
}
