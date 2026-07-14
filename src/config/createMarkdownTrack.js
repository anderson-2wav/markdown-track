// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} [email]
 * @property {string} [name]
 *
 * @typedef {Object} DocMeta
 * @property {string} id
 * @property {string} filename
 * @property {string} [title]
 * @property {string[]} [access]  Opaque access tokens from the `<!-- Access: … -->`
 *   marker (host-populated). Absent = unrestricted. Host's `can('view')` decides matches.
 *
 * @typedef {Object} AcceptedState
 * @property {string} id
 * @property {string} docId
 * @property {string} content
 * @property {User} acceptedBy
 * @property {string} acceptedAt   ISO timestamp
 * @property {string} ref          git commit (or opaque host ref)
 *
 * @typedef {Object} PendingChange
 * @property {string} id
 * @property {string} docId
 * @property {string} content
 * @property {User} author
 * @property {string} savedAt      ISO timestamp
 * @property {number} seq
 * @property {string} [baseRef]
 *
 * @typedef {Object} MarkdownTrackHooks
 * @property {() => User} getCurrentUser
 * @property {(action: 'view'|'edit'|'accept'|'set-access', doc: DocMeta) => boolean} can
 * @property {() => Promise<DocMeta[]>} listDocuments
 * @property {(docId: string) => Promise<AcceptedState>} readAcceptedState
 * @property {(docId: string) => Promise<AcceptedState[]>} listAcceptedStates
 * @property {(docId: string) => Promise<PendingChange[]>} listPendingChanges
 * @property {(docId: string, change: { content: string }) => Promise<PendingChange>} savePendingChange
 * @property {(docId: string, opts?: { upToChangeId?: string }) => Promise<AcceptedState>} acceptChanges
 * @property {(event: import("../lib/events.js").TrackEvent) => void} [onEvent]
 *   Optional. Fire-and-forget lifecycle notifications (enter/leave library,
 *   select/save/leave document). See src/lib/events.js for the actions and payload.
 */

export const REQUIRED_HOOKS = Object.freeze([
  "getCurrentUser",
  "can",
  "listDocuments",
  "readAcceptedState",
  "listAcceptedStates",
  "listPendingChanges",
  "savePendingChange",
  "acceptChanges",
]);

// Hooks the host MAY supply. Validated as functions when present, but absence is
// fine — the library degrades to a no-op (see emitTrackEvent).
export const OPTIONAL_HOOKS = Object.freeze(["onEvent"]);

/**
 * Validate and normalize a markdown-track configuration.
 *
 * The host application supplies all I/O as hooks (§3.2 of the implementation
 * plan): identity, access control, document discovery, and the read/save/accept
 * versioning operations. This keeps the library free of git, Mongo, and
 * app-specific concerns.
 *
 * Options (`config.options`):
 *   - `editor`: `'v-md-editor'` (default — markdown source + live preview, no
 *     round-trip, so it never rewrites non-standard markdown) or `'tiptap'`
 *     (WYSIWYG; hides markdown syntax but is lossy on non-standard/nested markdown).
 *   - `library`: optional host-supplied identifier for this library instance,
 *     surfaced on every `onEvent` payload (handy when one host runs several).
 *   - `hideHistoryBefore`: optional cutoff (Date | ISO string | epoch ms). Hides
 *     all timeline history dated before it, so the timeline starts at the version
 *     you want to show. Inclusive; applies to every document; data is untouched.
 *
 * @param {MarkdownTrackHooks & { options?: { editor?: 'tiptap'|'v-md-editor', library?: string, hideHistoryBefore?: Date|string|number } }} config
 * @returns {{ hooks: MarkdownTrackHooks, options: object }}
 */
export function createMarkdownTrack(config = {}) {
  const missing = REQUIRED_HOOKS.filter(
    (name) => typeof config[name] !== "function"
  );
  if (missing.length > 0) {
    throw new Error(
      `createMarkdownTrack: missing required hook(s): ${missing.join(", ")}`
    );
  }

  const badOptional = OPTIONAL_HOOKS.filter(
    (name) => config[name] != null && typeof config[name] !== "function"
  );
  if (badOptional.length > 0) {
    throw new Error(
      `createMarkdownTrack: optional hook(s) must be functions: ${badOptional.join(", ")}`
    );
  }

  const hooks = {};
  for (const name of REQUIRED_HOOKS) hooks[name] = config[name];
  for (const name of OPTIONAL_HOOKS) {
    if (typeof config[name] === "function") hooks[name] = config[name];
  }

  return Object.freeze({
    hooks: Object.freeze(hooks),
    options: Object.freeze({ ...(config.options || {}) }),
  });
}
