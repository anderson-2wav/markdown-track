// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeLineDiff, diffStats } from "../src/lib/diff.js";

test("identical text yields only context lines and zero stats", () => {
  const md = "# Title\n\nbody\n";
  const lines = computeLineDiff(md, md);
  assert.ok(lines.every((l) => l.type === "context"));
  assert.deepEqual(diffStats(lines), { added: 0, removed: 0 });
});

test("an added line shows as added", () => {
  const lines = computeLineDiff("a\nb\n", "a\nb\nc\n");
  const added = lines.filter((l) => l.type === "added");
  assert.equal(added.length, 1);
  assert.equal(added[0].text, "c");
  assert.deepEqual(diffStats(lines), { added: 1, removed: 0 });
});

test("a removed line shows as removed", () => {
  const lines = computeLineDiff("a\nb\nc\n", "a\nc\n");
  const removed = lines.filter((l) => l.type === "removed");
  assert.equal(removed.length, 1);
  assert.equal(removed[0].text, "b");
  assert.deepEqual(diffStats(lines), { added: 0, removed: 1 });
});

test("a changed line is one removed + one added", () => {
  const lines = computeLineDiff("hello world\n", "hello there\n");
  assert.deepEqual(diffStats(lines), { added: 1, removed: 1 });
});

test("handles empty old text (all added)", () => {
  const lines = computeLineDiff("", "x\ny\n");
  assert.deepEqual(diffStats(lines), { added: 2, removed: 0 });
});
