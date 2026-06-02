// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { createMarkdownTrack } from "../src/config/createMarkdownTrack.js";
import { createInMemoryHooks } from "../src/config/inMemoryHooks.js";
import { emitTrackEvent, TRACK_EVENTS } from "../src/lib/events.js";

function setup(extra = {}) {
  const events = [];
  const raw = createInMemoryHooks({
    documents: [{ id: "d", filename: "Doc.md", content: "# Title\n\nv0\n" }],
    user: { id: "u1", email: "u1@example.com", name: "User One" },
  });
  const config = createMarkdownTrack({
    ...raw,
    onEvent: (e) => events.push(e),
    options: { library: "lib-x" },
    ...extra,
  });
  return { config, events };
}

test("onEvent is optional — config builds and emit is a no-op without it", () => {
  const raw = createInMemoryHooks({ documents: [] });
  const config = createMarkdownTrack(raw); // no onEvent
  assert.equal(config.hooks.onEvent, undefined);
  assert.equal(emitTrackEvent(config, TRACK_EVENTS.ENTER_LIBRARY), undefined);
});

test("a non-function onEvent is rejected", () => {
  const raw = createInMemoryHooks({ documents: [] });
  assert.throws(
    () => createMarkdownTrack({ ...raw, onEvent: "nope" }),
    /optional hook\(s\) must be functions: onEvent/
  );
});

test("emitTrackEvent builds the full payload and dispatches it", () => {
  const { config, events } = setup();
  const out = emitTrackEvent(config, TRACK_EVENTS.SELECT_DOCUMENT, { docId: "d" });

  assert.equal(events.length, 1);
  assert.deepEqual(events[0], out);
  assert.equal(out.action, "select-document");
  assert.equal(out.docId, "d");
  assert.equal(out.library, "lib-x");
  assert.equal(out.currentUser.id, "u1");
  assert.match(out.timestamp, /^\d{4}-\d{2}-\d{2}T.*Z$/);
});

test("library-scoped events carry a null docId", () => {
  const { config, events } = setup();
  emitTrackEvent(config, TRACK_EVENTS.ENTER_LIBRARY);
  assert.equal(events[0].docId, null);
  assert.equal(events[0].action, "enter-library");
});

test("a throwing onEvent never propagates", () => {
  const raw = createInMemoryHooks({ documents: [] });
  const config = createMarkdownTrack({
    ...raw,
    onEvent: () => { throw new Error("boom"); },
  });
  assert.doesNotThrow(() => emitTrackEvent(config, TRACK_EVENTS.LEAVE_LIBRARY));
});

test("a throwing getCurrentUser degrades to a null currentUser", () => {
  const raw = createInMemoryHooks({ documents: [] });
  const config = createMarkdownTrack({
    ...raw,
    getCurrentUser: () => { throw new Error("no session"); },
    onEvent: () => {},
  });
  const out = emitTrackEvent(config, TRACK_EVENTS.ENTER_LIBRARY);
  assert.equal(out.currentUser, null);
});
