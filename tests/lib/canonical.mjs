// Test tooling for Periscope. Never imported by the page.
//
// Canonical JSON and its SHA-256, as the freeze step and the Verifier's record define them
// (docs/03-architecture.md, section 4, and F-3): keys sorted recursively, no whitespace, UTF-8.
// Uses the Web Crypto API, which Node 22 and every current browser provide as globalThis.crypto
// (in the browser only in a secure context: https or localhost).

export function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = sortKeysDeep(value[key]);
    return out;
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(sortKeysDeep(value));
}

export async function sha256Hex(text) {
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error('Web Crypto (crypto.subtle) is not available: use Node 22+ or a page served over https or localhost');
  }
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function entityHash(entity) {
  return sha256Hex(canonicalJson(entity));
}
