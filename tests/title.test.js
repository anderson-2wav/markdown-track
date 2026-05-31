// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractTitle } from "../src/lib/title.js";

test("returns the lone level-1 heading", () => {
  assert.equal(extractTitle("# Hello World\n\nbody"), "Hello World");
});

test("ignores level-2+ headings", () => {
  assert.equal(extractTitle("# Title\n## Section\n### Sub"), "Title");
});

test("returns null when there is no level-1 heading", () => {
  assert.equal(extractTitle("## Only a subsection\n\ntext"), null);
});

test("returns null when there are multiple level-1 headings", () => {
  assert.equal(extractTitle("# First\n\n# Second"), null);
});

test("ignores '#' lines inside fenced code blocks", () => {
  const md = "# Real Title\n\n```bash\n# not a heading\n```\n";
  assert.equal(extractTitle(md), "Real Title");
});

test("a '#' only inside a code fence yields no title", () => {
  const md = "```\n# fake\n```\n\nsome text";
  assert.equal(extractTitle(md), null);
});

test("strips trailing closing hashes", () => {
  assert.equal(extractTitle("# Title #\n"), "Title");
});

test("requires a space after the hash", () => {
  assert.equal(extractTitle("#NoSpace\n"), null);
});

test("non-string input returns null", () => {
  assert.equal(extractTitle(null), null);
  assert.equal(extractTitle(undefined), null);
  assert.equal(extractTitle(42), null);
});

test("handles CRLF line endings", () => {
  assert.equal(extractTitle("# Win Title\r\n\r\nbody"), "Win Title");
});

test("matches the real CritterTrack.md first heading", () => {
  const md = "# CritterTrack.org Phase 1 Priority List & Scope of Work\n\nVersion: 1.0.0\n\n## I. Priority List\n";
  assert.equal(extractTitle(md), "CritterTrack.org Phase 1 Priority List & Scope of Work");
});
