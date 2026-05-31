// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Markdown } from "tiptap-markdown";

/**
 * TipTap extensions for the WYSIWYG editor. Markdown is the persisted format:
 * `tiptap-markdown` parses markdown content in and serializes markdown out, so
 * the editor never exposes raw markdown to the user but `.md` stays the source
 * of truth. Start minimal (StarterKit + Link); extend to cover real SoW syntax.
 */
export function editorExtensions() {
  return [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Markdown.configure({
      html: false,
      tightLists: true,
      breaks: false,
      transformPastedText: true,
      transformCopiedText: true,
    }),
  ];
}

/** Serialize the current editor document back to markdown. */
export function getMarkdown(editor) {
  return editor?.storage?.markdown?.getMarkdown?.() ?? "";
}
