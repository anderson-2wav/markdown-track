// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later

// History visibility helpers.
//
// A host can hide everything before a cutoff date (options.hideHistoryBefore) so
// a document's timeline starts at the version it wants to show — earlier accepted
// states and pending changes are dropped from the view. The data is untouched;
// only what the timeline renders is filtered.

/**
 * Normalize a cutoff value into a millisecond epoch, or null when there is no
 * (usable) cutoff. Accepts a `Date`, an ISO-8601 string, or an epoch number.
 * An unparseable value yields null (fail open — show everything).
 *
 * @param {Date|string|number|null|undefined} value
 * @returns {number|null}
 */
export function resolveCutoff(value) {
  if (value == null) return null;
  const ms = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Build a predicate that accepts items whose timestamp is at or after the cutoff.
 * With no usable cutoff the predicate accepts everything.
 *
 * Items dated at exactly the cutoff are kept (the cutoff is inclusive), so a host
 * can pass the timestamp of the first version it wants shown.
 *
 * @param {Date|string|number|null|undefined} cutoffValue
 * @returns {(timestamp: string|number|Date) => boolean}
 */
export function makeCutoffFilter(cutoffValue) {
  const cutoff = resolveCutoff(cutoffValue);
  if (cutoff == null) return () => true;
  return (timestamp) => {
    const ms = timestamp instanceof Date ? timestamp.getTime() : new Date(timestamp).getTime();
    // Keep items with no/invalid timestamp rather than silently dropping them.
    if (Number.isNaN(ms)) return true;
    return ms >= cutoff;
  };
}
