// M1 Data contracts: the values Miguel fixed on 4 October 2026 (DM-9) and the F5 build switch.
// Each has one home, here; where a schema repeats one as a bound, M1-U5 keeps the two in step,
// and M1-U15 checks every value. This module imports nothing.

/** The most signals a weekly brief may hold (a maximum, not a target). */
export const BRIEF_SIGNAL_CAP = 5;

/** Reading speed used to estimate the brief's reading time, in words per minute. */
export const READING_WPM = 200;

/** The longest verbatim quote a signal may carry, in words split on whitespace. */
export const QUOTE_MAX_WORDS = 15;

/** The replay window: original signals in the decision log are published on or between these dates. */
export const REPLAY_WINDOW_START = '2026-01-01';
export const REPLAY_WINDOW_END = '2026-03-31';

/** The most questions in one interrogation group (and, when built, one conversation-question set). */
export const QUESTIONS_PER_GROUP_MAX = 3;

/**
 * How F5 ships. 'static' in this release (decision of 5 October 2026): the static screen F5-ST,
 * with the interactive flow designed but not built. A string, not a boolean, so the no-boolean
 * rule needs no exception.
 */
export const SCENARIO_FLOW = 'static';
