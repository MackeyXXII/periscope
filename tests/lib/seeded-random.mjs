// Test tooling for Periscope. Never imported by the page.
//
// seededRandom(seed): a deterministic source of numbers in [0, 1), Mulberry32 (32-bit), for tests
// that need randomness (Q-2: docs/03-architecture.md, section 7.3). Tests never use Math.random or
// Date.now; the seed a test uses is written in the test.

export function seededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A deterministic Fisher–Yates permutation of a copy of `items`, driven by `random`. */
export function permute(items, random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Every permutation of a short array (up to 6 elements), in a fixed order. */
export function permutations(items) {
  if (items.length > 6) throw new Error('permutations: at most 6 items');
  if (items.length <= 1) return [items.slice()];
  const out = [];
  items.forEach((item, i) => {
    const rest = items.slice(0, i).concat(items.slice(i + 1));
    for (const p of permutations(rest)) out.push([item, ...p]);
  });
  return out;
}
