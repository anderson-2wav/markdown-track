// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later
import { diffLines } from "diff";

/**
 * Line-level diff between two markdown texts (the source of truth). Returns a
 * flat list of `{ type: 'added'|'removed'|'context', text }` lines for a unified
 * view.
 *
 * @param {string} oldText
 * @param {string} newText
 * @returns {Array<{type: string, text: string}>}
 */
export function computeLineDiff(oldText, newText) {
  const parts = diffLines(oldText ?? "", newText ?? "");
  const lines = [];
  for (const part of parts) {
    const type = part.added ? "added" : part.removed ? "removed" : "context";
    const partLines = part.value.split("\n");
    // diffLines values end with a trailing newline -> drop the empty tail.
    if (partLines.length && partLines[partLines.length - 1] === "") partLines.pop();
    for (const text of partLines) lines.push({ type, text });
  }
  return lines;
}

/** Count added / removed lines in a computed diff. */
export function diffStats(lines) {
  let added = 0;
  let removed = 0;
  for (const l of lines) {
    if (l.type === "added") added += 1;
    else if (l.type === "removed") removed += 1;
  }
  return { added, removed };
}
