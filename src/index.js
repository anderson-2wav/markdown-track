// Copyright (c) 2026 Anderson Wiese / 2wav, Inc. SPDX-License-Identifier: LGPL-3.0-or-later

// Public entry point for @2wav/markdown-track.
// UI components are re-exported here as they are built (Stage 1+).

export { default as MarkdownLibrary } from "./components/MarkdownLibrary.vue";

export { createMarkdownTrack, REQUIRED_HOOKS } from "./config/createMarkdownTrack.js";
export { createInMemoryHooks } from "./config/inMemoryHooks.js";
export { provideMarkdownTrack, useMarkdownTrack } from "./composables/useMarkdownTrack.js";
export { extractTitle } from "./lib/title.js";

// Styles are published separately as "@2wav/markdown-track/style.css".
// For in-repo development, import "src/styles/markdown-track.css" directly.
