// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later

// Lazy mermaid rendering for read-only views. `mermaid` is an OPTIONAL peer
// dependency: it is dynamically imported only when a rendered container actually
// contains a mermaid block, so diagram-free consumers never pay its bundle.
// Mirrors WILD's proven approach (scan for language-mermaid, swap each <pre> for
// a `.mermaid` div, then mermaid.run()).

let initialized = false;

/** Cheap check: does this markdown contain a mermaid fenced block? */
export function hasMermaid(markdown) {
  return typeof markdown === "string" && /(^|\n)\s*```mermaid\b/.test(markdown);
}

/**
 * Render any mermaid code blocks inside a rendered-HTML container into diagrams.
 * No-op (and no mermaid import) if the container has none.
 * @param {HTMLElement} container
 */
export async function renderMermaid(container) {
  if (!container) return;
  const blocks = container.querySelectorAll("pre code.language-mermaid");
  if (!blocks.length) return;

  let mermaid;
  try {
    mermaid = (await import("mermaid")).default;
  }
  catch (e) {
    console.warn("markdown-track: 'mermaid' is not installed; leaving diagrams as code.", e);
    return;
  }

  if (!initialized) {
    mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
    initialized = true;
  }

  for (const code of blocks) {
    const pre = code.closest("pre");
    if (!pre) continue;
    const div = document.createElement("div");
    div.className = "mermaid";
    div.textContent = code.textContent;
    pre.replaceWith(div);
  }

  try {
    await mermaid.run({ nodes: container.querySelectorAll(".mermaid") });
  }
  catch (e) {
    console.warn("markdown-track: mermaid render error", e);
  }
}
