// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later

/**
 * In-document access control marker parsing and rewriting.
 *
 * Grammar: a single `<!-- Access: t1, t2, … -->` HTML comment on its own line,
 * matched anywhere in the document but ignored inside fenced code blocks. If more
 * than one appears, the last wins. Tokens are opaque to this library — it only
 * splits and trims them; a host decides what they mean and who matches.
 */

const ACCESS_LINE = /^\s*<!--\s*Access:\s*(.*?)\s*-->\s*$/i;

// Yield each line paired with whether it is inside a fenced code block.
function* linesWithFenceState(markdown) {
  let fence = null; // active fence marker char ("`" or "~"), or null
  for (const raw of markdown.split("\n")) {
    const line = raw.replace(/\r$/, "");
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      yield { line, fenced: true };
      continue;
    }
    yield { line, fenced: fence !== null };
  }
}

function parseTokens(captured) {
  return captured.split(",").map((t) => t.trim()).filter(Boolean);
}

/**
 * @param {string} markdown
 * @returns {string[]|null} tokens (possibly empty) or null if no marker present.
 */
export function extractAccess(markdown) {
  if (typeof markdown !== "string") return null;
  let tokens = null;
  for (const { line, fenced } of linesWithFenceState(markdown)) {
    if (fenced) continue;
    const m = line.match(ACCESS_LINE);
    if (m) tokens = parseTokens(m[1]); // last wins
  }
  return tokens;
}
