// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later

// Lifecycle event notifications for markdown-track.
//
// The library reports user activity through an optional `onEvent` hook (see
// createMarkdownTrack). It is intentionally fire-and-forget: a host can use it
// for audit logging, analytics, or presence, and the library never depends on
// what it returns. The BOLD demo just console.logs the payload.

/**
 * The lifecycle actions the library reports.
 *
 *  - `enter-library`  the document library mounted (user opened the library)
 *  - `select-document` a document view opened for a given docId
 *  - `save-document`   a pending change was saved for a docId
 *  - `leave-document`  the document view unmounted (user left the document)
 *  - `leave-library`   the library unmounted (user left the library)
 */
export const TRACK_EVENTS = Object.freeze({
  ENTER_LIBRARY: "enter-library",
  SELECT_DOCUMENT: "select-document",
  SAVE_DOCUMENT: "save-document",
  LEAVE_DOCUMENT: "leave-document",
  LEAVE_LIBRARY: "leave-library",
});

/**
 * @typedef {Object} TrackEvent
 * @property {string} action      one of TRACK_EVENTS
 * @property {import("../config/createMarkdownTrack.js").User|null} currentUser
 * @property {string|null} library   host-supplied library identifier (options.library)
 * @property {string|null} docId     document id, when the action is doc-scoped
 * @property {string} timestamp   ISO 8601
 */

/**
 * Build a normalized event payload and hand it to the host's `onEvent` hook.
 *
 * Resolves `currentUser` from the config's `getCurrentUser` hook and `library`
 * from `options.library`, so callers only pass what's specific to the moment
 * (the action and, when relevant, the docId). Never throws: a missing hook, a
 * throwing `getCurrentUser`, or a throwing `onEvent` are all swallowed so event
 * reporting can never break the UI.
 *
 * @param {{ hooks?: object, options?: object }} config  from useMarkdownTrack()
 * @param {string} action  one of TRACK_EVENTS
 * @param {{ docId?: string|null }} [detail]
 * @returns {TrackEvent|undefined} the emitted payload (handy for tests), or
 *   undefined if there is no onEvent hook
 */
export function emitTrackEvent(config, action, detail = {}) {
  const onEvent = config?.hooks?.onEvent;
  if (typeof onEvent !== "function") return undefined;

  let currentUser = null;
  try {
    currentUser = config.hooks.getCurrentUser?.() ?? null;
  }
  catch {
    currentUser = null;
  }

  const event = {
    action,
    currentUser,
    library: config?.options?.library ?? null,
    docId: detail.docId ?? null,
    timestamp: new Date().toISOString(),
  };

  try {
    onEvent(event);
  }
  catch {
    // Event reporting is best-effort; never let it break the UI.
  }
  return event;
}