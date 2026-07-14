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

import { setAccessMarker } from "../src/lib/access.js";

test("setAccessMarker replaces an existing marker with normalized tokens", () => {
  const out = setAccessMarker("# Doc\n\nbody\n\n<!-- Access: old -->\n", ["a", "b"]);
  assert.deepEqual(extractAccess(out), ["a", "b"]);
  assert.equal((out.match(/<!--\s*Access:/gi) || []).length, 1); // exactly one marker
});

test("setAccessMarker(null) removes the marker", () => {
  const out = setAccessMarker("# Doc\n\nbody\n\n<!-- Access: a -->\n", null);
  assert.equal(extractAccess(out), null);
  assert.match(out, /# Doc/);
  assert.match(out, /body/);
});

test("setAccessMarker adds a marker when none existed, keeping the body", () => {
  const out = setAccessMarker("# Doc\n\nbody", ["a"]);
  assert.deepEqual(extractAccess(out), ["a"]);
  assert.match(out, /body/);
});

test("setAccessMarker does not touch a marker inside a fence", () => {
  const md = "# Doc\n\n```\n<!-- Access: fake -->\n```\n\n<!-- Access: real -->\n";
  const out = setAccessMarker(md, ["new"]);
  assert.deepEqual(extractAccess(out), ["new"]);
  assert.match(out, /<!-- Access: fake -->/); // the fenced example survives verbatim
});

test("setAccessMarker is idempotent for equal tokens", () => {
  const once = setAccessMarker("# Doc\n\nbody", ["a", "b"]);
  const twice = setAccessMarker(once, ["a", "b"]);
  assert.equal(twice, once);
});

import { enforceAccessMarker } from "../src/lib/access.js";

const BASE = "# Doc\n\nbody\n\n<!-- Access: admin -->\n";

test("no access change: passes draft through untouched", () => {
  const draft = "# Doc\n\nEDITED body\n\n<!-- Access: admin -->\n";
  const r = enforceAccessMarker(draft, BASE, false);
  assert.equal(r.reverted, false);
  assert.equal(r.content, draft);
});

test("token reorder is not a change", () => {
  const draft = "body\n\n<!-- Access: b, a -->\n";
  const base = "body\n\n<!-- Access: a, b -->\n";
  const r = enforceAccessMarker(draft, base, false);
  assert.equal(r.reverted, false);
});

test("disallowed access change: reverts the marker, keeps other edits", () => {
  const draft = "# Doc\n\nEDITED body\n\n<!-- Access: admin, sneaky@example.org -->\n";
  const r = enforceAccessMarker(draft, BASE, false);
  assert.equal(r.reverted, true);
  assert.deepEqual(extractAccess(r.content), ["admin"]); // reverted to baseline
  assert.match(r.content, /EDITED body/);               // prose edit preserved
});

test("disallowed removal of the marker is reverted", () => {
  const draft = "# Doc\n\nbody no marker\n";
  const r = enforceAccessMarker(draft, BASE, false);
  assert.equal(r.reverted, true);
  assert.deepEqual(extractAccess(r.content), ["admin"]);
});

test("allowed=true lets the access change through", () => {
  const draft = "body\n\n<!-- Access: new -->\n";
  const r = enforceAccessMarker(draft, BASE, true);
  assert.equal(r.reverted, false);
  assert.deepEqual(extractAccess(r.content), ["new"]);
});

test("adding a marker where baseline had none is reverted when disallowed", () => {
  const r = enforceAccessMarker("body\n\n<!-- Access: x -->\n", "body\n", false);
  assert.equal(r.reverted, true);
  assert.equal(extractAccess(r.content), null); // baseline had no marker
});

test("duplicate-token trick cannot drop a grantee (disallowed → reverted)", () => {
  const base = "body\n\n<!-- Access: admin, user -->\n";
  const draft = "body\n\n<!-- Access: admin, admin -->\n";
  const r = enforceAccessMarker(draft, base, false);
  assert.equal(r.reverted, true);
  assert.deepEqual(extractAccess(r.content).slice().sort(), ["admin", "user"]);
});

test("setAccessMarker preserves CRLF line endings", () => {
  const md = "# Doc\r\n\r\nbody\r\n\r\n<!-- Access: old -->\r\n";
  const out = setAccessMarker(md, ["a"]);
  assert.deepEqual(extractAccess(out), ["a"]);
  assert.ok(out.includes("\r\n"));
  assert.equal(out.replace(/\r\n/g, "").includes("\n"), false); // no lone LF remains
});

test("setAccessMarker keeps LF for LF input", () => {
  const out = setAccessMarker("# Doc\n\nbody", ["a"]);
  assert.equal(out.includes("\r"), false);
});

test("enforceAccessMarker revert preserves CRLF", () => {
  const base = "body\r\n\r\n<!-- Access: admin -->\r\n";
  const draft = "body EDITED\r\n\r\n<!-- Access: admin, sneaky -->\r\n";
  const r = enforceAccessMarker(draft, base, false);
  assert.equal(r.reverted, true);
  assert.deepEqual(extractAccess(r.content), ["admin"]);
  assert.ok(r.content.includes("\r\n"));
});
