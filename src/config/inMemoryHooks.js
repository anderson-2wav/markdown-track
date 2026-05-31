// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
import { extractTitle } from "../lib/title.js";

/**
 * In-memory reference implementation of the markdown-track hooks (§3.2).
 *
 * For development harnesses and tests only: no git, no Mongo — accepted states
 * and pending changes live in memory. Seed it with documents (and optionally a
 * user, an access policy, or a deterministic clock), then pass the result
 * straight to `createMarkdownTrack`.
 *
 * @param {Object} [seed]
 * @param {Array<{id:string, filename:string, content?:string}>} [seed.documents]
 * @param {{id:string,email?:string,name?:string}} [seed.user]
 * @param {(action:string, doc:object, user:object) => boolean} [seed.can]
 * @param {() => string} [seed.clock]  returns an ISO timestamp (for tests)
 */
export function createInMemoryHooks(seed = {}) {
  const user = seed.user || { id: "dev", email: "dev@example.com", name: "Dev User" };
  const canFn = seed.can || (() => true);
  const now = () => (seed.clock ? seed.clock() : new Date().toISOString());

  const docs = new Map(); // docId -> { id, filename }
  const accepted = new Map(); // docId -> AcceptedState[]
  const pending = new Map(); // docId -> PendingChange[]
  let seq = 0;
  let counter = 0;
  const nextId = (prefix) => `${prefix}-${++counter}`;
  const clone = (x) => JSON.parse(JSON.stringify(x));

  for (const d of seed.documents || []) {
    docs.set(d.id, { id: d.id, filename: d.filename });
    accepted.set(d.id, [
      {
        id: nextId("acc"),
        docId: d.id,
        content: d.content ?? "",
        acceptedBy: user,
        acceptedAt: now(),
        ref: "seed",
      },
    ]);
    pending.set(d.id, []);
  }

  const lastAccepted = (docId) => {
    const list = accepted.get(docId) || [];
    return list[list.length - 1];
  };

  return {
    getCurrentUser: () => clone(user),

    can: (action, doc) => canFn(action, doc, user),

    listDocuments: async () =>
      [...docs.values()].map((d) => {
        const content = lastAccepted(d.id)?.content ?? "";
        return clone({ ...d, title: extractTitle(content) ?? undefined });
      }),

    readAcceptedState: async (docId) => {
      const acc = lastAccepted(docId);
      if (!acc) throw new Error(`Unknown document: ${docId}`);
      return clone(acc);
    },

    listAcceptedStates: async (docId) => clone(accepted.get(docId) || []),

    listPendingChanges: async (docId) => clone(pending.get(docId) || []),

    savePendingChange: async (docId, { content }) => {
      if (!docs.has(docId)) throw new Error(`Unknown document: ${docId}`);
      const change = {
        id: nextId("pend"),
        docId,
        content,
        author: clone(user),
        savedAt: now(),
        seq: ++seq,
        baseRef: lastAccepted(docId)?.ref,
      };
      pending.get(docId).push(change);
      return clone(change);
    },

    acceptChanges: async (docId, opts = {}) => {
      const list = pending.get(docId) || [];
      if (list.length === 0) throw new Error("No pending changes to accept");
      let upTo = list[list.length - 1];
      if (opts.upToChangeId) {
        upTo = list.find((c) => c.id === opts.upToChangeId) || upTo;
      }
      const state = {
        id: nextId("acc"),
        docId,
        content: upTo.content,
        acceptedBy: clone(user),
        acceptedAt: now(),
        ref: `mem-${upTo.seq}`,
      };
      accepted.get(docId).push(state);
      // Clear pending changes through the accepted point; rebase any later ones.
      const idx = list.indexOf(upTo);
      pending.set(
        docId,
        list.slice(idx + 1).map((c) => ({ ...c, baseRef: state.ref }))
      );
      return clone(state);
    },
  };
}
