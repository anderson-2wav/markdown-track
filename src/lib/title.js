// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later

/**
 * Extract a display title from markdown.
 *
 * Returns the text of the document's level-1 heading IFF there is exactly one
 * (ignoring `#` lines inside fenced code blocks). Otherwise returns null, and
 * the UI falls back to the filename.
 *
 * @param {string} markdown
 * @returns {string|null}
 */
export function extractTitle(markdown) {
  if (typeof markdown !== "string") return null;

  const titles = [];
  let fence = null; // active code-fence marker ("`" or "~"), or null

  for (const raw of markdown.split("\n")) {
    const line = raw.replace(/\r$/, "");

    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      continue;
    }
    if (fence !== null) continue;

    // Level-1 ATX heading: a single '#', whitespace, text; trailing '#'s allowed.
    const h1 = line.match(/^#\s+(.+?)\s*#*\s*$/);
    if (h1 && h1[1].trim()) titles.push(h1[1].trim());
  }

  return titles.length === 1 ? titles[0] : null;
}
