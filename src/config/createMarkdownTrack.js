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
 * @property {(action: 'view'|'edit'|'accept', doc: DocMeta) => boolean} can
 * @property {() => Promise<DocMeta[]>} listDocuments
 * @property {(docId: string) => Promise<AcceptedState>} readAcceptedState
 * @property {(docId: string) => Promise<AcceptedState[]>} listAcceptedStates
 * @property {(docId: string) => Promise<PendingChange[]>} listPendingChanges
 * @property {(docId: string, change: { content: string }) => Promise<PendingChange>} savePendingChange
 * @property {(docId: string, opts?: { upToChangeId?: string }) => Promise<AcceptedState>} acceptChanges
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
 *
 * @param {MarkdownTrackHooks & { options?: { editor?: 'tiptap'|'v-md-editor' } }} config
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

  const hooks = {};
  for (const name of REQUIRED_HOOKS) hooks[name] = config[name];

  return Object.freeze({
    hooks: Object.freeze(hooks),
    options: Object.freeze({ ...(config.options || {}) }),
  });
}
