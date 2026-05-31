// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
import { marked } from "marked";

/**
 * Render markdown to HTML for read-only views (matches WILD's renderer).
 *
 * NOTE: output is injected via v-html by MarkdownRenderer. Content is authored
 * by trusted/semi-trusted users (SoW editors); a published deployment with
 * untrusted authors should sanitize (e.g. DOMPurify) — tracked as a follow-up.
 *
 * @param {string} md
 * @returns {string} HTML
 */
export function renderMarkdown(md) {
  if (typeof md !== "string" || md.length === 0) return "";
  return marked.parse(md, { gfm: true, breaks: false });
}
