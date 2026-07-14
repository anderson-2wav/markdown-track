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

/**
 * Remove every non-fenced Access marker line from the document.
 * @param {string} markdown
 * @returns {string}
 */
function stripAccessLines(markdown) {
  const kept = [];
  for (const { line, fenced } of linesWithFenceState(markdown)) {
    if (!fenced && ACCESS_LINE.test(line)) continue;
    kept.push(line);
  }
  return kept.join("\n");
}

/**
 * Return `markdown` with its Access marker set to `tokens`. Strips any existing
 * (non-fenced) markers first; `null` removes the marker. When tokens are given,
 * a single normalized marker is appended as the final line.
 * @param {string} markdown
 * @param {string[]|null} tokens
 * @returns {string}
 */
export function setAccessMarker(markdown, tokens) {
  const src = typeof markdown === "string" ? markdown : "";
  const eol = /\r\n/.test(src) ? "\r\n" : "\n";
  const body = stripAccessLines(src).replace(/\s+$/, "").split("\n").join(eol);
  if (tokens === null || tokens === undefined) {
    return body ? `${body}${eol}` : "";
  }
  const marker = `<!-- Access: ${tokens.join(", ")} -->`;
  return (body ? `${body}${eol}${eol}` : "") + `${marker}${eol}`;
}

/**
 * Set-equality for token lists; null (no marker) is distinct from [] (empty marker).
 * @param {string[]|null} a
 * @param {string[]|null} b
 * @returns {boolean}
 */
function accessEqual(a, b) {
  if (a === null || b === null) return a === b;
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((t, i) => t === sb[i]);
}

/**
 * Guard a save against unauthorized changes to the Access marker (decision #4).
 * @param {string} draft     the content the user is saving
 * @param {string} baseline  the content the edit started from (effective current)
 * @param {boolean} allowed  host's can('set-access', doc)
 * @returns {{ content: string, reverted: boolean }}
 */
export function enforceAccessMarker(draft, baseline, allowed) {
  const draftTokens = extractAccess(draft);
  const baseTokens = extractAccess(baseline);
  if (allowed || accessEqual(draftTokens, baseTokens)) {
    return { content: draft, reverted: false };
  }
  return { content: setAccessMarker(draft, baseTokens), reverted: true };
}
