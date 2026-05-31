// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
//
// Guards the TipTap <-> markdown seam (§11 top risk): markdown is the persisted
// format, so parse -> serialize must be STABLE (idempotent). Exact equality with
// the original input is not expected (tiptap-markdown normalizes bullets,
// spacing, etc.) — but a second round-trip must not drift further.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

let roundTrip;

before(async () => {
  const dom = new JSDOM("<!DOCTYPE html><body></body>", { pretendToBeVisual: true });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  // DOM constructors tiptap-markdown / ProseMirror reference as globals.
  for (const name of ["DOMParser", "Node", "Element", "HTMLElement", "Text", "DocumentFragment", "NodeList"]) {
    globalThis[name] = dom.window[name];
  }
  // Node 22 provides a read-only global `navigator`; ProseMirror is fine with it.

  const { Editor } = await import("@tiptap/core");
  const { editorExtensions, getMarkdown } = await import("../src/lib/editor.js");

  roundTrip = (md) => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const editor = new Editor({ element: el, extensions: editorExtensions(), content: md });
    const out = getMarkdown(editor);
    editor.destroy();
    el.remove();
    return out;
  };
});

test("serialization is idempotent (stable after first normalization)", () => {
  const md = [
    "# CritterTrack.org Phase 1 Priority List & Scope of Work",
    "",
    "A managed online markdown tool.",
    "",
    "## Workflow",
    "",
    "```mermaid",
    "graph TD",
    "  A[Edit] --> B[Save]",
    "```",
    "",
    "## Priorities",
    "",
    "- Library of editable documents",
    "- Pending changes per save",
    "",
    "Some **bold** and *italic* and a [link](https://example.com).",
    "",
  ].join("\n");

  const once = roundTrip(md);
  const twice = roundTrip(once);
  assert.equal(twice, once, "second round-trip must not drift");
});

test("preserves key structures (heading, list, mermaid fence, link)", () => {
  const md = "# Title\n\n- a\n- b\n\n```mermaid\ngraph TD\n  A-->B\n```\n\n[x](https://e.com)\n";
  const out = roundTrip(md);
  assert.match(out, /^# Title/m, "h1 preserved");
  assert.match(out, /^[-*] a/m, "list preserved");
  assert.match(out, /```mermaid[\s\S]*A-->B[\s\S]*```/, "mermaid fence + content preserved");
  assert.match(out, /\[x\]\(https:\/\/e\.com\)/, "link preserved");
});
