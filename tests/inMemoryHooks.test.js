// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { createMarkdownTrack } from "../src/config/createMarkdownTrack.js";
import { createInMemoryHooks } from "../src/config/inMemoryHooks.js";

function setup() {
  const raw = createInMemoryHooks({
    documents: [{ id: "d", filename: "Doc.md", content: "# Title\n\nv0\n" }],
    clock: () => "2026-05-31T00:00:00.000Z",
  });
  return createMarkdownTrack(raw).hooks;
}

test("missing hooks throw", () => {
  assert.throws(() => createMarkdownTrack({}), /missing required hook/);
});

test("listDocuments derives the title from a lone H1", async () => {
  const h = setup();
  const [doc] = await h.listDocuments();
  assert.equal(doc.title, "Title");
  assert.equal(doc.filename, "Doc.md");
});

test("save appends pending changes with increasing seq", async () => {
  const h = setup();
  const a = await h.savePendingChange("d", { content: "# Title\n\nv1\n" });
  const b = await h.savePendingChange("d", { content: "# Title\n\nv2\n" });
  assert.equal(b.seq, a.seq + 1);
  assert.equal((await h.listPendingChanges("d")).length, 2);
});

test("accepting the latest pending clears pending and adds a baseline", async () => {
  const h = setup();
  await h.savePendingChange("d", { content: "# Title\n\nv1\n" });
  const p2 = await h.savePendingChange("d", { content: "# Title\n\nv2\n" });
  const state = await h.acceptChanges("d", { upToChangeId: p2.id });

  assert.equal(state.content, "# Title\n\nv2\n");
  assert.equal((await h.readAcceptedState("d")).content, "# Title\n\nv2\n");
  assert.equal((await h.listAcceptedStates("d")).length, 2);
  assert.equal((await h.listPendingChanges("d")).length, 0);
});

test("accepting an earlier pending rebases the later ones onto the new baseline", async () => {
  const h = setup();
  const p1 = await h.savePendingChange("d", { content: "# Title\n\nv1\n" });
  const p2 = await h.savePendingChange("d", { content: "# Title\n\nv2\n" });
  const state = await h.acceptChanges("d", { upToChangeId: p1.id });

  assert.equal((await h.readAcceptedState("d")).content, "# Title\n\nv1\n");
  const remaining = await h.listPendingChanges("d");
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, p2.id);
  assert.equal(remaining[0].baseRef, state.ref);
});

test("accepting with no pending throws", async () => {
  const h = setup();
  await assert.rejects(() => h.acceptChanges("d", {}), /No pending changes/);
});

test("listDocuments exposes access tokens from the accepted content", async () => {
  const hooks = createInMemoryHooks({
    documents: [
      { id: "a.md", filename: "a.md", content: "# A\n\n<!-- Access: admin -->\n" },
      { id: "b.md", filename: "b.md", content: "# B\n\nopen" },
    ],
  });
  const list = await hooks.listDocuments();
  const byId = Object.fromEntries(list.map((d) => [d.id, d]));
  assert.deepEqual(byId["a.md"].access, ["admin"]);
  assert.equal(byId["b.md"].access, undefined);
});

test("listDocuments access reflects the latest pending change (pending governs)", async () => {
  const hooks = createInMemoryHooks({
    documents: [{ id: "a.md", filename: "a.md", content: "# A\n\nopen" }],
  });
  await hooks.savePendingChange("a.md", { content: "# A\n\nopen\n\n<!-- Access: admin -->\n" });
  const [doc] = await hooks.listDocuments();
  assert.deepEqual(doc.access, ["admin"]);
});
