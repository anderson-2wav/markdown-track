// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveCutoff, makeCutoffFilter } from "../src/lib/history.js";

test("resolveCutoff accepts Date, ISO string, and epoch number", () => {
  const ms = Date.UTC(2026, 0, 1);
  assert.equal(resolveCutoff(new Date(ms)), ms);
  assert.equal(resolveCutoff("2026-01-01T00:00:00.000Z"), ms);
  assert.equal(resolveCutoff(ms), ms);
});

test("resolveCutoff returns null for nullish or unparseable values", () => {
  assert.equal(resolveCutoff(null), null);
  assert.equal(resolveCutoff(undefined), null);
  assert.equal(resolveCutoff("not a date"), null);
});

test("no cutoff → filter keeps everything", () => {
  const keep = makeCutoffFilter(null);
  assert.equal(keep("2000-01-01T00:00:00.000Z"), true);
  assert.equal(keep("2099-01-01T00:00:00.000Z"), true);
});

test("filter drops items before the cutoff and keeps the rest", () => {
  const keep = makeCutoffFilter("2026-01-01T00:00:00.000Z");
  assert.equal(keep("2025-12-31T23:59:59.999Z"), false);
  assert.equal(keep("2026-06-01T12:00:00.000Z"), true);
});

test("the cutoff is inclusive (an item exactly at the cutoff is kept)", () => {
  const at = "2026-01-01T00:00:00.000Z";
  assert.equal(makeCutoffFilter(at)(at), true);
});

test("items with an unparseable timestamp are kept (fail open)", () => {
  const keep = makeCutoffFilter("2026-01-01T00:00:00.000Z");
  assert.equal(keep("whenever"), true);
});
