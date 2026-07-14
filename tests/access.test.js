// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractAccess } from "../src/lib/access.js";

test("returns null when there is no Access marker", () => {
  assert.equal(extractAccess("# Doc\n\nbody"), null);
});

test("parses a simple token list", () => {
  assert.deepEqual(
    extractAccess("# Doc\n\nbody\n\n<!-- Access: admin, projects_admin, sam@example.org -->\n"),
    ["admin", "projects_admin", "sam@example.org"]
  );
});

test("trims whitespace and drops empty tokens", () => {
  assert.deepEqual(extractAccess("<!-- Access:  a ,, b ,-->"), ["a", "b"]);
});

test("empty marker yields an empty array (not null)", () => {
  assert.deepEqual(extractAccess("body\n<!-- Access: -->\n"), []);
});

test("matches anywhere, not only the last line", () => {
  assert.deepEqual(extractAccess("<!-- Access: x -->\n\n# Doc\n\nmore"), ["x"]);
});

test("last marker wins when several appear", () => {
  assert.deepEqual(extractAccess("<!-- Access: a -->\n\n<!-- Access: b, c -->"), ["b", "c"]);
});

test("is case-insensitive on the Access keyword", () => {
  assert.deepEqual(extractAccess("<!-- access: a -->"), ["a"]);
});

test("ignores markers inside fenced code blocks", () => {
  const md = "# Doc\n\n```html\n<!-- Access: fake -->\n```\n\n<!-- Access: real -->\n";
  assert.deepEqual(extractAccess(md), ["real"]);
});

test("a marker only inside a fence yields null", () => {
  assert.equal(extractAccess("```\n<!-- Access: fake -->\n```\n"), null);
});

test("handles CRLF line endings", () => {
  assert.deepEqual(extractAccess("body\r\n<!-- Access: a, b -->\r\n"), ["a", "b"]);
});

test("non-string input returns null", () => {
  assert.equal(extractAccess(null), null);
  assert.equal(extractAccess(42), null);
});
