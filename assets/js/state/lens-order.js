// M6 Judgement and scenario capture: the random order of the three readings (Q-2, C-4;
// docs/03-architecture.md, section 7.3; docs/04-module-design.md, M6 interface).
//
// The order of the three rival readings carries no meaning (invariant 1). It is drawn once per
// trend per page load from the session's random source, and that one order is used for the
// gut-reading options, the readings and the judgement options. It depends on the random source
// alone: never on the order of the readings in the data files, the trend, or any content.
//
// Pure functions; no DOM, no storage. Imports only contracts/.

import { LENSES } from '../contracts/vocabulary.js';

const LENS_COUNT = 3;

/** One value from the random source, refused unless it is a number in [0, 1). */
function draw(random) {
  const value = random();
  if (typeof value !== 'number' || !(value >= 0 && value < 1)) {
    throw new RangeError(`drawLensOrder: the random source returned ${String(value)}, outside [0, 1)`);
  }
  return value;
}

/**
 * One of the six orders of the three lenses, each equally likely with a uniform source.
 * Starts from the canonical lens list (noise, opportunity, threat: alphabetical, meaningless) and
 * applies a Fisher-Yates shuffle from the last position down: for i = 2, then 1,
 * j = floor(random() * (i + 1)), and positions i and j swap. Calls `random` exactly twice; throws a
 * RangeError if a value falls outside [0, 1). Returns a frozen array.
 */
export function drawLensOrder(random) {
  if (typeof random !== 'function') throw new TypeError('drawLensOrder: the random source is not a function');
  const order = LENSES.slice();
  for (let i = order.length - 1; i >= 1; i -= 1) {
    const j = Math.floor(draw(random) * (i + 1));
    const held = order[i];
    order[i] = order[j];
    order[j] = held;
  }
  return Object.freeze(order);
}

/** True when `lenses` holds each of the three lenses exactly once. */
function isLensPermutation(lenses) {
  return (
    Array.isArray(lenses) &&
    lenses.length === LENS_COUNT &&
    LENSES.every((lens) => lenses.filter((l) => l === lens).length === 1)
  );
}

/**
 * The three readings in `lensOrder`, as a new frozen array. `readings` may come in any order; it
 * must hold exactly one reading per lens, and `lensOrder` must be an order of the three lenses
 * (as drawLensOrder returns). Throws otherwise, for example for two readings.
 */
export function orderReadings(readings, lensOrder) {
  if (!Array.isArray(readings) || readings.length !== LENS_COUNT) {
    throw new TypeError(`orderReadings: expected exactly three readings, found ${Array.isArray(readings) ? readings.length : typeof readings}`);
  }
  const lenses = readings.map((r) => (r !== null && typeof r === 'object' ? r.lens : undefined));
  if (!isLensPermutation(lenses)) throw new TypeError('orderReadings: the readings do not hold exactly one reading per lens');
  if (!isLensPermutation(Array.from(lensOrder || []))) throw new TypeError('orderReadings: the lens order is not an order of the three lenses');
  return Object.freeze(Array.from(lensOrder).map((lens) => readings.find((r) => r.lens === lens)));
}
